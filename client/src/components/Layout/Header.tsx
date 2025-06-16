import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Divider,
} from '@mui/material';
import {
  Menu as MenuIcon,
  AccountCircle,
  Dashboard,
  BookmarkBorder,
  ExitToApp,
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Header: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleClose();
    navigate('/');
  };

  return (
    <AppBar position="static" elevation={1}>
      <Toolbar>
        <Typography variant="h6" component={Link} to="/" sx={{ 
          flexGrow: 1, 
          textDecoration: 'none', 
          color: 'inherit',
          fontWeight: 'bold' 
        }}>
          Туры Казахстана
        </Typography>

        {/* Навигационные ссылки */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 2, mr: 2 }}>
          <Button color="inherit" component={Link} to="/tours">
            Туры
          </Button>
          {isAuthenticated && (
            <>
              <Button color="inherit" component={Link} to="/bookings">
                Мои бронирования
              </Button>
              {(user?.role === 'guide' || user?.role === 'admin') && (
                <Button color="inherit" component={Link} to="/dashboard">
                  Панель управления
                </Button>
              )}
            </>
          )}
        </Box>

        {/* Аутентификация */}
        {isAuthenticated ? (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenu}
              color="inherit"
            >
              <Avatar 
                src={user?.avatar} 
                alt={user?.firstName}
                sx={{ width: 32, height: 32 }}
              >
                {user?.firstName?.charAt(0)}
              </Avatar>
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem onClick={() => { navigate('/profile'); handleClose(); }}>
                <AccountCircle sx={{ mr: 1 }} />
                Профиль
              </MenuItem>
              
              <MenuItem onClick={() => { navigate('/bookings'); handleClose(); }}>
                <BookmarkBorder sx={{ mr: 1 }} />
                Мои бронирования
              </MenuItem>

              {(user?.role === 'guide' || user?.role === 'admin') && (
                <MenuItem onClick={() => { navigate('/dashboard'); handleClose(); }}>
                  <Dashboard sx={{ mr: 1 }} />
                  Панель управления
                </MenuItem>
              )}

              <Divider />
              
              <MenuItem onClick={handleLogout}>
                <ExitToApp sx={{ mr: 1 }} />
                Выйти
              </MenuItem>
            </Menu>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button color="inherit" component={Link} to="/login">
              Войти
            </Button>
            <Button 
              variant="outlined" 
              color="inherit" 
              component={Link} 
              to="/register"
              sx={{ 
                borderColor: 'rgba(255, 255, 255, 0.5)',
                '&:hover': { 
                  borderColor: 'white',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)' 
                }
              }}
            >
              Регистрация
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header; 