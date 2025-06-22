const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// API Response Types
interface ApiResponse<T> {
  status: 'success' | 'error';
  message?: string;
  data?: T;
}

interface SimplePaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pages: number;
    total: number;
    limit: number;
  };
}

interface LoginResponse {
  user: any;
  token: string;
}

class ApiService {
  private baseURL = API_BASE_URL;
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    // Если body — FormData, не добавляем Content-Type вообще
    let headers: Record<string, string> = {};
    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }
    headers = {
      ...headers,
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      console.log('Отправка запроса:', { url, method: options.method, headers });
      
      const response = await fetch(url, {
        ...options,
        headers,
      });

      console.log('Получен ответ:', { status: response.status, statusText: response.statusText });

      const data = await response.json();
      console.log('Данные ответа:', data);

      if (!response.ok) {
        throw {
          response: {
            data: data
          },
          message: data.message || `HTTP error! status: ${response.status}`
        };
      }

      return data;
    } catch (error: any) {
      console.error('API request failed:', { url, error });
      // Если это уже обработанная ошибка, передаем как есть
      if (error.response) {
      throw error;
      }
      // Иначе оборачиваем в стандартный формат
      throw {
        response: {
          data: {
            message: error.message || 'Ошибка сети'
          }
        },
        message: error.message || 'Ошибка сети'
      };
    }
  }

  // Authentication
  setToken(token: string) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('token');
  }

  async login(email: string, password: string): Promise<ApiResponse<LoginResponse>> {
    return this.request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }): Promise<ApiResponse<LoginResponse>> {
    return this.request<LoginResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async forgotPassword(email: string): Promise<ApiResponse<{ message: string }>> {
    return this.request<{ message: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(token: string, password: string): Promise<ApiResponse<{ message: string }>> {
    return this.request<{ message: string }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    });
  }

  async getCurrentUser(): Promise<ApiResponse<{ user: any }>> {
    return this.request<{ user: any }>('/auth/me');
  }

  // Tours
  async getTours(params?: {
    page?: number;
    limit?: number;
    region?: string;
    minPrice?: number;
    maxPrice?: number;
    difficulty?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    search?: string;
    category?: string;
  }): Promise<ApiResponse<{ tours: any[], pagination: any }>> {
    const queryParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          // Не добавляем экстремальные значения цены
          if (key === 'maxPrice' && (value as number) >= 1000000) return;
          if (key === 'minPrice' && (value as number) <= 0) return;
          queryParams.append(key, value.toString());
        }
      });
    }

    const endpoint = `/tours${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.request<{ tours: any[], pagination: any }>(endpoint);
  }

  async getTourById(id: string): Promise<ApiResponse<{ tour: any }>> {
    return this.request<{ tour: any }>(`/tours/${id}`);
  }

  async getTourReviews(tourId: string): Promise<ApiResponse<SimplePaginatedResponse<any>>> {
    return this.request<SimplePaginatedResponse<any>>(`/reviews/tour/${tourId}`);
  }

  async getPopularTours(): Promise<ApiResponse<{ tours: any[] }>> {
    return this.request<{ tours: any[] }>('/tours/popular');
  }

  async getSeasonalRecommendations(): Promise<ApiResponse<{ tours: any[] }>> {
    return this.request<{ tours: any[] }>('/tours/seasonal');
  }

  // Bookings
  async createBooking(bookingData: {
    tourId: string;
    startDate: string;
    participants: number;
    specialRequests?: string;
  }): Promise<ApiResponse<any>> {
    return this.request<any>('/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    });
  }

  async getMyBookings(): Promise<ApiResponse<{ bookings: any[], pagination: any }>> {
    return this.request<{ bookings: any[], pagination: any }>('/bookings/my');
  }

  async cancelBooking(bookingId: string, reason: string): Promise<ApiResponse<any>> {
    console.log('Отправка запроса на отмену бронирования:', { bookingId, reason });
    try {
      const result = await this.request<any>(`/bookings/${bookingId}/cancel`, {
        method: 'PUT',
        body: JSON.stringify({ reason }),
      });
      console.log('Результат отмены бронирования:', result);
      return result;
    } catch (error) {
      console.error('Ошибка в cancelBooking API:', error);
      throw error;
    }
  }

  async updateBookingStatus(bookingId: string, status: string): Promise<ApiResponse<any>> {
    return this.request<any>(`/bookings/${bookingId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  // User Profile
  async updateProfile(userData: any): Promise<ApiResponse<{ user: any }>> {
    const isFormData = userData instanceof FormData;
    
    return this.request<{ user: any }>('/auth/profile', {
      method: 'PUT',
      headers: isFormData ? {} : { 'Content-Type': 'application/json' },
      body: isFormData ? userData : JSON.stringify(userData),
    });
  }

  async uploadAvatar(formData: FormData): Promise<ApiResponse<{ user: any }>> {
    return this.request<{ user: any }>('/auth/upload-avatar', {
      method: 'POST',
      body: formData,
    });
  }

  async changePassword(passwordData: {
    currentPassword: string;
    newPassword: string;
  }): Promise<ApiResponse<any>> {
    return this.request<any>('/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify(passwordData),
    });
  }

  async getMyReviews(): Promise<ApiResponse<{ reviews: any[], pagination: any }>> {
    return this.request<{ reviews: any[], pagination: any }>('/reviews/my');
  }

  async getUserStats(): Promise<ApiResponse<any>> {
    return this.request<any>('/auth/stats');
  }

  // Admin Methods
  async getUsers(): Promise<ApiResponse<SimplePaginatedResponse<any>>> {
    return this.request<SimplePaginatedResponse<any>>('/admin/users');
  }

  async getAdminTours(): Promise<ApiResponse<SimplePaginatedResponse<any>>> {
    return this.request<SimplePaginatedResponse<any>>('/admin/tours');
  }

  async getAllBookings(): Promise<ApiResponse<SimplePaginatedResponse<any>>> {
    return this.request<SimplePaginatedResponse<any>>('/admin/bookings');
  }

  async getAdminReviews(): Promise<ApiResponse<SimplePaginatedResponse<any>>> {
    return this.request<SimplePaginatedResponse<any>>('/admin/reviews');
  }

  async getDashboardStats(): Promise<ApiResponse<any>> {
    return this.request<any>('/admin/stats');
  }



  async createTour(tourData: any): Promise<ApiResponse<any>> {
    return this.request<any>('/tours', {
      method: 'POST',
      body: JSON.stringify(tourData),
    });
  }

  async updateTour(tourId: string, tourData: any): Promise<ApiResponse<any>> {
    return this.request<any>(`/tours/${tourId}`, {
      method: 'PUT',
      body: JSON.stringify(tourData),
    });
  }

  async deleteTour(tourId: string): Promise<ApiResponse<any>> {
    return this.request<any>(`/tours/${tourId}`, {
      method: 'DELETE',
    });
  }

  // Reviews
  async createReview(reviewData: {
    tourId: string;
    rating: number;
    comment: string;
  }): Promise<ApiResponse<any>> {
    return this.request<any>('/reviews', {
      method: 'POST',
      body: JSON.stringify(reviewData),
    });
  }

  async updateReview(reviewId: string, reviewData: {
    rating: number;
    comment: string;
  }): Promise<ApiResponse<any>> {
    return this.request<any>(`/reviews/${reviewId}`, {
      method: 'PUT',
      body: JSON.stringify(reviewData),
    });
  }

  async deleteReview(reviewId: string): Promise<ApiResponse<any>> {
    return this.request<any>(`/reviews/${reviewId}`, {
      method: 'DELETE',
    });
  }

  // Admin Methods
  async updateUserRole(userId: string, role: string): Promise<ApiResponse<any>> {
    return this.request<any>(`/admin/users/${userId}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    });
  }

  async deleteUser(userId: string): Promise<ApiResponse<any>> {
    return this.request<any>(`/admin/users/${userId}`, {
      method: 'DELETE',
    });
  }

  // Админские CRUD операции
  // Пользователи
  async createUser(userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: string;
    phone?: string;
  }): Promise<ApiResponse<any>> {
    return this.request<any>('/admin/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    });
  }

  async updateUser(userId: string, userData: any): Promise<ApiResponse<any>> {
    return this.request<any>(`/admin/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  // Туры
  async createAdminTour(tourData: FormData | {
    title: string;
    description: string;
    shortDescription?: string;
    price: number;
    duration: number;
    maxGroupSize: number;
    difficulty: string;
    category: string;
    region: string;
    season: string[];
    startLocation?: any;
    locations?: any[];
    itinerary?: any[];
    included?: string[];
    excluded?: string[];
    requirements?: string[];
    tags?: string[];
  }): Promise<ApiResponse<any>> {
    const isFormData = tourData instanceof FormData;
    
    return this.request<any>('/admin/tours', {
      method: 'POST',
      headers: isFormData ? {
        'Content-Type': 'multipart/form-data'
      } : {
        'Content-Type': 'application/json'
      },
      body: isFormData ? tourData : JSON.stringify(tourData)
    });
  }

  async updateAdminTour(tourId: string, tourData: any): Promise<ApiResponse<any>> {
    return this.request<any>(`/admin/tours/${tourId}`, {
      method: 'PUT',
      body: JSON.stringify(tourData),
    });
  }

  async deleteAdminTour(tourId: string): Promise<ApiResponse<any>> {
    return this.request<any>(`/admin/tours/${tourId}`, {
      method: 'DELETE',
    });
  }

  async uploadTourImages(tourId: string, formData: FormData): Promise<ApiResponse<any>> {
    return this.request<any>(`/admin/tours/${tourId}/images`, {
      method: 'POST',
      headers: {}, // Не устанавливаем Content-Type для FormData
      body: formData,
    });
  }

  async deleteTourImage(tourId: string, imageUrl: string): Promise<ApiResponse<any>> {
    return this.request<any>(`/admin/tours/${tourId}/images`, {
      method: 'DELETE',
      body: JSON.stringify({ imageUrl }),
    });
  }

  async updateTourImages(tourId: string, images: string[]): Promise<ApiResponse<any>> {
    return this.request<any>(`/admin/tours/${tourId}/images`, {
      method: 'PUT',
      body: JSON.stringify({ images }),
    });
  }

  // Бронирования
  async updateBookingStatusAdmin(bookingId: string, status: string): Promise<ApiResponse<any>> {
    return this.request<any>(`/admin/bookings/${bookingId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  async deleteBooking(bookingId: string): Promise<ApiResponse<any>> {
    return this.request<any>(`/admin/bookings/${bookingId}`, {
      method: 'DELETE',
    });
  }

  // Отзывы
  async deleteAdminReview(reviewId: string): Promise<ApiResponse<any>> {
    return this.request<any>(`/admin/reviews/${reviewId}`, {
      method: 'DELETE',
    });
  }

  async respondToReview(reviewId: string, response: string): Promise<ApiResponse<any>> {
    return this.request<any>(`/admin/reviews/${reviewId}/response`, {
      method: 'PUT',
      body: JSON.stringify({ response }),
    });
  }

  // AI Assistant methods
  async sendAIMessage(data: {
    message: string;
    chatHistory?: any[];
    userPreferences?: any;
  }): Promise<ApiResponse<any>> {
    return this.request<any>('/ai/chat', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getAIRecommendations(preferences: any = {}): Promise<ApiResponse<any>> {
    return this.request<any>('/ai/recommendations', {
      method: 'POST',
      body: JSON.stringify({ preferences }),
    });
  }

  async getAIQuickQuestions(context: any = {}): Promise<ApiResponse<any>> {
    const queryParams = new URLSearchParams();
    queryParams.append('context', JSON.stringify(context));
    return this.request<any>(`/ai/quick-questions?${queryParams.toString()}`);
  }

  async analyzeAIIntent(message: string): Promise<ApiResponse<any>> {
    return this.request<any>('/ai/analyze-intent', {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  }

  async getAIStatus(): Promise<ApiResponse<any>> {
    return this.request<any>('/ai/status');
  }
}

export const apiService = new ApiService(); 