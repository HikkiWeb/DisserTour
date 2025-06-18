import { useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/api';
import { Tour, TourFilters, PaginatedResponse } from '../types';

interface UseToursResult {
  tours: Tour[];
  loading: boolean;
  error: string | null;
  totalPages: number;
  currentPage: number;
  loadTours: (filters?: TourFilters) => Promise<void>;
  refetch: () => Promise<void>;
}

export const useTours = () => {
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);

  const loadTours = useCallback(async (filters?: TourFilters) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.getTours(filters);
      
      if (response.status === 'success' && response.data) {
        setTours(response.data.tours || []);
        setTotalPages(response.data.pagination?.pages || 1);
        setCurrentPage(response.data.pagination?.page || 1);
      } else {
        throw new Error(response.message || 'Ошибка загрузки туров');
      }
    } catch (err: any) {
      setError(err.message || 'Ошибка загрузки туров');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTours();
  }, [loadTours]);

  return {
    tours,
    loading,
    error,
    totalPages,
    currentPage,
    refetch: loadTours,
  };
};

export default useTours;

// Хук для получения одного тура
export const useTour = (tourId: string) => {
  const [tour, setTour] = useState<Tour | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTour = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.getTourById(tourId);
      
      if (response.status === 'success' && response.data) {
        setTour(response.data.tour);
      } else {
        throw new Error(response.message || 'Тур не найден');
      }
    } catch (err: any) {
      setError(err.message || 'Ошибка загрузки тура');
      setTour(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tourId) {
      loadTour();
    }
  }, [tourId]);

  return {
    tour,
    loading,
    error,
    refetch: loadTour,
  };
};

// Хук для популярных туров
export const usePopularTours = () => {
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPopularTours = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.getPopularTours();
      
      if (response.status === 'success' && response.data) {
        setTours(response.data.tours);
      }
    } catch (err: any) {
      console.error('API Error:', err);
      setError(err.message || 'Ошибка загрузки популярных туров');
      
      // Фоллбэк данные для демонстрации
      setTours([
        {
          id: '1',
          title: 'Тур по Алматы',
          description: 'Откройте для себя красоты южной столицы Казахстана',
          shortDescription: 'Экскурсия по главным достопримечательностям Алматы',
          price: 50000,
          duration: 3,
          maxGroupSize: 15,
          difficulty: 'easy' as const,
          category: 'culture',
          region: 'Алматы',
          season: ['spring', 'summer', 'autumn'],
          images: ['/images/destinations/almaty.jpg'],
          itinerary: [],
          included: ['Трансфер', 'Гид', 'Экскурсии'],
          excluded: ['Питание', 'Личные расходы'],
          requirements: ['Удобная обувь'],
          tags: ['город', 'культура', 'экскурсия'],
          rating: 4.8,
          ratingCount: 124,
          isActive: true,
          locations: []
        },
        {
          id: '2', 
          title: 'Поездка в Астану',
          description: 'Современная столица с уникальной архитектурой',
          shortDescription: 'Знакомство с современной архитектурой столицы',
          price: 75000,
          duration: 2,
          maxGroupSize: 20,
          difficulty: 'easy' as const,
          category: 'culture',
          region: 'Астана',
          season: ['spring', 'summer', 'autumn'],
          images: ['/images/destinations/astana.jpg'],
          itinerary: [],
          included: ['Трансфер', 'Гид', 'Экскурсии'],
          excluded: ['Питание', 'Личные расходы'],
          requirements: ['Удобная обувь'],
          tags: ['город', 'архитектура', 'столица'],
          rating: 4.6,
          ratingCount: 89,
          isActive: true,
          locations: []
        }
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPopularTours();
  }, [loadPopularTours]);

  return {
    tours,
    loading,
    error,
    refetch: loadPopularTours,
  };
};

export const useSeasonalTours = () => {
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSeasonalTours = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.getSeasonalRecommendations();
      
      if (response.status === 'success' && response.data) {
        setTours(response.data.tours);
      }
    } catch (err: any) {
      console.error('API Error:', err);
      setError(err.message || 'Ошибка загрузки сезонных туров');
      
      // Фоллбэк данные для демонстрации
      setTours([
        {
          id: '3',
          title: 'Весенний тур в горы',
          description: 'Насладитесь весенней природой в горах Казахстана',
          shortDescription: 'Весенний поход в горы с живописными видами',
          price: 65000,
          duration: 4,
          maxGroupSize: 12,
          difficulty: 'moderate' as const,
          category: 'nature',
          region: 'Алматинская область',
          season: ['spring'],
          images: ['/images/destinations/mountains.jpg'],
          itinerary: [],
          included: ['Трансфер', 'Гид', 'Питание'],
          excluded: ['Личные расходы'],
          requirements: ['Горные ботинки', 'Теплая одежда'],
          tags: ['горы', 'природа', 'весна'],
          rating: 4.7,
          ratingCount: 156,
          isActive: true,
          locations: []
        }
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSeasonalTours();
  }, [loadSeasonalTours]);

  return {
    tours,
    loading,
    error,
    refetch: loadSeasonalTours,
  };
}; 