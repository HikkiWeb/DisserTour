const { GoogleGenerativeAI } = require('@google/generative-ai');
const config = require('../config/config');

class GeminiService {
  constructor() {
    if (!config.gemini.apiKey) {
      throw new Error('GEMINI_API_KEY не найден в переменных окружения');
    }
    this.genAI = new GoogleGenerativeAI(config.gemini.apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  }

  // Создание контекста для туристического ассистента
  createTourismContext(userPreferences = {}, availableTours = []) {
    return `
Ты - виртуальный туристический консультант для Казахстана на платформе "Nomad Route". 
Твоя цель - помочь путешественникам открыть красоту Казахстана и найти идеальные туры.

ТВОЯ РОЛЬ:
- Дружелюбный эксперт по туризму в Казахстане
- Знаешь все о достопримечательностях, культуре, истории Казахстана
- Помогаешь выбрать туры, планировать маршруты
- Даешь практические советы для путешествий

ДОСТУПНЫЕ ТУРЫ:
${availableTours.map(tour => `
- ${tour.title} (${tour.price}₽)
  Регион: ${tour.region}
  Длительность: ${tour.duration} дней
  Описание: ${tour.description}
  Рейтинг: ${tour.rating || 'Нет оценок'}
`).join('\n')}

ПРЕДПОЧТЕНИЯ ПОЛЬЗОВАТЕЛЯ:
${Object.entries(userPreferences).map(([key, value]) => `${key}: ${value}`).join('\n')}

ПРАВИЛА ОБЩЕНИЯ:
- Отвечай на русском языке
- Будь дружелюбным и профессиональным
- Используй эмодзи для большей выразительности
- Давай конкретные рекомендации с указанием цен
- Если не знаешь точную информацию - честно скажи об этом
- Предлагай альтернативы если запрошенное недоступно
- Используй факты о Казахстане для обогащения ответов
`;
  }

  // Генерация ответа от AI ассистента
  async generateResponse(message, context = '', chatHistory = []) {
    try {
      // Создаем полный контекст для разговора
      const fullContext = `
${context}

ИСТОРИЯ РАЗГОВОРА:
${chatHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n')}

НОВОЕ СООБЩЕНИЕ ПОЛЬЗОВАТЕЛЯ: ${message}

Отвечай естественно, учитывая контекст разговора. Если пользователь спрашивает о турах, 
предлагай конкретные варианты из доступных туров.
`;

      const result = await this.model.generateContent(fullContext);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Ошибка при генерации ответа Gemini:', error);
      throw new Error('Не удалось получить ответ от AI ассистента');
    }
  }

  // Анализ интентов пользователя
  async analyzeIntent(message) {
    try {
      const prompt = `
Проанализируй сообщение пользователя и определи его намерение:

Сообщение: "${message}"

Возможные интенты:
- tour_search (поиск туров)
- tour_info (информация о конкретном туре)
- destination_info (информация о направлении)
- price_inquiry (вопросы о ценах)
- booking_help (помощь с бронированием)
- general_info (общая информация о Казахстане)
- planning_help (помощь в планировании поездки)
- other (другое)

Верни только название интента одним словом.
`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text().trim().toLowerCase();
    } catch (error) {
      console.error('Ошибка при анализе интента:', error);
      return 'other';
    }
  }

  // Генерация предложений быстрых вопросов
  async generateQuickQuestions(userContext = {}) {
    try {
      const prompt = `
Сгенерируй 4 кратких вопроса-предложения для туристического чата-бота по Казахстану.
Вопросы должны быть актуальными, полезными и разнообразными.

Примеры контекста пользователя: ${JSON.stringify(userContext)}

Верни ответ в формате JSON массива строк:
["вопрос 1", "вопрос 2", "вопрос 3", "вопрос 4"]

Вопросы должны быть короткими (не более 50 символов) и покрывать разные аспекты:
- Поиск туров
- Информация о городах
- Практические советы
- Культурные особенности
`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text().trim();
      
      try {
        return JSON.parse(text);
      } catch {
        // Если JSON не распарсился, возвращаем стандартные вопросы
        return [
          "🏔️ Лучшие природные туры",
          "🏛️ Культурные достопримечательности",
          "💰 Бюджетные варианты туров",
          "🗺️ Помощь в планировании маршрута"
        ];
      }
    } catch (error) {
      console.error('Ошибка при генерации быстрых вопросов:', error);
      return [
        "🏔️ Лучшие природные туры",
        "🏛️ Культурные достопримечательности", 
        "💰 Бюджетные варианты туров",
        "🗺️ Помощь в планировании маршрута"
      ];
    }
  }

  // Генерация персонализированных рекомендаций
  async generatePersonalizedRecommendations(userProfile, availableTours, preferences = {}) {
    try {
      const prompt = `
На основе профиля пользователя и его предпочтений, предложи 3 наиболее подходящих тура из доступных.

ПРОФИЛЬ ПОЛЬЗОВАТЕЛЯ:
${JSON.stringify(userProfile, null, 2)}

ПРЕДПОЧТЕНИЯ:
${JSON.stringify(preferences, null, 2)}

ДОСТУПНЫЕ ТУРЫ:
${JSON.stringify(availableTours, null, 2)}

Верни рекомендации в формате JSON:
{
  "recommendations": [
    {
      "tourId": "id тура",
      "reason": "краткое объяснение почему этот тур подходит",
      "matchScore": число от 1 до 10
    }
  ]
}
`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text().trim();
      
      try {
        return JSON.parse(text);
      } catch {
        return { recommendations: [] };
      }
    } catch (error) {
      console.error('Ошибка при генерации рекомендаций:', error);
      return { recommendations: [] };
    }
  }
}

module.exports = new GeminiService(); 