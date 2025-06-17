// Пользователь
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'user' | 'guide' | 'admin';
  avatar?: string;
  phone?: string;
  isVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Тур
export interface Tour {
  id: string;
  title: string;
  description: string;
  price: number;
  duration: number;
  difficulty: 'easy' | 'moderate' | 'challenging' | 'hard';
  region: string;
  category?: string;
  mainImage: string;
  images?: string[];
  gallery: string[];
  maxParticipants: number;
  rating: number;
  reviewsCount: number;
  ratingCount?: number;
  availableDates: string[];
  isActive?: boolean;
  itinerary: {
    day: number;
    title: string;
    description: string;
  }[];
  included: string[];
  notIncluded: string[];
  requirements: string[];
  guide: User;
}

// День маршрута
export interface DayItinerary {
  day: number;
  description: string;
  activities?: string[];
  meals?: string[];
  accommodation?: string;
}

// Местоположение
export interface Location {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
  address?: string;
  description?: string;
}

// Бронирование
export interface Booking {
  id: string;
  tourId: string;
  userId: string;
  startDate: string;
  endDate?: string;
  participants: number;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  specialRequests?: string;
  createdAt: string;
  updatedAt?: string;
  tour?: Tour;
  user?: User;
}

// Отзыв
export interface Review {
  id: string;
  tourId: string;
  userId?: string;
  user: User;
  rating: number;
  title?: string;
  comment: string;
  createdAt: string;
}

// Аутентификация
export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

// API Response
export interface ApiResponse<T = any> {
  status: 'success' | 'error';
  data?: T;
  message?: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

// Фильтры для поиска туров
export interface TourFilters {
  search?: string;
  category?: string;
  region?: string;
  difficulty?: string;
  minPrice?: number;
  maxPrice?: number;
  page: number;
  limit: number;
}

// Пагинация
export interface Pagination {
  total: number;
  page: number;
  pages: number;
}

export interface PaginatedResponse<T> {
  status: 'success' | 'error';
  data: {
    data: T[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
  message?: string;
}

export interface SimplePaginatedResponse<T> {
  status: 'success' | 'error';
  data: {
    data: T[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
  message?: string;
} 