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
  shortDescription?: string;
  price: number;
  duration: number;
  maxGroupSize: number;
  difficulty: 'easy' | 'moderate' | 'challenging' | 'hard';
  category: string;
  region: string;
  season: string[];
  images: string[];
  itinerary?: any; // JSONB поле
  included: string[];
  excluded: string[];
  requirements: string[];
  rating: number;
  ratingCount: number;
  isActive: boolean;
  guideId?: string;
  startLocation?: any; // JSONB поле
  locations: any[]; // ARRAY(JSONB)
  tags: string[];
  createdAt?: string;
  updatedAt?: string;
  guide?: User;
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

// Тип для создания/редактирования тура
export interface TourFormData {
  title: string;
  description: string;
  shortDescription: string;
  price: number;
  duration: number;
  maxGroupSize: number;
  difficulty: 'easy' | 'moderate' | 'challenging' | 'hard';
  category: string;
  region: string;
  season: string | string[];
  guideId: string;
  startLocation: string | any;
  locations: string[] | any[];
  itinerary: string[] | any;
  included: string[];
  excluded: string[];
  requirements: string[];
  tags: string[];
  images: File[] | string[];
} 