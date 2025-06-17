import React, { useState } from 'react';
import {
  Container,
  Paper,
  Box,
  Typography,
  TextField,
  Button,
  Link,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '../context/AuthContext';
import { LoginCredentials } from '../types';

// Схема валидации
const schema = yup.object({
  email: yup
    .string()
    .email('Введите корректный email')
    .required('Email обязателен'),
  password: yup
    .string()
    .min(6, 'Пароль должен содержать минимум 6 символов')
    .required('Пароль обязателен'),
});

const LoginPage: React.FC = () => {
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState<string>('');
  const [info, setInfo] = useState<string>('');

  const from = (location.state as any)?.from?.pathname || '/';
  const message = (location.state as any)?.message;

  React.useEffect(() => {
    if (message) {
      setInfo(message);
    }
  }, [message]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginCredentials>({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: LoginCredentials) => {
    try {
      setError('');
      await login(data.email, data.password);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка входа в систему');
    }
  };

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
          <Typography component="h1" variant="h4" gutterBottom>
            Вход в систему
          </Typography>

          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {error}
            </Alert>
          )}

          {info && (
            <Alert severity="success" sx={{ width: '100%', mb: 2 }}>
              {info}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 1, width: '100%' }}>
            <TextField
              {...register('email')}
              margin="normal"
              required
              fullWidth
              label="Email"
              type="email"
              autoComplete="email"
              autoFocus
              error={!!errors.email}
              helperText={errors.email?.message}
            />
            
            <TextField
              {...register('password')}
              margin="normal"
              required
              fullWidth
              label="Пароль"
              type="password"
              autoComplete="current-password"
              error={!!errors.password}
              helperText={errors.password?.message}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={isLoading}
              startIcon={isLoading ? <CircularProgress size={20} /> : null}
            >
              {isLoading ? 'Вход...' : 'Войти'}
            </Button>

            <Box sx={{ textAlign: 'center' }}>
              <Link component={RouterLink} to="/register" variant="body2">
                Нет аккаунта? Зарегистрируйтесь
              </Link>
            </Box>

            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Link component={RouterLink} to="/forgot-password" variant="body2">
                Забыли пароль?
              </Link>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default LoginPage; 