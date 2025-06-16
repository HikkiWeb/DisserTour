import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { apiService } from '../services/api';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

interface AuthContextType extends AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
  checkAuth: () => Promise<void>;
  updateUser: (userData: User) => void;
}

interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: User }
  | { type: 'LOGIN_ERROR'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_USER'; payload: User }
  | { type: 'SET_LOADING'; payload: boolean };

const initialState: AuthState = {
  user: null,
  loading: true,
  error: null,
};

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, loading: true, error: null };
    case 'LOGIN_SUCCESS':
      return { ...state, user: action.payload, loading: false, error: null };
    case 'LOGIN_ERROR':
      return { ...state, loading: false, error: action.payload };
    case 'LOGOUT':
      return { ...state, user: null, loading: false, error: null };
    case 'UPDATE_USER':
      return { ...state, user: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    default:
      return state;
  }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      dispatch({ type: 'SET_LOADING', payload: false });
      return;
    }

    try {
      const response = await apiService.getCurrentUser();
      if (response.status === 'success' && response.data) {
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: response.data.user,
        });
      } else {
        localStorage.removeItem('token');
        dispatch({ type: 'LOGOUT' });
      }
    } catch (error) {
      localStorage.removeItem('token');
      dispatch({ type: 'LOGOUT' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const login = async (email: string, password: string) => {
    dispatch({ type: 'LOGIN_START' });
    try {
      const response = await apiService.login(email, password);
      if (response.status === 'success' && response.data) {
        const { user, token } = response.data;
        localStorage.setItem('token', token);
        apiService.setToken(token);
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: user,
        });
      } else {
        throw new Error(response.message || 'Ошибка входа');
      }
    } catch (error: any) {
      dispatch({
        type: 'LOGIN_ERROR',
        payload: error.message || 'Ошибка входа',
      });
      throw error;
    }
  };

  const register = async (userData: RegisterData) => {
    dispatch({ type: 'LOGIN_START' });
    try {
      const response = await apiService.register(userData);
      if (response.status === 'success' && response.data) {
        const { user, token } = response.data;
        localStorage.setItem('token', token);
        apiService.setToken(token);
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: user,
        });
      } else {
        throw new Error(response.message || 'Ошибка регистрации');
      }
    } catch (error: any) {
      dispatch({
        type: 'LOGIN_ERROR',
        payload: error.message || 'Ошибка регистрации',
      });
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    apiService.clearToken();
    dispatch({ type: 'LOGOUT' });
  };

  const updateProfile = async (data: Partial<User>) => {
    try {
      const response = await apiService.updateProfile(data);
      if (response.status === 'success' && response.data) {
        dispatch({
          type: 'UPDATE_USER',
          payload: response.data.user,
        });
      }
    } catch (error) {
      throw error;
    }
  };

  const updateUser = (userData: User) => {
    dispatch({ type: 'UPDATE_USER', payload: userData });
  };

  const value: AuthContextType = {
    ...state,
    isAuthenticated: !!state.user,
    isLoading: state.loading,
    login,
    register,
    logout,
    updateProfile,
    checkAuth,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 