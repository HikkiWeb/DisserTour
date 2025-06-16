import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  TextField,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Rating,
  Paper,
  InputAdornment,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Search, LocationOn, AttachMoney, AccessTime } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { usePopularTours, useSeasonalTours } from '../hooks/useTours';
import TourCard from '../components/TourCard';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  
  const { tours: popularTours, loading: popularLoading, error: popularError } = usePopularTours();
  const { tours: seasonalTours, loading: seasonalLoading, error: seasonalError } = useSeasonalTours();

  // Отладочная информация
  console.log('HomePage render:', {
    popularTours: popularTours.length,
    popularLoading,
    popularError,
    seasonalTours: seasonalTours.length,
    seasonalLoading,
    seasonalError
  });

  const handleSearch = () => {
    navigate(`/tours?search=${encodeURIComponent(searchQuery)}`);
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  const heroDestinations = [
    'Алматы',
    'Астана',
    'Шымкент',
    'Караганда',
    'Актобе',
    'Тараз',
  ];

  return (
    <Box>
      {/* Героическая секция */}
      <Box
        sx={{
          backgroundImage: 'linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url("/images/hero-bg.jpg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          color: 'white',
          py: 12,
          textAlign: 'center',
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h2" component="h1" gutterBottom>
            Откройте для себя Казахстан
          </Typography>
          <Typography variant="h5" paragraph>
            Незабываемые приключения в самом сердце Центральной Азии
          </Typography>
          
          <Paper sx={{ p: 2, mt: 4, backgroundColor: 'rgba(255,255,255,0.9)' }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                placeholder="Куда хотите поехать?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
                sx={{ '& .MuiInputBase-input': { color: 'black' } }}
              />
              <Button
                variant="contained"
                size="large"
                onClick={handleSearch}
                sx={{ minWidth: 120 }}
              >
                Найти
              </Button>
            </Box>
          </Paper>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 6 }}>
        {/* Популярные направления */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h4" component="h2" gutterBottom>
            Популярные направления
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 4 }}>
            {heroDestinations.map((destination) => (
              <Chip
                key={destination}
                label={destination}
                variant="outlined"
                sx={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  }
                }}
              />
            ))}
          </Box>
        </Box>

        {/* Популярные туры */}
        <Box sx={{ mb: 6 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h4" component="h2">
              Популярные туры
            </Typography>
            <Button variant="outlined" onClick={() => navigate('/tours')}>
              Все туры
            </Button>
          </Box>

          {popularError && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {popularError}
            </Alert>
          )}

          {popularLoading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : popularTours.length === 0 ? (
            <Box sx={{ textAlign: 'center', p: 4 }}>
              <Typography variant="h6" color="text.secondary">
                Туры не найдены
              </Typography>
              <Typography color="text.secondary">
                Попробуйте позже или проверьте подключение к серверу
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
              {popularTours.slice(0, 4).map((tour) => (
                <Box key={tour.id} sx={{ flex: '1 1 280px', minWidth: 280 }}>
                  <TourCard tour={tour} />
                </Box>
              ))}
            </Box>
          )}
        </Box>

        {/* Сезонные рекомендации */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h4" component="h2" gutterBottom>
            Сезонные рекомендации
          </Typography>

          {seasonalError && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {seasonalError}
            </Alert>
          )}

          {seasonalLoading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : seasonalTours.length === 0 ? (
            <Box sx={{ textAlign: 'center', p: 4 }}>
              <Typography variant="h6" color="text.secondary">
                Сезонные туры не найдены
              </Typography>
              <Typography color="text.secondary">
                Попробуйте позже или проверьте подключение к серверу
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
              {seasonalTours.slice(0, 3).map((tour) => (
                <Box key={tour.id} sx={{ flex: '1 1 320px', minWidth: 320 }}>
                  <TourCard tour={tour} />
                </Box>
              ))}
            </Box>
          )}
        </Box>

        {/* Почему выбирают нас */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h4" component="h2" gutterBottom textAlign="center">
            Почему выбирают нас
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4, mt: 2 }}>
            <Box sx={{ flex: '1 1 300px', minWidth: 300 }}>
              <Card sx={{ textAlign: 'center', p: 2 }}>
                <CardContent>
                  <LocationOn color="primary" sx={{ fontSize: 48, mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Уникальные маршруты
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Откройте для себя скрытые жемчужины Казахстана с нашими эксклюзивными турами
                  </Typography>
                </CardContent>
              </Card>
            </Box>
            <Box sx={{ flex: '1 1 300px', minWidth: 300 }}>
              <Card sx={{ textAlign: 'center', p: 2 }}>
                <CardContent>
                  <AttachMoney color="primary" sx={{ fontSize: 48, mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Доступные цены
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Качественные туры по честным ценам. Никаких скрытых платежей
                  </Typography>
                </CardContent>
              </Card>
            </Box>
            <Box sx={{ flex: '1 1 300px', minWidth: 300 }}>
              <Card sx={{ textAlign: 'center', p: 2 }}>
                <CardContent>
                  <AccessTime color="primary" sx={{ fontSize: 48, mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Гибкое планирование
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Выбирайте удобные даты и продолжительность поездки
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default HomePage;