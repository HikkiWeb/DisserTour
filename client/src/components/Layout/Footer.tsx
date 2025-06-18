import React from 'react';
import { Box, Container, Typography, Link } from '@mui/material';

const Footer: React.FC = () => {
  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: 'primary.main',
        color: 'white',
        py: 3,
        mt: 'auto',
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          <Box sx={{ flex: '1 1 300px' }}>
            <Typography variant="h6" gutterBottom>
              Nomad Route
            </Typography>
            <Typography variant="body2">
              Откройте для себя удивительные места Казахстана с нашими профессиональными гидами.
            </Typography>
          </Box>
          
          <Box sx={{ flex: '1 1 300px' }}>
            <Typography variant="h6" gutterBottom>
              Быстрые ссылки
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link href="/tours" color="inherit" underline="hover">
                Все туры
              </Link>
              <Link href="/about" color="inherit" underline="hover">
                О нас
              </Link>
              <Link href="/contact" color="inherit" underline="hover">
                Контакты
              </Link>
            </Box>
          </Box>
          
          <Box sx={{ flex: '1 1 300px' }}>
            <Typography variant="h6" gutterBottom>
              Контакты
            </Typography>
            <Typography variant="body2">
              Email: info@nomadroute.kz
            </Typography>
            <Typography variant="body2">
              Телефон: +7 (777) 123-45-67
            </Typography>
          </Box>
        </Box>
        
        <Box sx={{ borderTop: '1px solid rgba(255, 255, 255, 0.2)', mt: 3, pt: 2 }}>
          <Typography variant="body2" align="center">
            © 2024 Nomad Route. Все права защищены.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer; 