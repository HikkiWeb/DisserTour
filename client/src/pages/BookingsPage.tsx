import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Grid,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Tab,
  Tabs,
  Divider,
} from '@mui/material';
import {
  CalendarToday,
  People,
  AttachMoney,
  LocationOn,
  Cancel,
  CheckCircle,
  Pending,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import { Booking, Tour } from '../types';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`bookings-tabpanel-${index}`}
      aria-labelledby={`bookings-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const BookingsPage: React.FC = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [tabValue, setTabValue] = useState(0);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await apiService.getMyBookings();
      
      if (response.status === 'success' && response.data) {
        setBookings(response.data.bookings || []);
      }
    } catch (err: any) {
      console.error('Ошибка загрузки бронирований:', err);
      setError('Ошибка загрузки бронирований');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleCancelBooking = async () => {
    if (!selectedBooking || !cancelReason.trim()) return;

    try {
      setCancelling(true);
      setError(''); // Очищаем предыдущие ошибки
      
      const response = await apiService.cancelBooking(selectedBooking.id, cancelReason);
      
              if (response.status === 'success') {
          await loadBookings(); // Перезагружаем список
          setCancelDialogOpen(false);
          setCancelReason('');
          setSelectedBooking(null);
          setSuccess('Бронирование успешно отменено');
          // Скрываем сообщение об успехе через 5 секунд
          setTimeout(() => setSuccess(''), 5000);
        } else {
        setError(response.message || 'Ошибка при отмене бронирования');
      }
    } catch (err: any) {
      console.error('Ошибка отмены бронирования:', err);
      
      let errorMessage = 'Произошла ошибка при отмене бронирования';
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      }
      
      setError(errorMessage);
    } finally {
      setCancelling(false);
    }
  };

  const openCancelDialog = (booking: Booking) => {
    setSelectedBooking(booking);
    setCancelDialogOpen(true);
  };

  const closeCancelDialog = () => {
    setCancelDialogOpen(false);
    setCancelReason('');
    setSelectedBooking(null);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle color="success" />;
      case 'pending':
        return <Pending color="warning" />;
      case 'cancelled':
        return <Cancel color="error" />;
      case 'completed':
        return <CheckCircle color="info" />;
      default:
        return <Pending color="disabled" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'success';
      case 'pending': return 'warning';
      case 'cancelled': return 'error';
      case 'completed': return 'info';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Подтверждено';
      case 'pending': return 'Ожидает подтверждения';
      case 'cancelled': return 'Отменено';
      case 'completed': return 'Завершено';
      default: return status;
    }
  };

  const filterBookings = (status?: string) => {
    if (!status) return bookings;
    return bookings.filter(booking => booking.status === status);
  };

  const getTabBookings = () => {
    switch (tabValue) {
      case 0: return bookings; // Все
      case 1: return filterBookings('pending'); // Ожидающие
      case 2: return filterBookings('confirmed'); // Подтвержденные
      case 3: return filterBookings('completed'); // Завершенные
      case 4: return filterBookings('cancelled'); // Отмененные
      default: return bookings;
    }
  };

  const canCancelBooking = (booking: Booking) => {
    return booking.status === 'pending' || booking.status === 'confirmed';
  };

  const renderBookingCard = (booking: Booking) => (
    <Card key={booking.id} sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Typography variant="h6" component="h3">
            Бронирование #{booking.id.slice(-8)}
          </Typography>
          <Chip
            icon={getStatusIcon(booking.status)}
            label={getStatusText(booking.status)}
            color={getStatusColor(booking.status) as any}
            variant="outlined"
          />
        </Box>

        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <CalendarToday fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
              <Typography variant="body2">
                Дата начала: {new Date(booking.startDate).toLocaleDateString('ru-RU')}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <People fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
              <Typography variant="body2">
                Участников: {booking.participants}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <AttachMoney fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
              <Typography variant="body2">
                Общая стоимость: ₸{booking.totalPrice.toLocaleString('ru-RU')}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Дата бронирования: {new Date(booking.createdAt).toLocaleDateString('ru-RU')}
            </Typography>
            
            {booking.specialRequests && (
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Особые пожелания: {booking.specialRequests}
              </Typography>
            )}
          </Box>
        </Box>
      </CardContent>

      {canCancelBooking(booking) && (
        <CardActions>
          <Button
            size="small"
            color="error"
            variant="outlined"
            onClick={() => openCancelDialog(booking)}
            startIcon={<Cancel />}
          >
            Отменить бронирование
          </Button>
        </CardActions>
      )}
    </Card>
  );

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Мои бронирования
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      <Paper sx={{ mb: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          variant="fullWidth"
        >
          <Tab label={`Все (${bookings.length})`} />
          <Tab label={`Ожидающие (${filterBookings('pending').length})`} />
          <Tab label={`Подтвержденные (${filterBookings('confirmed').length})`} />
          <Tab label={`Завершенные (${filterBookings('completed').length})`} />
          <Tab label={`Отмененные (${filterBookings('cancelled').length})`} />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          {bookings.length > 0 ? (
            <Box>
              {bookings.map(renderBookingCard)}
            </Box>
          ) : (
            <Box textAlign="center" py={4}>
              <Typography variant="h6" color="text.secondary">
                У вас пока нет бронирований
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Начните с просмотра наших туров
              </Typography>
            </Box>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          {filterBookings('pending').length > 0 ? (
            <Box>
              {filterBookings('pending').map(renderBookingCard)}
            </Box>
          ) : (
            <Box textAlign="center" py={4}>
              <Typography variant="h6" color="text.secondary">
                Нет ожидающих бронирований
              </Typography>
            </Box>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          {filterBookings('confirmed').length > 0 ? (
            <Box>
              {filterBookings('confirmed').map(renderBookingCard)}
            </Box>
          ) : (
            <Box textAlign="center" py={4}>
              <Typography variant="h6" color="text.secondary">
                Нет подтвержденных бронирований
              </Typography>
            </Box>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          {filterBookings('completed').length > 0 ? (
            <Box>
              {filterBookings('completed').map(renderBookingCard)}
            </Box>
          ) : (
            <Box textAlign="center" py={4}>
              <Typography variant="h6" color="text.secondary">
                Нет завершенных бронирований
              </Typography>
            </Box>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={4}>
          {filterBookings('cancelled').length > 0 ? (
            <Box>
              {filterBookings('cancelled').map(renderBookingCard)}
            </Box>
          ) : (
            <Box textAlign="center" py={4}>
              <Typography variant="h6" color="text.secondary">
                Нет отмененных бронирований
              </Typography>
            </Box>
          )}
        </TabPanel>
      </Paper>

      {/* Диалог отмены бронирования */}
      <Dialog
        open={cancelDialogOpen}
        onClose={closeCancelDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Отмена бронирования</DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Вы уверены, что хотите отменить это бронирование?
          </Typography>
          
          {selectedBooking && (
            <Box sx={{ mt: 2, p: 2, backgroundColor: 'grey.100', borderRadius: 1 }}>
              <Typography variant="subtitle2">
                Бронирование #{selectedBooking.id.slice(-8)}
              </Typography>
              <Typography variant="body2">
                Дата: {new Date(selectedBooking.startDate).toLocaleDateString('ru-RU')}
              </Typography>
              <Typography variant="body2">
                Участников: {selectedBooking.participants}
              </Typography>
              <Typography variant="body2">
                Стоимость: {selectedBooking.totalPrice.toLocaleString()} ₸
              </Typography>
            </Box>
          )}

          <TextField
            fullWidth
            multiline
            rows={3}
            label="Причина отмены"
            placeholder="Укажите причину отмены бронирования..."
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            sx={{ mt: 2 }}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeCancelDialog} disabled={cancelling}>
            Отмена
          </Button>
          <Button 
            onClick={handleCancelBooking}
            variant="contained"
            color="error"
            disabled={cancelling || !cancelReason.trim()}
          >
            {cancelling ? <CircularProgress size={20} /> : 'Отменить бронирование'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default BookingsPage; 