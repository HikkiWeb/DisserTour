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
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

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
      console.error('API request failed:', error);
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
  }): Promise<ApiResponse<SimplePaginatedResponse<any>>> {
    const queryParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const endpoint = `/tours${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.request<SimplePaginatedResponse<any>>(endpoint);
  }

  async getTourById(id: string): Promise<ApiResponse<{ tour: any }>> {
    return this.request<{ tour: any }>(`/tours/${id}`);
  }

  async getTourReviews(tourId: string): Promise<ApiResponse<SimplePaginatedResponse<any>>> {
    return this.request<SimplePaginatedResponse<any>>(`/tours/${tourId}/reviews`);
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

  async getMyBookings(): Promise<ApiResponse<SimplePaginatedResponse<any>>> {
    return this.request<SimplePaginatedResponse<any>>('/bookings/my');
  }

  async cancelBooking(bookingId: string, reason: string): Promise<ApiResponse<any>> {
    return this.request<any>(`/bookings/${bookingId}/cancel`, {
      method: 'PUT',
      body: JSON.stringify({ reason }),
    });
  }

  async updateBookingStatus(bookingId: string, status: string): Promise<ApiResponse<any>> {
    return this.request<any>(`/bookings/${bookingId}/status`, {
      method: 'PUT',
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
      method: 'POST',
      body: JSON.stringify(passwordData),
    });
  }

  async getMyReviews(): Promise<ApiResponse<SimplePaginatedResponse<any>>> {
    return this.request<SimplePaginatedResponse<any>>('/reviews/my');
  }

  async getUserStats(): Promise<ApiResponse<any>> {
    return this.request<any>('/auth/stats');
  }

  // Admin/Guide Methods
  async getUsers(): Promise<ApiResponse<SimplePaginatedResponse<any>>> {
    return this.request<SimplePaginatedResponse<any>>('/admin/users');
  }

  async getGuideTours(): Promise<ApiResponse<SimplePaginatedResponse<any>>> {
    return this.request<SimplePaginatedResponse<any>>('/guide/tours');
  }

  async getGuideBookings(): Promise<ApiResponse<SimplePaginatedResponse<any>>> {
    return this.request<SimplePaginatedResponse<any>>('/guide/bookings');
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

  async getAllBookings(): Promise<ApiResponse<SimplePaginatedResponse<any>>> {
    return this.request<SimplePaginatedResponse<any>>('/admin/bookings');
  }

  async getDashboardStats(): Promise<ApiResponse<any>> {
    return this.request<any>('/admin/stats');
  }

  // Админские CRUD операции
  // Пользователи
  async createUser(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role?: string;
    phone?: string;
  }): Promise<ApiResponse<any>> {
    return this.request<any>('/admin/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async updateUser(userId: string, userData: any): Promise<ApiResponse<any>> {
    return this.request<any>(`/admin/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  // Туры
  async getAdminTours(): Promise<ApiResponse<SimplePaginatedResponse<any>>> {
    return this.request<SimplePaginatedResponse<any>>('/admin/tours');
  }

  async createAdminTour(tourData: {
    title: string;
    description: string;
    shortDescription?: string;
    price: number;
    duration: number;
    maxGroupSize?: number;
    difficulty?: string;
    category?: string;
    region: string;
    season?: string;
    guideId?: string;
    startLocation?: string;
    locations?: string[];
    itinerary?: string[];
    included?: string[];
    excluded?: string[];
    requirements?: string[];
    tags?: string[];
  }): Promise<ApiResponse<any>> {
    return this.request<any>('/admin/tours', {
      method: 'POST',
      body: JSON.stringify(tourData),
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
  async getAdminReviews(): Promise<ApiResponse<SimplePaginatedResponse<any>>> {
    return this.request<SimplePaginatedResponse<any>>('/admin/reviews');
  }

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

  // Получить всех гидов для выпадающего списка
  async getGuides(): Promise<ApiResponse<{ guides: any[] }>> {
    return this.request<{ guides: any[] }>('/users?role=guide');
  }
}

export const apiService = new ApiService(); 