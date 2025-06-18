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
  Avatar,
  Stack,
  Divider,
  IconButton,
} from '@mui/material';
import { 
  Search, 
  LocationOn, 
  AttachMoney, 
  AccessTime, 
  TrendingUp,
  Star,
  People,
  Verified,
  ArrowForward,
  PlayCircle,
  Phone,
  Email,
  Public
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { usePopularTours, useSeasonalTours } from '../hooks/useTours';
import { useAuth } from '../context/AuthContext';
import TourCard from '../components/TourCard';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  
  const { tours: popularTours, loading: popularLoading, error: popularError } = usePopularTours();
  const { tours: seasonalTours, loading: seasonalLoading, error: seasonalError } = useSeasonalTours();

  const handleSearch = () => {
    navigate(`/tours?search=${encodeURIComponent(searchQuery)}`);
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  // Статистика платформы
  const platformStats = [
    { label: 'Авторских туров', value: '150+', icon: <LocationOn /> },
    { label: 'Довольных туристов', value: '2500+', icon: <People /> },
    { label: 'Регионов Казахстана', value: '14', icon: <Public /> },
    { label: 'Средний рейтинг', value: '4.8', icon: <Star /> },
  ];

  // Популярные направления
  const popularDestinations = [
    { name: 'Алматы', tours: 25, image: '/images/destinations/almaty.jpg' },
    { name: 'Астана', tours: 18, image: '/images/destinations/astana.jpg' },
    { name: 'Шымкент', tours: 12, image: '/images/destinations/shymkent.jpg' },
    { name: 'Караганда', tours: 10, image: '/images/destinations/karaganda.jpg' },
    { name: 'Актобе', tours: 8, image: '/images/destinations/aktobe.jpg' },
    { name: 'Тараз', tours: 6, image: '/images/destinations/taraz.jpg' },
  ];

  // Категории туров
  const tourCategories = [
    { name: 'Культурные', icon: '🏛️', count: 45 },
    { name: 'Природные', icon: '🏔️', count: 38 },
    { name: 'Приключения', icon: '🎒', count: 32 },
    { name: 'Гастрономические', icon: '🍽️', count: 15 },
    { name: 'Экотуризм', icon: '🌿', count: 20 },
  ];

  // Отзывы клиентов
  const testimonials = [
    {
      name: 'Анна Петрова',
      avatar: '/images/avatars/anna.jpg',
      rating: 5,
      text: 'Удивительное путешествие по Алматы! Гид был профессиональным, а маршрут продуманным.',
      tour: 'Классический тур по Алматы'
    },
    {
      name: 'Михаил Сидоров',
      avatar: '/images/avatars/mikhail.jpg', 
      rating: 5,
      text: 'Отличная организация поездки в Астану. Увидели все основные достопримечательности.',
      tour: 'Современная Астана'
    },
    {
      name: 'Елена Козлова',
      avatar: '/images/avatars/elena.jpg',
      rating: 4,
      text: 'Горные пейзажи Казахстана просто потрясающие! Рекомендую всем любителям природы.',
      tour: 'Горные тропы Алатау'
    }
  ];

  return (
    <Box>
      {/* Героическая секция */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          py: 8,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: 'url("/images/hero-pattern.svg")',
            backgroundSize: 'cover',
            opacity: 0.1,
          }}
        />
        
                 <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
           <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'center', gap: 4 }}>
             <Box sx={{ flex: 1 }}>
               <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                 <Box
                   component="img"
                   src="/images/logo_nomad.png"
                   alt="Nomad Route"
                   sx={{ 
                     height: 80, 
                     width: 80, 
                     mr: 3
                   }}
                 />
                 <Typography variant="h2" component="h1" gutterBottom fontWeight="bold">
                   Nomad Route
                 </Typography>
               </Box>
               <Typography 
                 variant="h5" 
                 paragraph 
                 sx={{ mb: 4, opacity: 0.9, textAlign: 'center' }}
               >
                 Откройте для себя красоту Казахстана
               </Typography>
               
               {/* Поиск */}
               <Paper sx={{ p: 2, backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 3 }}>
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
                           <Search color="primary" />
                         </InputAdornment>
                       ),
                     }}
                     sx={{ 
                       '& .MuiOutlinedInput-root': {
                         borderRadius: 2,
                       }
                     }}
                   />
                   <Button
                     variant="contained"
                     size="large"
                     onClick={handleSearch}
                     sx={{ 
                       minWidth: 120,
                       borderRadius: 2,
                       textTransform: 'none',
                       fontSize: '1.1rem'
                     }}
                   >
                     Поиск
                   </Button>
                 </Box>
               </Paper>

               {/* Статистика */}
               <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 3 }}>
                 {platformStats.map((stat, index) => (
                   <Box key={index} sx={{ flex: '1 1 120px', textAlign: 'center', minWidth: 120 }}>
                     <Box sx={{ color: '#FFD700', mb: 1 }}>
                       {stat.icon}
                     </Box>
                     <Typography variant="h6" fontWeight="bold">
                       {stat.value}
                     </Typography>
                     <Typography variant="body2" sx={{ opacity: 0.8 }}>
                       {stat.label}
                     </Typography>
                   </Box>
                 ))}
               </Box>
             </Box>
             
             <Box sx={{ flex: 1 }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: 400,
                  position: 'relative',
                }}
              >
                <Card
                  sx={{
                    width: 300,
                    height: 200,
                    borderRadius: 4,
                    overflow: 'hidden',
                    transform: 'rotate(-5deg)',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                  }}
                >
                  <CardMedia
                    component="img"
                    height="200"
                    image="/images/kazakhstan-hero.jpg"
                    alt="Казахстан"
                  />
                </Card>
                <IconButton
                  sx={{
                    position: 'absolute',
                    backgroundColor: 'rgba(255,255,255,0.9)',
                    '&:hover': { backgroundColor: 'white' },
                    width: 60,
                    height: 60,
                  }}
                >
                  <PlayCircle sx={{ fontSize: 40, color: 'primary.main' }} />
                </IconButton>
                             </Box>
             </Box>
           </Box>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 6 }}>
        {/* Персонализированные рекомендации для авторизованных пользователей */}
        {user && (
          <Box sx={{ mb: 6 }}>
            <Paper sx={{ p: 4, borderRadius: 3, background: 'linear-gradient(45deg, #FFF8E1 30%, #FFFDE7 90%)' }}>
              <Typography variant="h4" gutterBottom>
                Привет, {user.firstName}! 👋
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                Мы подобрали для вас туры на основе ваших предпочтений
              </Typography>
              <Button 
                variant="contained" 
                endIcon={<ArrowForward />}
                onClick={() => navigate('/tours?recommended=true')}
              >
                Посмотреть рекомендации
              </Button>
            </Paper>
          </Box>
        )}

        {/* Популярные направления */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h4" component="h2" gutterBottom fontWeight="bold">
            Популярные направления
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Самые посещаемые места в Казахстане
          </Typography>
          
                     <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
             {popularDestinations.map((destination, index) => (
               <Box key={index} sx={{ flex: '1 1 300px', minWidth: 300 }}>
                 <Card 
                   sx={{ 
                     cursor: 'pointer',
                     transition: 'transform 0.3s',
                     '&:hover': { transform: 'translateY(-4px)' },
                     borderRadius: 3,
                   }}
                   onClick={() => navigate(`/tours?region=${destination.name}`)}
                 >
                   <CardMedia
                     component="img"
                     height="140"
                     image={destination.image}
                     alt={destination.name}
                   />
                   <CardContent>
                     <Typography variant="h6" gutterBottom>
                       {destination.name}
                     </Typography>
                     <Typography variant="body2" color="text.secondary">
                       {destination.tours} туров
                     </Typography>
                   </CardContent>
                 </Card>
               </Box>
             ))}
           </Box>
        </Box>

        {/* Категории туров */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h4" component="h2" gutterBottom fontWeight="bold">
            Выберите тип приключения
          </Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
             {tourCategories.map((category, index) => (
               <Box key={index} sx={{ flex: '1 1 200px', minWidth: 200 }}>
                 <Paper
                   sx={{
                     p: 3,
                     textAlign: 'center',
                     cursor: 'pointer',
                     transition: 'all 0.3s',
                     '&:hover': {
                       transform: 'translateY(-4px)',
                       boxShadow: 4,
                     },
                     borderRadius: 3,
                   }}
                   onClick={() => navigate(`/tours?category=${category.name}`)}
                 >
                   <Typography variant="h4" sx={{ mb: 1 }}>
                     {category.icon}
                   </Typography>
                   <Typography variant="h6" gutterBottom>
                     {category.name}
                   </Typography>
                   <Chip 
                     label={`${category.count} туров`} 
                     size="small" 
                     color="primary"
                     variant="outlined"
                   />
                 </Paper>
               </Box>
             ))}
           </Box>
        </Box>

        {/* Популярные туры */}
        <Box sx={{ mb: 6 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box>
              <Typography variant="h4" component="h2" fontWeight="bold">
                Популярные туры
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Туры с самыми высокими рейтингами
              </Typography>
            </Box>
            <Button 
              variant="outlined" 
              endIcon={<ArrowForward />}
              onClick={() => navigate('/tours')}
            >
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
                Туры временно недоступны
              </Typography>
              <Typography color="text.secondary">
                Мы работаем над добавлением новых туров
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


        {/* Отзывы клиентов */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h4" component="h2" gutterBottom fontWeight="bold" textAlign="center">
            Что говорят наши клиенты
          </Typography>
          <Typography variant="body1" color="text.secondary" textAlign="center" paragraph>
            Реальные отзывы от довольных туристов
          </Typography>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            {testimonials.map((testimonial, index) => (
              <Box key={index} sx={{ flex: '1 1 320px', minWidth: 320 }}>
                <Card sx={{ p: 3, height: '100%', borderRadius: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar src={testimonial.avatar} sx={{ mr: 2 }} />
                    <Box>
                      <Typography variant="h6">
                        {testimonial.name}
                      </Typography>
                      <Rating value={testimonial.rating} readOnly size="small" />
                    </Box>
                  </Box>
                  <Typography variant="body2" paragraph>
                    "{testimonial.text}"
                  </Typography>
                  <Chip 
                    label={testimonial.tour} 
                    size="small" 
                    variant="outlined"
                  />
                </Card>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Призыв к действию */}
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <Paper
            sx={{
              p: 6,
              borderRadius: 4,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
            }}
          >
            <Typography variant="h3" gutterBottom fontWeight="bold">
              Готовы к приключению?
            </Typography>
            <Typography variant="h6" paragraph sx={{ opacity: 0.9 }}>
              Присоединяйтесь к тысячам довольных туристов
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
              <Button
                variant="contained"
                size="large"
                sx={{ 
                  backgroundColor: 'white',
                  color: 'primary.main',
                  '&:hover': { backgroundColor: '#f5f5f5' },
                  px: 4,
                  py: 1.5,
                }}
                onClick={() => navigate('/tours')}
              >
                Найти тур
              </Button>
              {!user && (
                <Button
                  variant="outlined"
                  size="large"
                  sx={{ 
                    borderColor: 'white',
                    color: 'white',
                    '&:hover': { borderColor: '#f5f5f5', backgroundColor: 'rgba(255,255,255,0.1)' },
                    px: 4,
                    py: 1.5,
                  }}
                  onClick={() => navigate('/register')}
                >
                  Регистрация
                </Button>
              )}
            </Stack>
          </Paper>
        </Box>
      </Container>
    </Box>
  );
};

export default HomePage;