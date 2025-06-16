import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Rating,
  Pagination,
  CircularProgress,
  Alert,
  Paper,
  Slider,
} from '@mui/material';
import { LocationOn, AccessTime, People, Search, FilterList } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import { Tour, TourFilters } from '../types';
import TourCard from '../components/TourCard';

const ToursPage: React.FC = () => {
  const navigate = useNavigate();
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);

  const [filters, setFilters] = useState<TourFilters>({
    search: '',
    category: '',
    region: '',
    difficulty: '',
    minPrice: 0,
    maxPrice: 1000000,
    page: 1,
    limit: 12,
  });

  const [priceRange, setPriceRange] = useState<number[]>([0, 1000000]);
  const [showFilters, setShowFilters] = useState(false);

  const categories = [
    'Природа', 'История', 'Культура', 'Приключения', 
    'Экотуризм', 'Горы', 'Степи', 'Города'
  ];

  const regions = [
    'Алматинская область', 'Астана', 'Алматы', 'Мангистауская область',
    'Карагандинская область', 'Восточно-Казахстанская область',
    'Западно-Казахстанская область', 'Актюбинская область'
  ];

  const difficulties = [
    { value: 'easy', label: 'Легкий' },
    { value: 'moderate', label: 'Средний' },
    { value: 'challenging', label: 'Сложный' },
    { value: 'hard', label: 'Очень сложный' },
  ];

  useEffect(() => {
    loadTours();
  }, [filters]);

  const loadTours = async () => {
    try {
      setLoading(true);
      const response = await apiService.getTours(filters);
      
      if (response.status === 'success' && response.data) {
        setTours(response.data.data);
        setTotalPages((response.data as any).pagination?.pages || 1);
      }
    } catch (err: any) {
      setError('Ошибка загрузки туров');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof TourFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1, // Сбрасываем на первую страницу при изменении фильтров
    }));
    setCurrentPage(1);
  };

  const handlePriceChange = (event: Event, newValue: number | number[]) => {
    if (Array.isArray(newValue)) {
      setPriceRange(newValue);
      setFilters(prev => ({
        ...prev,
        minPrice: newValue[0],
        maxPrice: newValue[1],
        page: 1,
      }));
      setCurrentPage(1);
    }
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page);
    setFilters(prev => ({ ...prev, page }));
  };

  const clearFilters = () => {
    const clearedFilters: TourFilters = {
      search: '',
      category: '',
      region: '',
      difficulty: '',
      minPrice: 0,
      maxPrice: 1000000,
      page: 1,
      limit: 12,
    };
    setFilters(clearedFilters);
    setPriceRange([0, 1000000]);
    setCurrentPage(1);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom>
        Каталог туров
      </Typography>

      {/* Поиск и фильтры */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
          <TextField
            fullWidth
            label="Поиск туров"
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            InputProps={{
              startAdornment: <Search color="action" sx={{ mr: 1 }} />,
            }}
          />
          <Button
            variant="outlined"
            onClick={() => setShowFilters(!showFilters)}
            startIcon={<FilterList />}
          >
            Фильтры
          </Button>
        </Box>

        {showFilters && (
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2, mt: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Категория</InputLabel>
              <Select
                value={filters.category}
                label="Категория"
                onChange={(e) => handleFilterChange('category', e.target.value)}
              >
                <MenuItem value="">Все категории</MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Регион</InputLabel>
              <Select
                value={filters.region}
                label="Регион"
                onChange={(e) => handleFilterChange('region', e.target.value)}
              >
                <MenuItem value="">Все регионы</MenuItem>
                {regions.map((region) => (
                  <MenuItem key={region} value={region}>
                    {region}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Сложность</InputLabel>
              <Select
                value={filters.difficulty}
                label="Сложность"
                onChange={(e) => handleFilterChange('difficulty', e.target.value)}
              >
                <MenuItem value="">Любая сложность</MenuItem>
                {difficulties.map((difficulty) => (
                  <MenuItem key={difficulty.value} value={difficulty.value}>
                    {difficulty.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Box sx={{ gridColumn: 'span 2' }}>
              <Typography gutterBottom>
                Цена: {priceRange[0].toLocaleString()} ₸ - {priceRange[1].toLocaleString()} ₸
              </Typography>
              <Slider
                value={priceRange}
                onChange={handlePriceChange}
                valueLabelDisplay="auto"
                min={0}
                max={1000000}
                step={10000}
                valueLabelFormat={(value) => `${value.toLocaleString()} ₸`}
              />
            </Box>

            <Button variant="outlined" onClick={clearFilters}>
              Сбросить фильтры
            </Button>
          </Box>
        )}
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      ) : tours.length > 0 ? (
        <>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: 3,
              mb: 4,
            }}
          >
            {tours.map((tour) => (
              <TourCard key={tour.id} tour={tour} />
            ))}
          </Box>

          <Box display="flex" justifyContent="center">
            <Pagination
              count={totalPages}
              page={currentPage}
              onChange={handlePageChange}
              color="primary"
              size="large"
            />
          </Box>
        </>
      ) : (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            Туры не найдены
          </Typography>
          <Typography color="text.secondary">
            Попробуйте изменить фильтры поиска
          </Typography>
        </Paper>
      )}
    </Container>
  );
};

export default ToursPage; 