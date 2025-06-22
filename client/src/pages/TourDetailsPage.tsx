import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Button,
  Chip,
  Rating,
  Divider,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  IconButton,
  Fab,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  LocationOn,
  AccessTime,
  People,
  CalendarToday,
  AttachMoney,
  Hiking as DifficultyIcon,
  ArrowBack,
  ExpandMore,
  Check,
  Close,
  Star,
  Terrain,
  Group,
  Schedule,
  LocalOffer,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import { Tour, Review, Booking } from '../types';
import { getDifficultyText, getCategoryText } from '../utils/translations';
import { getImageUrl, handleImageError } from '../utils/imageUtils';

const TourDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [tour, setTour] = useState<Tour | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [participants, setParticipants] = useState(1);
  const [bookingError, setBookingError] = useState<string>('');
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [mainImageIndex, setMainImageIndex] = useState(0);

  useEffect(() => {
    loadTourDetails();
  }, [id]);

  const loadTourDetails = async () => {
    try {
      setLoading(true);
      setError('');

      if (!id) {
        throw new Error('ID тура не указан');
      }

      const [tourResponse, reviewsResponse] = await Promise.all([
        apiService.getTourById(id),
        apiService.getTourReviews(id),
      ]);

      if (tourResponse.status === 'success' && tourResponse.data) {
        setTour(tourResponse.data.tour);
      }

      if (reviewsResponse.status === 'success' && reviewsResponse.data) {
        setReviews(reviewsResponse.data.data || []);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка загрузки данных тура');
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBookingSubmit = async () => {
    try {
      setBookingError('');
      
      if (!user) {
        navigate('/login', { state: { from: `/tours/${id}` } });
        return;
      }

      if (!selectedDate) {
        setBookingError('Выберите дату тура');
        return;
      }

      if (!id) return;

      const bookingData = {
        tourId: id,
        startDate: selectedDate,
        participants,
      };

      const response = await apiService.createBooking(bookingData);
      
      if (response.status === 'success') {
        setBookingSuccess(true);
        setTimeout(() => {
          setBookingDialogOpen(false);
          navigate('/bookings');
        }, 2000);
      }
    } catch (err: any) {
      setBookingError(err.response?.data?.message || 'Ошибка при бронировании тура');
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '#2e7d32';        // Более темный зеленый
      case 'moderate': return '#f57c00';    // Более темный оранжевый
      case 'challenging': return '#d32f2f'; // Более темный красный
      case 'hard': return '#7b1fa2';        // Более темный фиолетовый
      default: return '#616161';            // Более темный серый
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error || !tour) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ borderRadius: 2 }}>
          {error || 'Тур не найден'}
        </Alert>
      </Container>
    );
  }

  const hasImages = tour.images && tour.images.length > 0;
  const mainImage = hasImages ? tour.images[mainImageIndex] : null;
  const thumbnailImages = hasImages ? tour.images.slice(0, 5) : [];

  return (
    <Box sx={{ bgcolor: '#f8fafc', minHeight: '100vh' }}>
      {/* Кнопка назад */}
      <Box sx={{ position: 'sticky', top: 0, zIndex: 10, bgcolor: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
        <Container maxWidth="lg">
          <Box sx={{ py: 2 }}>
            <IconButton onClick={() => navigate(-1)}>
              <ArrowBack />
            </IconButton>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Главное изображение и информация */}
        <Paper elevation={0} sx={{ borderRadius: 4, overflow: 'hidden', mb: 4, bgcolor: 'white' }}>
          <Grid container>
            {/* Изображения */}
            <Grid item xs={12} md={7}>
              <Box sx={{ position: 'relative', height: { xs: 300, md: 500 } }}>
                <img
                  src={getImageUrl(mainImage)}
                  alt={tour.title}
                  onError={handleImageError}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
                
                {/* Миниатюры */}
                {thumbnailImages.length > 1 && (
                  <Box sx={{
                    position: 'absolute',
                    bottom: 16,
                    left: 16,
                    right: 16,
                    display: 'flex',
                    gap: 1,
                    overflowX: 'auto',
                    '&::-webkit-scrollbar': { display: 'none' }
                  }}>
                    {thumbnailImages.map((image, index) => (
                      <Box
                        key={index}
                        onClick={() => setMainImageIndex(index)}
                        sx={{
                          minWidth: 60,
                          height: 60,
                          borderRadius: 2,
                          overflow: 'hidden',
                          cursor: 'pointer',
                          border: mainImageIndex === index ? '3px solid white' : '2px solid rgba(255,255,255,0.5)',
                          transition: 'all 0.3s ease',
                        }}
                      >
                        <img
                          src={getImageUrl(image)}
                          alt={`Миниатюра ${index + 1}`}
                          onError={handleImageError}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                          }}
                        />
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>
            </Grid>

            {/* Информация о туре */}
            <Grid item xs={12} md={5}>
              <Box sx={{ p: { xs: 3, md: 4 }, height: '100%', display: 'flex', flexDirection: 'column' }}>
                {/* Заголовок и рейтинг */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h3" component="h1" gutterBottom sx={{ 
                    fontSize: { xs: '1.8rem', md: '2.5rem' }, 
                    fontWeight: 700,
                    lineHeight: 1.2,
                    color: '#1a1a1a'
                  }}>
                    {tour.title}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Rating 
                      value={tour.rating || 0} 
                      readOnly 
                      precision={0.1}
                      sx={{ mr: 1 }}
                    />
                    <Typography variant="body1" color="text.secondary">
                      ({tour.ratingCount || 0} отзывов)
                    </Typography>
                  </Box>

                  <Typography variant="h4" color="primary" sx={{ fontWeight: 600, mb: 2 }}>
                    {tour.price.toLocaleString()} ₸
                    <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                      за человека
                    </Typography>
                  </Typography>
                </Box>

                {/* Характеристики */}
                <Box sx={{ mb: 3 }}>
                  <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                    <Chip
                      icon={<LocationOn />}
                      label={tour.region}
                      variant="outlined"
                      color="primary"
                      sx={{ borderRadius: 3 }}
                    />
                    <Chip
                      icon={<AccessTime />}
                      label={`${tour.duration} дней`}
                      variant="outlined"
                      color="info"
                      sx={{ borderRadius: 3 }}
                    />
                    <Chip
                      icon={<People />}
                      label={`До ${tour.maxGroupSize} человек`}
                      variant="outlined"
                      color="success"
                      sx={{ borderRadius: 3 }}
                    />
                    <Chip
                      icon={<DifficultyIcon sx={{ color: 'white !important' }} />}
                      label={getDifficultyText(tour.difficulty)}
                      sx={{ 
                        borderRadius: 3,
                        bgcolor: getDifficultyColor(tour.difficulty),
                        color: 'white',
                        fontWeight: 600,
                        '& .MuiChip-icon': {
                          color: 'white !important',
                          fontSize: '1.1rem',
                        }
                      }}
                    />
                  </Stack>
                </Box>

                {/* Описание */}
                <Typography variant="body1" sx={{ 
                  mb: 3, 
                  lineHeight: 1.6,
                  color: '#4a5568',
                  fontSize: '1.1rem'
                }}>
                  {tour.shortDescription || tour.description}
                </Typography>

                {/* Кнопка бронирования */}
                <Box sx={{ mt: 'auto' }}>
                  <Button
                    variant="contained"
                    size="large"
                    fullWidth
                    onClick={() => setBookingDialogOpen(true)}
                    sx={{
                      py: 2,
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      borderRadius: 3,
                      textTransform: 'none',
                      color: 'white',
                      bgcolor: '#1976d2',
                      boxShadow: '0 8px 24px rgba(25, 118, 210, 0.3)',
                      '&:hover': {
                        bgcolor: '#1565c0',
                        boxShadow: '0 12px 32px rgba(25, 118, 210, 0.4)',
                        transform: 'translateY(-2px)',
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    Забронировать тур
                  </Button>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Детальная информация */}
        <Grid container spacing={4}>
          {/* Левая колонка */}
          <Grid item xs={12} md={8}>
            {/* Описание */}
            <Paper elevation={0} sx={{ p: 4, mb: 4, borderRadius: 3, bgcolor: 'white' }}>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                О туре
              </Typography>
              <Typography variant="body1" sx={{ 
                lineHeight: 1.7,
                color: '#4a5568',
                fontSize: '1.05rem'
              }}>
                {tour.description}
              </Typography>
            </Paper>

            {/* Программа тура */}
            <Paper elevation={0} sx={{ p: 4, mb: 4, borderRadius: 3, bgcolor: 'white' }}>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                Программа тура
              </Typography>
              
              {tour.itinerary && Array.isArray(tour.itinerary) && tour.itinerary.map((day: any, index: number) => (
                <Accordion key={index} sx={{ mb: 1, '&:before': { display: 'none' } }}>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      День {day.day || index + 1}: {day.title || 'Программа дня'}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body1" sx={{ color: '#4a5568', lineHeight: 1.6 }}>
                      {day.description || day}
                    </Typography>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Paper>

            {/* Отзывы */}
            <Paper elevation={0} sx={{ p: 4, borderRadius: 3, bgcolor: 'white' }}>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                Отзывы туристов
              </Typography>

              {reviews && reviews.length > 0 ? (
                <Stack spacing={3}>
                  {reviews.map((review) => (
                    <Card key={review.id} variant="outlined" sx={{ borderRadius: 2 }}>
                      <CardContent sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Avatar 
                            src={getImageUrl(review.user.avatar)} 
                            sx={{ mr: 2, width: 48, height: 48 }}
                          >
                            {review.user.firstName[0]}
                          </Avatar>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                              {review.user.firstName} {review.user.lastName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {new Date(review.createdAt).toLocaleDateString('ru-RU', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                              })}
                            </Typography>
                          </Box>
                          <Rating value={review.rating} readOnly size="small" />
                        </Box>
                        
                        <Typography variant="body1" sx={{ color: '#4a5568', lineHeight: 1.6 }}>
                          {review.comment}
                        </Typography>
                      </CardContent>
                    </Card>
                  ))}
                </Stack>
              ) : (
                <Box textAlign="center" py={4}>
                  <Star sx={{ fontSize: 48, color: '#e0e0e0', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    Пока нет отзывов
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Станьте первым, кто оставит отзыв об этом туре
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>

          {/* Правая колонка */}
          <Grid item xs={12} md={4}>
            {/* Включено / Не включено */}
            <Paper elevation={0} sx={{ p: 3, mb: 4, borderRadius: 3, bgcolor: 'white' }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                Что включено
              </Typography>
              
              {tour.included && tour.included.length > 0 && (
                <List dense sx={{ mb: 2 }}>
                  {tour.included.map((item, index) => (
                    <ListItem key={index} sx={{ px: 0 }}>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <Check color="success" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText 
                        primary={item} 
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                  ))}
                </List>
              )}

              {tour.excluded && tour.excluded.length > 0 && (
                <>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2, mt: 3 }}>
                    Не включено
                  </Typography>
                  <List dense>
                    {tour.excluded.map((item, index) => (
                      <ListItem key={index} sx={{ px: 0 }}>
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          <Close color="error" fontSize="small" />
                        </ListItemIcon>
                        <ListItemText 
                          primary={item} 
                          primaryTypographyProps={{ variant: 'body2' }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </>
              )}
            </Paper>

            {/* Требования */}
            {tour.requirements && tour.requirements.length > 0 && (
              <Paper elevation={0} sx={{ p: 3, borderRadius: 3, bgcolor: 'white' }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                  Что взять с собой
                </Typography>
                
                <List dense>
                  {tour.requirements.map((item, index) => (
                    <ListItem key={index} sx={{ px: 0 }}>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <LocationOn color="primary" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText 
                        primary={item} 
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            )}
          </Grid>
        </Grid>

        {/* Плавающая кнопка бронирования на мобильных */}
        <Fab
          onClick={() => setBookingDialogOpen(true)}
          sx={{
            position: 'fixed',
            bottom: 20,
            right: 20,
            display: { xs: 'flex', md: 'none' },
            bgcolor: '#1976d2',
            color: 'white',
            boxShadow: '0 6px 20px rgba(25, 118, 210, 0.4)',
            '&:hover': {
              bgcolor: '#1565c0',
              transform: 'scale(1.1)',
              boxShadow: '0 8px 24px rgba(25, 118, 210, 0.5)',
            },
            transition: 'all 0.3s ease',
          }}
        >
          <CalendarToday />
        </Fab>
      </Container>

      {/* Диалог бронирования */}
      <Dialog
        open={bookingDialogOpen}
        onClose={() => setBookingDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Бронирование тура
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {tour.title}
          </Typography>
        </DialogTitle>
        
        <DialogContent sx={{ pt: 2 }}>
          {bookingSuccess ? (
            <Alert 
              severity="success" 
              sx={{ 
                borderRadius: 2,
                '& .MuiAlert-message': { fontSize: '1rem' }
              }}
            >
              Тур успешно забронирован! Перенаправляем на страницу бронирований...
            </Alert>
          ) : (
            <Box>
              {bookingError && (
                <Alert 
                  severity="error" 
                  sx={{ mb: 3, borderRadius: 2 }}
                  onClose={() => setBookingError('')}
                >
                  {bookingError}
                </Alert>
              )}

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, mb: 1 }}>
                  Дата начала тура
                </Typography>
                <FormControl fullWidth>
                  <Select
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    displayEmpty
                    sx={{ 
                      borderRadius: 2,
                      '& .MuiSelect-select': {
                        py: 1.5,
                      }
                    }}
                  >
                    <MenuItem value="" disabled>
                      <Typography color="text.secondary">Выберите дату</Typography>
                    </MenuItem>
                    {[
                      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                      new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                      new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                      new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    ].map((date: string) => (
                      <MenuItem key={date} value={date}>
                        {new Date(date).toLocaleDateString('ru-RU', {
                          weekday: 'short',
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, mb: 1 }}>
                  Количество участников
                </Typography>
                <FormControl fullWidth>
                  <Select
                    value={participants}
                    onChange={(e) => setParticipants(Number(e.target.value))}
                    sx={{ 
                      borderRadius: 2,
                      '& .MuiSelect-select': {
                        py: 1.5,
                      }
                    }}
                  >
                    {[...Array(tour.maxGroupSize || 10)].map((_, i) => (
                      <MenuItem key={i + 1} value={i + 1}>
                        {i + 1} {i === 0 ? 'человек' : i < 4 ? 'человека' : 'человек'}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              <Paper 
                elevation={0} 
                sx={{ 
                  p: 3, 
                  bgcolor: '#f8fafc', 
                  borderRadius: 2,
                  border: '1px solid #e2e8f0'
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Итого к оплате:
                  </Typography>
                  <Typography variant="h5" color="primary" sx={{ fontWeight: 700 }}>
                    {(tour.price * participants).toLocaleString()} ₸
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {tour.price.toLocaleString()} ₸ × {participants} {participants === 1 ? 'человек' : participants < 5 ? 'человека' : 'человек'}
                </Typography>
              </Paper>
            </Box>
          )}
        </DialogContent>
        
        {!bookingSuccess && (
          <DialogActions sx={{ p: 3, pt: 1 }}>
            <Button 
              onClick={() => setBookingDialogOpen(false)}
              sx={{ borderRadius: 2 }}
            >
              Отмена
            </Button>
            <Button 
              variant="contained" 
              onClick={handleBookingSubmit}
              disabled={!selectedDate}
              sx={{
                borderRadius: 2,
                px: 4,
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 600,
                textTransform: 'none',
                color: 'white',
                bgcolor: '#1976d2',
                boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
                '&:hover': {
                  bgcolor: '#1565c0',
                  boxShadow: '0 6px 16px rgba(25, 118, 210, 0.4)',
                  transform: 'translateY(-1px)',
                },
                '&:disabled': {
                  bgcolor: '#e0e0e0',
                  color: '#9e9e9e',
                  boxShadow: 'none',
                },
                transition: 'all 0.2s ease-in-out',
              }}
            >
              Забронировать
            </Button>
          </DialogActions>
        )}
      </Dialog>
    </Box>
  );
};

export default TourDetailsPage; 