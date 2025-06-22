import { useState, useCallback, useRef, useEffect } from 'react';
import aiService, { ChatMessage, AIResponse } from '../services/aiService';
import { useAuth } from '../context/AuthContext';

interface UseChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  isTyping: boolean;
  error: string | null;
  quickQuestions: string[];
  isServiceAvailable: boolean;
}

interface UseChatActions {
  sendMessage: (message: string) => Promise<void>;
  clearChat: () => void;
  refreshQuickQuestions: () => Promise<void>;
  checkServiceStatus: () => Promise<void>;
  addUserMessage: (message: string) => void;
}

export function useAIChat(): UseChatState & UseChatActions {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quickQuestions, setQuickQuestions] = useState<string[]>([]);
  const [isServiceAvailable, setIsServiceAvailable] = useState(true);
  
  // Таймер для эффекта печатания
  const typingTimer = useRef<NodeJS.Timeout | null>(null);
  // Флаг для предотвращения множественных запросов
  const isRefreshingQuestions = useRef(false);
  const isCheckingStatus = useRef(false);

  // Функция для добавления сообщения пользователя
  const addUserMessage = useCallback((content: string) => {
    const userMessage: ChatMessage = {
      role: 'user',
      content,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
  }, []);

  // Функция для добавления ответа ассистента с эффектом печатания
  const addAssistantMessage = useCallback((content: string) => {
    setIsTyping(true);
    
    // Имитируем задержку печатания
    const delay = Math.min(content.length * 20, 2000); // Максимум 2 секунды
    
    typingTimer.current = setTimeout(() => {
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
    }, delay);
  }, []);

  // Обновление быстрых вопросов с защитой от частых вызовов
  const refreshQuickQuestions = useCallback(async () => {
    // Предотвращаем множественные одновременные запросы
    if (isRefreshingQuestions.current) {
      return;
    }
    
    isRefreshingQuestions.current = true;
    
    try {
      const context = {
        currentPage: window.location.pathname,
        isAuthenticated: !!user,
        chatLength: messages.length
      };
      
      const questions = await aiService.getQuickQuestions(context);
      setQuickQuestions(questions);
    } catch (err) {
      console.error('Ошибка получения быстрых вопросов:', err);
      // Используем стандартные вопросы при ошибке
      setQuickQuestions([
        "🏔️ Лучшие природные туры",
        "🏛️ Культурные достопримечательности",
        "💰 Бюджетные варианты туров",
        "🗺️ Помощь в планировании маршрута"
      ]);
    } finally {
      isRefreshingQuestions.current = false;
    }
  }, [user, messages.length]);

  // Проверка статуса AI сервиса с защитой от частых вызовов
  const checkServiceStatus = useCallback(async () => {
    // Предотвращаем множественные одновременные запросы
    if (isCheckingStatus.current) {
      return;
    }
    
    isCheckingStatus.current = true;
    
    try {
      const status = await aiService.getStatus();
      setIsServiceAvailable(status.aiServiceActive);
      
      if (!status.aiServiceActive) {
        setError('AI ассистент временно недоступен');
      }
    } catch (err) {
      setIsServiceAvailable(false);
      console.error('Ошибка проверки статуса AI:', err);
    } finally {
      isCheckingStatus.current = false;
    }
  }, []);

  // Отправка сообщения AI ассистенту
  const sendMessage = useCallback(async (message: string) => {
    if (!message.trim() || isLoading) return;

    console.log('🎯 useAIChat.sendMessage вызван:', message);
    setError(null);
    setIsLoading(true);

    try {
      // Добавляем сообщение пользователя
      console.log('➕ Добавляем сообщение пользователя');
      addUserMessage(message);

      // Получаем предпочтения пользователя
      const userPreferences = {
        userId: user?.id,
        userName: user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : undefined,
        isAuthenticated: !!user,
        currentPage: window.location.pathname
      };
      console.log('👤 Предпочтения пользователя:', userPreferences);

      // Отправляем запрос к AI
      console.log('🤖 Отправляем к AI сервису...');
      const response: AIResponse = await aiService.sendMessage(
        message,
        messages,
        userPreferences
      );
      console.log('✅ Получен ответ от AI:', response);

      // Добавляем ответ ассистента
      console.log('💬 Добавляем ответ ассистента');
      addAssistantMessage(response.response);

      // Обновляем быстрые вопросы, если получили новые
      if (response.quickQuestions && response.quickQuestions.length > 0) {
        console.log('❓ Обновляем быстрые вопросы:', response.quickQuestions);
        setQuickQuestions(response.quickQuestions);
      }

    } catch (err: any) {
      console.error('❌ Ошибка в useAIChat.sendMessage:', err);
      setError(err.message || 'Произошла ошибка при отправке сообщения');
    } finally {
      setIsLoading(false);
    }
  }, [messages, user, isLoading, addUserMessage, addAssistantMessage]);

  // Очистка чата
  const clearChat = useCallback(() => {
    setMessages([]);
    setError(null);
    setIsTyping(false);
    if (typingTimer.current) {
      clearTimeout(typingTimer.current);
    }
    refreshQuickQuestions();
  }, [refreshQuickQuestions]);

  // Проверка статуса сервиса при инициализации с задержкой
  useEffect(() => {
    // Задержка для предотвращения множественных запросов при быстрых ре-рендерах
    const timer = setTimeout(() => {
      checkServiceStatus();
      refreshQuickQuestions();
    }, 100);
    
    return () => clearTimeout(timer);
  }, []); // Убираем зависимости, чтобы эффект выполнялся только один раз

  // Очистка таймера при размонтировании
  useEffect(() => {
    return () => {
      if (typingTimer.current) {
        clearTimeout(typingTimer.current);
      }
    };
  }, []);

  return {
    // Состояние
    messages,
    isLoading,
    isTyping,
    error,
    quickQuestions,
    isServiceAvailable,
    
    // Действия
    sendMessage,
    clearChat,
    refreshQuickQuestions,
    checkServiceStatus,
    addUserMessage
  };
} 