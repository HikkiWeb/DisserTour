import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  TextField,
  Button,
  Avatar,
  Tab,
  Tabs,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardContent,
  IconButton,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  InputAdornment,
  LinearProgress,

} from '@mui/material';
import {
  Person,
  Email,
  Phone,
  Edit,
  Save,
  Cancel,
  Lock,
  PhotoCamera,
  Tour,
  Star,
  TrendingUp,
  Assessment,
  History,
  Visibility,
  VisibilityOff,
  LocationOn,
  CalendarToday,
  AttachMoney,
  RateReview,
  EmojiEvents,
} from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import { User, Booking, Review } from '../types';

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
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const profileSchema = yup.object({
  firstName: yup.string().required('Имя обязательно'),
  lastName: yup.string().required('Фамилия обязательна'),
  email: yup.string().email('Некорректный email').required('Email обязателен'),
  phone: yup.string(),
});

const passwordSchema = yup.object({
  currentPassword: yup.string().required('Текущий пароль обязателен'),
  newPassword: yup.string().min(6, 'Пароль должен быть не менее 6 символов').required('Новый пароль обязателен'),
  confirmPassword: yup.string()
    .oneOf([yup.ref('newPassword')], 'Пароли должны совпадать')
    .required('Подтверждение пароля обязательно'),
});

const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [myBookings, setMyBookings] = useState<Booking[]>([]);
  const [myReviews, setMyReviews] = useState<Review[]>([]);
  const [userStats, setUserStats] = useState<any>(null);
  const [statsLoading, setStatsLoading] = useState(false);

  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: profileErrors },
    reset: resetProfile,
    setValue: setProfileValue,
  } = useForm({
    resolver: yupResolver(profileSchema),
  });

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: passwordErrors },
    reset: resetPassword,
  } = useForm({
    resolver: yupResolver(passwordSchema),
  });

  useEffect(() => {
    if (user) {
      setProfileValue('firstName', user.firstName);
      setProfileValue('lastName', user.lastName);
      setProfileValue('email', user.email);
      setProfileValue('phone', user.phone || '');
    }
  }, [user, setProfileValue]);

  useEffect(() => {
    if (tabValue === 1) {
      loadBookings();
    } else if (tabValue === 2) {
      loadReviews();
    } else if (tabValue === 3) {
      loadUserStats();
    }
  }, [tabValue]);

  const loadBookings = async () => {
    try {
      setStatsLoading(true);
      const response = await apiService.getMyBookings();
      if (response.status === 'success' && response.data) {
        setMyBookings(response.data.bookings || []);
      }
    } catch (error) {
      console.error('Ошибка загрузки бронирований:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  const loadReviews = async () => {
    try {
      setStatsLoading(true);
      const response = await apiService.getMyReviews();
      if (response.status === 'success' && response.data) {
        setMyReviews(response.data.reviews || []);
      }
    } catch (error) {
      console.error('Ошибка загрузки отзывов:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  const loadUserStats = async () => {
    try {
      setStatsLoading(true);
      const response = await apiService.getUserStats();
      if (response.status === 'success' && response.data) {
        setUserStats(response.data);
      }
    } catch (error) {
      console.error('Ошибка загрузки статистики:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleEditProfile = () => {
    setEditing(true);
    setMessage(null);
  };

  const handleCancelEdit = () => {
    setEditing(false);
    resetProfile();
    if (user) {
      setProfileValue('firstName', user.firstName);
      setProfileValue('lastName', user.lastName);
      setProfileValue('email', user.email);
      setProfileValue('phone', user.phone || '');
    }
  };

  const onSubmitProfile = async (data: any) => {
    try {
      setLoading(true);
      setMessage(null);

      const response = await apiService.updateProfile(data);
      
      if (response.status === 'success' && response.data) {
        updateUser(response.data.user);
        setEditing(false);
        setMessage({ type: 'success', text: response.message || 'Профиль успешно обновлен!' });
      }
    } catch (error: any) {
      let errorMessage = 'Ошибка при обновлении профиля';
      
      if (error.response?.data?.errors) {
        errorMessage = error.response.data.errors.map((err: any) => err.message).join(', ');
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const onSubmitPassword = async (data: any) => {
    try {
      setLoading(true);
      setMessage(null);

      const response = await apiService.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });

      if (response.status === 'success') {
        setPasswordDialogOpen(false);
        resetPassword();
        setMessage({ type: 'success', text: 'Пароль успешно изменен!' });
      }
    } catch (error: any) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Ошибка при изменении пароля' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      setMessage(null);

      const formData = new FormData();
      formData.append('avatar', file);

      const response = await apiService.uploadAvatar(formData);
      
      if (response.status === 'success' && response.data) {
        updateUser(response.data.user);
        setMessage({ type: 'success', text: 'Аватар успешно обновлен!' });
      }
    } catch (error: any) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Ошибка при загрузке аватара' 
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'success';
      case 'pending': return 'warning';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Подтверждено';
      case 'pending': return 'Ожидает подтверждения';
      case 'cancelled': return 'Отменено';
      default: return status;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-KZ', {
      style: 'currency',
      currency: 'KZT',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (!user) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">Пользователь не найден</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
        Мой профиль
      </Typography>

      {message && (
        <Alert severity={message.type} sx={{ mb: 3 }}>
          {message.text}
        </Alert>
      )}

      {/* Заголовок профиля */}
      <Paper elevation={2} sx={{ mb: 3, p: 3, borderRadius: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <Box sx={{ position: 'relative' }}>
            <Avatar
              src={user?.avatar ? (
                user.avatar.startsWith('http') 
                  ? user.avatar 
                  : `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${user.avatar.startsWith('/') ? '' : '/'}${user.avatar}`
              ) : undefined}
              sx={{ 
                width: 100, 
                height: 100,
                fontSize: '2rem',
                bgcolor: 'primary.main'
              }}
            >
              {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
            </Avatar>
            <IconButton
              component="label"
              sx={{
                position: 'absolute',
                bottom: -5,
                right: -5,
                backgroundColor: 'primary.main',
                color: 'white',
                width: 35,
                height: 35,
                '&:hover': {
                  backgroundColor: 'primary.dark',
                },
              }}
            >
              <PhotoCamera fontSize="small" />
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={handleAvatarUpload}
              />
            </IconButton>
          </Box>

          <Box sx={{ flex: 1 }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
              {user?.firstName} {user?.lastName}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Email fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                {user?.email}
              </Typography>
            </Box>
            {user?.phone && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Phone fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  {user.phone}
                </Typography>
              </Box>
            )}
            <Chip
              label={user?.role === 'admin' ? 'Администратор' : 'Пользователь'}
              color={user?.role === 'admin' ? 'error' : 'default'}
              size="small"
              sx={{ mt: 1 }}
            />
          </Box>
        </Box>
      </Paper>

      <Paper elevation={2} sx={{ borderRadius: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab 
            icon={<Person />} 
            label="Основная информация" 
            iconPosition="start"
          />
          <Tab 
            icon={<Tour />} 
            label="Мои бронирования" 
            iconPosition="start"
          />
          <Tab 
            icon={<RateReview />} 
            label="Мои отзывы" 
            iconPosition="start"
          />
          <Tab 
            icon={<Assessment />} 
            label="Статистика" 
            iconPosition="start"
          />
        </Tabs>

        {/* Основная информация */}
        <TabPanel value={tabValue} index={0}>
          <Box component="form" onSubmit={handleSubmitProfile(onSubmitProfile)}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
                <TextField
                  {...registerProfile('firstName')}
                  fullWidth
                  label="Имя"
                  disabled={!editing}
                  error={!!profileErrors.firstName}
                  helperText={profileErrors.firstName?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  {...registerProfile('lastName')}
                  fullWidth
                  label="Фамилия"
                  disabled={!editing}
                  error={!!profileErrors.lastName}
                  helperText={profileErrors.lastName?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>
              <TextField
                {...registerProfile('email')}
                fullWidth
                label="Email"
                type="email"
                disabled={!editing}
                error={!!profileErrors.email}
                helperText={profileErrors.email?.message}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email color="action" />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                {...registerProfile('phone')}
                fullWidth
                label="Телефон"
                disabled={!editing}
                error={!!profileErrors.phone}
                helperText={profileErrors.phone?.message}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Phone color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            <Divider sx={{ my: 3 }} />

            <Box sx={{ display: 'flex', gap: 2 }}>
              {editing ? (
                <>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={loading ? <CircularProgress size={20} /> : <Save />}
                    disabled={loading}
                    size="large"
                  >
                    {loading ? 'Сохранение...' : 'Сохранить'}
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Cancel />}
                    onClick={handleCancelEdit}
                    disabled={loading}
                    size="large"
                  >
                    Отмена
                  </Button>
                </>
              ) : (
                <Button
                  variant="contained"
                  startIcon={<Edit />}
                  onClick={handleEditProfile}
                  size="large"
                >
                  Редактировать профиль
                </Button>
              )}
              <Button
                variant="outlined"
                startIcon={<Lock />}
                onClick={() => setPasswordDialogOpen(true)}
                size="large"
              >
                Изменить пароль
              </Button>
            </Box>
          </Box>
        </TabPanel>

        {/* Мои бронирования */}
        <TabPanel value={tabValue} index={1}>
          {statsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : myBookings.length === 0 ? (
            <Box sx={{ textAlign: 'center', p: 6 }}>
              <Tour sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                У вас пока нет бронирований
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Забронируйте свой первый тур и начните путешествовать!
              </Typography>
            </Box>
          ) : (
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, 
              gap: 3 
            }}>
              {myBookings.map((booking) => (
                <Card key={booking.id} elevation={1} sx={{ height: '100%', borderRadius: 2 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Typography variant="h6" gutterBottom>
                        Бронирование #{booking.id.slice(-8)}
                      </Typography>
                      <Chip
                        label={getStatusText(booking.status)}
                        color={getStatusColor(booking.status) as any}
                        size="small"
                      />
                    </Box>
                    
                    <List dense>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemIcon>
                          <CalendarToday fontSize="small" />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Дата начала"
                          secondary={new Date(booking.startDate).toLocaleDateString('ru-RU')}
                        />
                      </ListItem>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemIcon>
                          <Person fontSize="small" />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Участники"
                          secondary={`${booking.participants} чел.`}
                        />
                      </ListItem>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemIcon>
                          <AttachMoney fontSize="small" />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Стоимость"
                          secondary={formatCurrency(booking.totalPrice)}
                        />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}
        </TabPanel>

        {/* Мои отзывы */}
        <TabPanel value={tabValue} index={2}>
          {statsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : myReviews.length === 0 ? (
            <Box sx={{ textAlign: 'center', p: 6 }}>
              <Star sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                У вас пока нет отзывов
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Оставьте отзыв о посещенном туре!
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {myReviews.map((review) => (
                <Card key={review.id} elevation={1} sx={{ borderRadius: 2 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            sx={{
                              color: i < review.rating ? 'warning.main' : 'grey.300',
                              fontSize: 20,
                            }}
                          />
                        ))}
                        <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                          {review.rating}/5
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(review.createdAt).toLocaleDateString('ru-RU')}
                      </Typography>
                    </Box>
                    {review.title && (
                      <Typography variant="h6" gutterBottom>
                        {review.title}
                      </Typography>
                    )}
                    <Typography variant="body1">
                      {review.comment}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}
        </TabPanel>

        {/* Статистика */}
        <TabPanel value={tabValue} index={3}>
          {statsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, 
                gap: 3 
              }}>
                {/* Статистика бронирований */}
                <Card elevation={1} sx={{ borderRadius: 2, height: '100%' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Tour sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography variant="h6">Бронирования</Typography>
                    </Box>
                    {userStats?.bookings?.length > 0 ? (
                      <Box>
                        {userStats.bookings.map((stat: any) => (
                          <Box key={stat.status} sx={{ mb: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                              <Typography variant="body2">
                                {getStatusText(stat.status)}
                              </Typography>
                              <Typography variant="body2" fontWeight="bold">
                                {stat.count}
                              </Typography>
                            </Box>
                            <LinearProgress 
                              variant="determinate" 
                              value={(stat.count / userStats.bookings.reduce((acc: number, s: any) => acc + parseInt(s.count), 0)) * 100}
                              color={getStatusColor(stat.status) as any}
                            />
                          </Box>
                        ))}
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Нет данных о бронированиях
                      </Typography>
                    )}
                  </CardContent>
                </Card>

                {/* Статистика отзывов */}
                <Card elevation={1} sx={{ borderRadius: 2, height: '100%' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Star sx={{ mr: 1, color: 'warning.main' }} />
                      <Typography variant="h6">Отзывы</Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h3" color="primary.main" gutterBottom>
                        {userStats?.reviews?.totalReviews || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Всего отзывов
                      </Typography>
                      {userStats?.reviews?.averageRating > 0 && (
                        <>
                          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 2 }}>
                            <Star sx={{ color: 'warning.main', mr: 0.5 }} />
                            <Typography variant="h5" color="warning.main">
                              {parseFloat(userStats.reviews.averageRating).toFixed(1)}
                            </Typography>
                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            Средняя оценка
                          </Typography>
                        </>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Box>

              {/* Общая потраченная сумма */}
              <Card elevation={1} sx={{ borderRadius: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 2 }}>
                    <EmojiEvents sx={{ mr: 2, color: 'success.main', fontSize: 40 }} />
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="success.main" gutterBottom>
                        {formatCurrency(userStats?.totalSpent || 0)}
                      </Typography>
                      <Typography variant="h6" color="text.secondary">
                        Общая сумма путешествий
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          )}
        </TabPanel>
      </Paper>

      {/* Диалог смены пароля */}
      <Dialog
        open={passwordDialogOpen}
        onClose={() => setPasswordDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Lock sx={{ mr: 1 }} />
            Изменить пароль
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmitPassword(onSubmitPassword)} sx={{ pt: 2 }}>
            <TextField
              {...registerPassword('currentPassword')}
              fullWidth
              label="Текущий пароль"
              type={showCurrentPassword ? 'text' : 'password'}
              margin="normal"
              error={!!passwordErrors.currentPassword}
              helperText={passwordErrors.currentPassword?.message}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      edge="end"
                    >
                      {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            
            <TextField
              {...registerPassword('newPassword')}
              fullWidth
              label="Новый пароль"
              type={showNewPassword ? 'text' : 'password'}
              margin="normal"
              error={!!passwordErrors.newPassword}
              helperText={passwordErrors.newPassword?.message}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      edge="end"
                    >
                      {showNewPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            
            <TextField
              {...registerPassword('confirmPassword')}
              fullWidth
              label="Подтвердите новый пароль"
              type={showConfirmPassword ? 'text' : 'password'}
              margin="normal"
              error={!!passwordErrors.confirmPassword}
              helperText={passwordErrors.confirmPassword?.message}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      edge="end"
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button 
            onClick={() => {
              setPasswordDialogOpen(false);
              resetPassword();
            }}
            size="large"
          >
            Отмена
          </Button>
          <Button 
            onClick={handleSubmitPassword(onSubmitPassword)}
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <Lock />}
            size="large"
          >
            {loading ? 'Изменение...' : 'Изменить пароль'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ProfilePage; 