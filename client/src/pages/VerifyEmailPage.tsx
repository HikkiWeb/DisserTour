import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Paper,
  Box,
  Typography,
  Alert,
  CircularProgress,
  Button,
} from '@mui/material';
import { CheckCircleOutline, ErrorOutline } from '@mui/icons-material';

const VerifyEmailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  
  const token = searchParams.get('token');

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Токен подтверждения не найден в URL');
        return;
      }

      // Защита от двойных запросов в React Strict Mode
      if (isProcessing) {
        return;
      }
      setIsProcessing(true);

      console.log('🔍 Проверка токена:', token);

      try {
        // Кодируем токен для безопасности URL
        const encodedToken = encodeURIComponent(token);
        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
        const url = `${apiUrl}/auth/verify-email/${encodedToken}`;
        
        console.log('📡 Отправка запроса на:', url);

        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();
        console.log('📝 Ответ сервера:', { status: response.status, data });

        if (response.ok && data.status === 'success') {
          setStatus('success');
          setMessage(data.message || 'Email успешно подтвержден!');
          
          // Перенаправляем на страницу входа через 3 секунды
          setTimeout(() => {
            navigate('/login', { 
              state: { 
                message: 'Email подтвержден! Теперь вы можете войти в систему.' 
              } 
            });
          }, 3000);
        } else {
          setStatus('error');
          setMessage(data.message || `Ошибка подтверждения email (${response.status})`);
        }
      } catch (error: any) {
        console.error('❌ Ошибка при подтверждении email:', error);
        setStatus('error');
        setMessage(`Произошла ошибка при подтверждении email: ${error.message}`);
      } finally {
        setIsProcessing(false);
      }
    };

    // Добавляем небольшую задержку чтобы избежать дублирования в React Strict Mode
    const timeoutId = setTimeout(verifyEmail, 100);
    
    return () => clearTimeout(timeoutId);
  }, [token, navigate, isProcessing]);

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
          <Typography component="h1" variant="h4" gutterBottom>
            Подтверждение Email
          </Typography>

          {status === 'loading' && (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <CircularProgress size={60} />
              <Typography variant="body1">
                Подтверждение вашего email адреса...
              </Typography>
            </Box>
          )}

          {status === 'success' && (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <CheckCircleOutline sx={{ fontSize: 80, color: 'success.main' }} />
              <Alert severity="success" sx={{ width: '100%' }}>
                {message}
              </Alert>
              <Typography variant="body2" color="text.secondary">
                Вы будете перенаправлены на страницу входа через несколько секунд...
              </Typography>
              <Button
                component={RouterLink}
                to="/login"
                variant="contained"
                sx={{ mt: 2 }}
              >
                Войти сейчас
              </Button>
            </Box>
          )}

          {status === 'error' && (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <ErrorOutline sx={{ fontSize: 80, color: 'error.main' }} />
              <Alert severity="error" sx={{ width: '100%' }}>
                {message}
              </Alert>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Возможные причины:
              </Typography>
              <Typography variant="body2" color="text.secondary" component="ul" sx={{ textAlign: 'left' }}>
                <li>Ссылка устарела или недействительна</li>
                <li>Email уже был подтвержден ранее</li>
                <li>Проблемы с подключением к серверу</li>
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                <Button
                  component={RouterLink}
                  to="/login"
                  variant="outlined"
                >
                  Попробовать войти
                </Button>
                <Button
                  component={RouterLink}
                  to="/register"
                  variant="contained"
                >
                  Зарегистрироваться снова
                </Button>
              </Box>
            </Box>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default VerifyEmailPage; 