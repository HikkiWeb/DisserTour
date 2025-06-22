import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Box,
  Typography,
  Button,
  Link,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Link as RouterLink, useSearchParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { apiService } from '../services/api';
import { LockReset } from '@mui/icons-material';
import PasswordField from '../components/PasswordField';

// Схема валидации
const schema = yup.object({
  password: yup
    .string()
    .min(6, 'Пароль должен содержать минимум 6 символов')
    .required('Новый пароль обязателен'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Пароли должны совпадать')
    .required('Подтверждение пароля обязательно'),
});

interface ResetPasswordFormData {
  password: string;
  confirmPassword: string;
}

const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  
  const token = searchParams.get('token');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    if (!token) {
      setError('Токен сброса пароля не найден в URL');
    }
  }, [token]);

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      setError('Токен сброса пароля не найден');
      return;
    }

    try {
      setError('');
      setSuccess('');
      setIsLoading(true);

      const response = await apiService.resetPassword(token, data.password);
      
      if (response.status === 'success') {
        setSuccess(response.data?.message || 'Пароль успешно изменен');
        
        // Перенаправляем на страницу входа через 3 секунды
        setTimeout(() => {
          navigate('/login', { 
            state: { 
              message: 'Пароль успешно изменен! Войдите с новым паролем.' 
            } 
          });
        }, 3000);
      } else {
        setError(response.message || 'Ошибка при смене пароля');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Произошла ошибка при смене пароля');
    } finally {
      setIsLoading(false);
    }
  };



  if (!token) {
    return (
      <Container component="main" maxWidth="sm">
        <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Paper
            elevation={3}
            sx={{
              padding: 4,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              width: '100%',
              textAlign: 'center',
            }}
          >
            <Typography component="h1" variant="h4" gutterBottom color="error">
              Ошибка
            </Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>
              Недействительная ссылка сброса пароля
            </Typography>
            <Button
              component={RouterLink}
              to="/forgot-password"
              variant="contained"
            >
              Запросить новую ссылку
            </Button>
          </Paper>
        </Box>
      </Container>
    );
  }

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <Box sx={{ mb: 2 }}>
            <LockReset sx={{ fontSize: 48, color: 'primary.main' }} />
          </Box>

          <Typography component="h1" variant="h4" gutterBottom>
            Новый пароль
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
            Введите новый пароль для вашего аккаунта
          </Typography>

          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ width: '100%', mb: 2 }}>
              {success}
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Вы будете перенаправлены на страницу входа через несколько секунд...
                </Typography>
              </Box>
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 1, width: '100%' }}>
            <PasswordField
              {...register('password')}
              margin="normal"
              required
              fullWidth
              label="Новый пароль"
              autoComplete="new-password"
              autoFocus
              error={!!errors.password}
              helperText={errors.password?.message}
              disabled={isLoading}
            />

            <PasswordField
              {...register('confirmPassword')}
              margin="normal"
              required
              fullWidth
              label="Подтвердите новый пароль"
              autoComplete="new-password"
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword?.message}
              disabled={isLoading}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={isLoading || !!success}
              startIcon={isLoading ? <CircularProgress size={20} /> : null}
            >
              {isLoading ? 'Изменение пароля...' : 'Изменить пароль'}
            </Button>

            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Вспомнили пароль?{' '}
                <Link component={RouterLink} to="/login" variant="body2">
                  Войти в систему
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default ResetPasswordPage; 