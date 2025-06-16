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
  ImageList,
  ImageListItem,
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
} from '@mui/material';
import {
  LocationOn,
  AccessTime,
  People,
  CalendarToday,
  AttachMoney,
  Hiking as DifficultyIcon,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import { Tour, Review, Booking } from '../types';

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
        setReviews(reviewsResponse.data.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка загрузки данных тура');
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

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !tour) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">{error || 'Тур не найден'}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Основная информация */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={4}>
          <Grid sx={{ gridColumn: { xs: '1 / -1', md: '1 / span 6' } }}>
            <img
              src={tour.mainImage}
              alt={tour.title}
              style={{
                width: '100%',
                height: '400px',
                objectFit: 'cover',
                borderRadius: '8px',
              }}
            />
          </Grid>
          
          <Grid sx={{ gridColumn: { xs: '1 / -1', md: '7 / -1' } }}>
            <Typography variant="h4" component="h1" gutterBottom>
              {tour.title}
            </Typography>

            <Box sx={{ mb: 2 }}>
              <Chip
                icon={<LocationOn />}
                label={tour.region}
                sx={{ mr: 1, mb: 1 }}
              />
              <Chip
                icon={<AccessTime />}
                label={`${tour.duration} дней`}
                sx={{ mr: 1, mb: 1 }}
              />
              <Chip
                icon={<DifficultyIcon />}
                label={tour.difficulty}
                sx={{ mb: 1 }}
              />
            </Box>

            <Typography variant="h5" color="primary" gutterBottom>
              {tour.price.toLocaleString()} ₸
            </Typography>

            <Typography variant="body1" paragraph>
              {tour.description}
            </Typography>

            <Button
              variant="contained"
              size="large"
              fullWidth
              onClick={() => setBookingDialogOpen(true)}
            >
              Забронировать
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Программа тура */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Программа тура
        </Typography>
        
        {tour.itinerary.map((day, index) => (
          <Box key={index} sx={{ mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              День {day.day}
            </Typography>
            <Typography variant="subtitle1" gutterBottom>
              {day.title}
            </Typography>
            <Typography variant="body1" paragraph>
              {day.description}
            </Typography>
            {index < tour.itinerary.length - 1 && <Divider sx={{ my: 2 }} />}
          </Box>
        ))}
      </Paper>

      {/* Галерея */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Галерея
        </Typography>
        
        <ImageList variant="masonry" cols={3} gap={8}>
          {tour.gallery.map((image, index) => (
            <ImageListItem key={index}>
              <img
                src={image}
                alt={`Фото ${index + 1}`}
                loading="lazy"
                style={{ borderRadius: '4px' }}
              />
            </ImageListItem>
          ))}
        </ImageList>
      </Paper>

      {/* Отзывы */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Отзывы
        </Typography>

        {reviews.length > 0 ? (
          <Grid container spacing={2}>
            {reviews.map((review) => (
              <Grid sx={{ gridColumn: '1 / -1' }} key={review.id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar src={review.user.avatar} sx={{ mr: 2 }}>
                        {review.user.firstName[0]}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1">
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
                    </Box>
                    
                    <Rating value={review.rating} readOnly sx={{ mb: 1 }} />
                    <Typography variant="body1">{review.comment}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Typography color="text.secondary" align="center">
            Пока нет отзывов
          </Typography>
        )}
      </Paper>

      {/* Диалог бронирования */}
      <Dialog
        open={bookingDialogOpen}
        onClose={() => setBookingDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Бронирование тура</DialogTitle>
        <DialogContent>
          {bookingSuccess ? (
            <Alert severity="success" sx={{ mt: 2 }}>
              Тур успешно забронирован! Перенаправляем на страницу бронирований...
            </Alert>
          ) : (
            <Box sx={{ pt: 2 }}>
              {bookingError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {bookingError}
                </Alert>
              )}

              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Дата начала тура</InputLabel>
                <Select
                  value={selectedDate}
                  label="Дата начала тура"
                  onChange={(e) => setSelectedDate(e.target.value)}
                >
                  {tour.availableDates.map((date) => (
                    <MenuItem key={date} value={date}>
                      {new Date(date).toLocaleDateString('ru-RU', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Количество участников</InputLabel>
                <Select
                  value={participants}
                  label="Количество участников"
                  onChange={(e) => setParticipants(Number(e.target.value))}
                >
                  {[...Array(tour.maxParticipants)].map((_, i) => (
                    <MenuItem key={i + 1} value={i + 1}>
                      {i + 1}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Typography variant="h6" gutterBottom>
                Итого: {(tour.price * participants).toLocaleString()} ₸
              </Typography>
            </Box>
          )}
        </DialogContent>
        
        {!bookingSuccess && (
          <DialogActions>
            <Button onClick={() => setBookingDialogOpen(false)}>Отмена</Button>
            <Button variant="contained" onClick={handleBookingSubmit}>
              Забронировать
            </Button>
          </DialogActions>
        )}
      </Dialog>
    </Container>
  );
};

export default TourDetailsPage; 