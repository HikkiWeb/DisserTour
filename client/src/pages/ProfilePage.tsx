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
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Card,
  CardContent,
  IconButton,
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
  BookmarkBorder,
  Star,
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
  const [myBookings, setMyBookings] = useState<Booking[]>([]);
  const [myReviews, setMyReviews] = useState<Review[]>([]);
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
    }
  }, [user, setProfileValue]);

  useEffect(() => {
    if (tabValue === 1) {
      loadBookings();
    } else if (tabValue === 2) {
      loadReviews();
    }
  }, [tabValue]);

  const loadBookings = async () => {
    try {
      setStatsLoading(true);
      const response = await apiService.getMyBookings();
      if (response.status === 'success' && response.data) {
        setMyBookings(response.data.data);
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
        setMyReviews(response.data.data);
      }
    } catch (error) {
      console.error('Ошибка загрузки отзывов:', error);
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
        setMessage({ type: 'success', text: 'Профиль успешно обновлен!' });
      }
    } catch (error: any) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Ошибка при обновлении профиля' 
      });
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

  if (!user) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">Пользователь не найден</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Мой профиль
      </Typography>

      {message && (
        <Alert severity={message.type} sx={{ mb: 3 }}>
          {message.text}
        </Alert>
      )}

      <Paper sx={{ mb: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          variant="fullWidth"
        >
          <Tab label="Основная информация" />
          <Tab label="Мои бронирования" />
          <Tab label="Мои отзывы" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
            <Box sx={{ flex: '0 0 auto', width: { xs: '100%', md: '300px' } }}>
              <Box sx={{ textAlign: 'center' }}>
                <Box sx={{ position: 'relative', display: 'inline-block' }}>
                  <Avatar
                    src={user?.avatar}
                    sx={{ width: 120, height: 120, mb: 2, mx: 'auto' }}
                  >
                    {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                  </Avatar>
                  <IconButton
                    component="label"
                    sx={{
                      position: 'absolute',
                      bottom: 16,
                      right: -8,
                      backgroundColor: 'primary.main',
                      color: 'white',
                      '&:hover': {
                        backgroundColor: 'primary.dark',
                      },
                    }}
                  >
                    <PhotoCamera />
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={handleAvatarUpload}
                    />
                  </IconButton>
                </Box>
                <Typography variant="h5" gutterBottom>
                  {user?.firstName} {user?.lastName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {user?.email}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ flex: 1 }}>
              <Box component="form" onSubmit={handleSubmitProfile(onSubmitProfile)}>
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 2 }}>
                  <TextField
                    {...registerProfile('firstName')}
                    fullWidth
                    label="Имя"
                    disabled={!editing}
                    error={!!profileErrors.firstName}
                    helperText={profileErrors.firstName?.message}
                  />
                  <TextField
                    {...registerProfile('lastName')}
                    fullWidth
                    label="Фамилия"
                    disabled={!editing}
                    error={!!profileErrors.lastName}
                    helperText={profileErrors.lastName?.message}
                  />
                </Box>

                <TextField
                  {...registerProfile('email')}
                  fullWidth
                  label="Email"
                  type="email"
                  disabled={!editing}
                  sx={{ mb: 2 }}
                  error={!!profileErrors.email}
                  helperText={profileErrors.email?.message}
                />

                <TextField
                  {...registerProfile('phone')}
                  fullWidth
                  label="Телефон"
                  disabled={!editing}
                  sx={{ mb: 2 }}
                  error={!!profileErrors.phone}
                  helperText={profileErrors.phone?.message}
                />

                <Box sx={{ display: 'flex', gap: 2 }}>
                  {editing ? (
                    <>
                      <Button
                        type="submit"
                        variant="contained"
                        startIcon={<Save />}
                        disabled={loading}
                      >
                        Сохранить
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<Cancel />}
                        onClick={handleCancelEdit}
                        disabled={loading}
                      >
                        Отмена
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="contained"
                      startIcon={<Edit />}
                      onClick={handleEditProfile}
                    >
                      Редактировать
                    </Button>
                  )}
                  <Button
                    variant="outlined"
                    startIcon={<Lock />}
                    onClick={() => setPasswordDialogOpen(true)}
                  >
                    Изменить пароль
                  </Button>
                </Box>
              </Box>
            </Box>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          {statsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : myBookings.length === 0 ? (
            <Box sx={{ textAlign: 'center', p: 4 }}>
              <Tour sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                У вас пока нет бронирований
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {myBookings.map((booking) => (
                <Card key={booking.id}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Typography variant="h6">
                        Бронирование #{booking.id.slice(-8)}
                      </Typography>
                      <Chip
                        label={booking.status}
                        color={booking.status === 'confirmed' ? 'success' : 
                               booking.status === 'pending' ? 'warning' : 'error'}
                        variant="outlined"
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Дата: {new Date(booking.startDate).toLocaleDateString('ru-RU')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Участников: {booking.participants}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Стоимость: ₸{booking.totalPrice.toLocaleString('ru-RU')}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          {statsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : myReviews.length === 0 ? (
            <Box sx={{ textAlign: 'center', p: 4 }}>
              <Star sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                У вас пока нет отзывов
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {myReviews.map((review) => (
                <Card key={review.id}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Box sx={{ display: 'flex', mr: 1 }}>
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            sx={{
                              color: i < review.rating ? 'warning.main' : 'grey.300',
                              fontSize: 20,
                            }}
                          />
                        ))}
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(review.createdAt).toLocaleDateString('ru-RU')}
                      </Typography>
                    </Box>
                    <Typography variant="body1" paragraph>
                      {review.comment}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
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
      >
        <DialogTitle>Изменить пароль</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmitPassword(onSubmitPassword)} sx={{ pt: 2 }}>
            <TextField
              {...registerPassword('currentPassword')}
              fullWidth
              label="Текущий пароль"
              type="password"
              margin="normal"
              error={!!passwordErrors.currentPassword}
              helperText={passwordErrors.currentPassword?.message}
            />
            
            <TextField
              {...registerPassword('newPassword')}
              fullWidth
              label="Новый пароль"
              type="password"
              margin="normal"
              error={!!passwordErrors.newPassword}
              helperText={passwordErrors.newPassword?.message}
            />
            
            <TextField
              {...registerPassword('confirmPassword')}
              fullWidth
              label="Подтвердите новый пароль"
              type="password"
              margin="normal"
              error={!!passwordErrors.confirmPassword}
              helperText={passwordErrors.confirmPassword?.message}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPasswordDialogOpen(false)}>
            Отмена
          </Button>
          <Button 
            onClick={handleSubmitPassword(onSubmitPassword)}
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={20} /> : 'Изменить пароль'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ProfilePage; 