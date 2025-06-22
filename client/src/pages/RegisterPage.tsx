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
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '../context/AuthContext';
import { RegisterData } from '../types';
import PasswordField from '../components/PasswordField';

// Схема валидации
const schema = yup.object({
  firstName: yup
    .string()
    .required('Имя обязательно')
    .min(2, 'Имя должно содержать минимум 2 символа'),
  lastName: yup
    .string()
    .required('Фамилия обязательна')
    .min(2, 'Фамилия должна содержать минимум 2 символа'),
  email: yup
    .string()
    .email('Введите корректный email')
    .required('Email обязателен'),
  password: yup
    .string()
    .min(6, 'Пароль должен содержать минимум 6 символов')
    .required('Пароль обязателен'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Пароли должны совпадать')
    .required('Подтверждение пароля обязательно'),
});

interface RegisterFormData extends RegisterData {
  confirmPassword: string;
}

const RegisterPage: React.FC = () => {
  const { register: registerUser, isLoading } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setError('');
      setSuccess('');
      
      const { confirmPassword, ...registerData } = data;
      const response = await registerUser(registerData);
      
      if (response && response.message) {
        setSuccess(response.message);
      } else {
        setSuccess('Регистрация успешна! Проверьте вашу почту для подтверждения аккаунта.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка регистрации');
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
            Регистрация
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
                  Не получили письмо? Проверьте папку "Спам" или попробуйте войти в систему.
                </Typography>
                <Button
                  component={RouterLink}
                  to="/login"
                  variant="outlined"
                  size="small"
                  sx={{ mt: 1 }}
                >
                  Перейти к входу
                </Button>
              </Box>
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 1, width: '100%' }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                {...register('firstName')}
                margin="normal"
                required
                fullWidth
                label="Имя"
                autoFocus
                error={!!errors.firstName}
                helperText={errors.firstName?.message}
              />
              
              <TextField
                {...register('lastName')}
                margin="normal"
                required
                fullWidth
                label="Фамилия"
                error={!!errors.lastName}
                helperText={errors.lastName?.message}
              />
            </Box>

            <TextField
              {...register('email')}
              margin="normal"
              required
              fullWidth
              label="Email"
              type="email"
              autoComplete="email"
              error={!!errors.email}
              helperText={errors.email?.message}
            />
            
            <PasswordField
              {...register('password')}
              margin="normal"
              required
              fullWidth
              label="Пароль"
              autoComplete="new-password"
              error={!!errors.password}
              helperText={errors.password?.message}
            />

            <PasswordField
              {...register('confirmPassword')}
              margin="normal"
              required
              fullWidth
              label="Подтвердите пароль"
              autoComplete="new-password"
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword?.message}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={isLoading}
              startIcon={isLoading ? <CircularProgress size={20} /> : null}
            >
              {isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
            </Button>

            <Box sx={{ textAlign: 'center' }}>
              <Link component={RouterLink} to="/login" variant="body2">
                Уже есть аккаунт? Войдите
              </Link>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default RegisterPage; 