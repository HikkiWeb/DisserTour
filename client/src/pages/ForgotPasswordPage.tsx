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
import { Link as RouterLink } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { apiService } from '../services/api';
import { EmailOutlined, ArrowBack } from '@mui/icons-material';

// Схема валидации
const schema = yup.object({
  email: yup
    .string()
    .email('Введите корректный email')
    .required('Email обязателен'),
});

interface ForgotPasswordFormData {
  email: string;
}

const ForgotPasswordPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      setError('');
      setSuccess('');
      setIsLoading(true);

      const response = await apiService.forgotPassword(data.email);
      
      if (response.status === 'success') {
        setSuccess(response.data?.message || 'Инструкции по сбросу пароля отправлены на ваш email');
      } else {
        setError(response.message || 'Ошибка при отправке запроса');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Произошла ошибка при отправке запроса');
    } finally {
      setIsLoading(false);
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
          <Box sx={{ mb: 2 }}>
            <EmailOutlined sx={{ fontSize: 48, color: 'primary.main' }} />
          </Box>

          <Typography component="h1" variant="h4" gutterBottom>
            Забыли пароль?
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
            Введите ваш email адрес и мы отправим вам ссылку для сброса пароля
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
                  Проверьте папку "Спам", если письмо не пришло в течение нескольких минут.
                </Typography>
              </Box>
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 1, width: '100%' }}>
            <TextField
              {...register('email')}
              margin="normal"
              required
              fullWidth
              label="Email адрес"
              type="email"
              autoComplete="email"
              autoFocus
              error={!!errors.email}
              helperText={errors.email?.message}
              disabled={isLoading}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={isLoading}
              startIcon={isLoading ? <CircularProgress size={20} /> : null}
            >
              {isLoading ? 'Отправка...' : 'Отправить инструкции'}
            </Button>

            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Button
                component={RouterLink}
                to="/login"
                variant="text"
                startIcon={<ArrowBack />}
                sx={{ textTransform: 'none' }}
              >
                Вернуться к входу
              </Button>
            </Box>

            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Нет аккаунта?{' '}
                <Link component={RouterLink} to="/register" variant="body2">
                  Зарегистрируйтесь
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default ForgotPasswordPage; 