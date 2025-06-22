import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { AuthProvider } from './context/AuthContext';

// Компоненты страниц
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import ToursPage from './pages/ToursPage';
import TourDetailsPage from './pages/TourDetailsPage';
import BookingsPage from './pages/BookingsPage';
import ProfilePage from './pages/ProfilePage';
import DashboardPage from './pages/DashboardPage';

// Компоненты макета
import Layout from './components/Layout/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import ChatWidget from './components/AIAssistant/ChatWidget';

// Тема Material-UI
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Jura", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      fontOpticalSizing: 'auto',
      letterSpacing: '-0.01em',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      fontOpticalSizing: 'auto',
      letterSpacing: '-0.005em',
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      fontOpticalSizing: 'auto',
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      fontOpticalSizing: 'auto',
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
      fontOpticalSizing: 'auto',
    },
    h6: {
      fontSize: '1.125rem',
      fontWeight: 600,
      fontOpticalSizing: 'auto',
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
      fontOpticalSizing: 'auto',
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
      fontOpticalSizing: 'auto',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)', 
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Layout>
            <Routes>
              {/* Публичные маршруты */}
              <Route path="/" element={<HomePage />} />
              <Route path="/tours" element={<ToursPage />} />
              <Route path="/tours/:id" element={<TourDetailsPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/verify-email" element={<VerifyEmailPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />

              {/* Защищенные маршруты */}
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/bookings"
                element={
                  <ProtectedRoute>
                    <BookingsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute roles={['admin']}>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />

              {/* Перенаправление */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Layout>
          
          {/* AI Ассистент */}
          <ChatWidget />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App; 