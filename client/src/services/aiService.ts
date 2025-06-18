import { apiService } from './api';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface QuickQuestion {
  text: string;
  icon?: string;
}

export interface AIResponse {
  response: string;
  intent?: string;
  quickQuestions?: string[];
  suggestedTours?: any[];
}

export interface PersonalizedRecommendation {
  tourId: string;
  reason: string;
  matchScore: number;
  tour?: any;
}

export interface RecommendationsResponse {
  recommendations: PersonalizedRecommendation[];
}

class AIService {
  // Отправить сообщение AI ассистенту
  async sendMessage(
    message: string, 
    chatHistory: ChatMessage[] = [], 
    userPreferences: Record<string, any> = {}
  ): Promise<AIResponse> {
    try {
      console.log('🚀 Отправляем сообщение к AI:', { message, chatHistory: chatHistory.length, userPreferences });
      const response = await apiService.sendAIMessage({
        message,
        chatHistory,
        userPreferences
      });
      console.log('📨 Получен ответ от API:', response);
      return response.data || response;
    } catch (error: any) {
      console.error('❌ Ошибка в aiService.sendMessage:', error);
      throw new Error(error.response?.data?.message || error.message || 'Ошибка при отправке сообщения');
    }
  }

  // Получить персонализированные рекомендации
  async getPersonalizedRecommendations(preferences: Record<string, any> = {}): Promise<RecommendationsResponse> {
    try {
      const response = await apiService.getAIRecommendations(preferences);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Ошибка при получении рекомендаций');
    }
  }

  // Получить быстрые вопросы
  async getQuickQuestions(context: Record<string, any> = {}): Promise<string[]> {
    try {
      const response = await apiService.getAIQuickQuestions(context);
      return response.data.questions;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Ошибка при получении быстрых вопросов');
    }
  }

  // Анализ намерений пользователя
  async analyzeIntent(message: string): Promise<string> {
    try {
      const response = await apiService.analyzeAIIntent(message);
      return response.data.intent;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Ошибка при анализе намерений');
    }
  }

  // Проверить статус AI сервиса
  async getStatus(): Promise<{ aiServiceActive: boolean; timestamp: string; error?: string }> {
    try {
      const response = await apiService.getAIStatus();
      return response.data;
    } catch (error: any) {
      return {
        aiServiceActive: false,
        timestamp: new Date().toISOString(),
        error: error.response?.data?.message || 'Сервис недоступен'
      };
    }
  }
}

export default new AIService(); 