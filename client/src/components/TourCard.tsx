import React from 'react';
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  Box,
  Rating,
  Chip,
  Button,
} from '@mui/material';
import { LocationOn, AccessTime, People } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { Tour } from '../types';
import { getDifficultyText, getDifficultyColor } from '../utils/translations';

interface TourCardProps {
  tour: Tour;
}

const TourCard: React.FC<TourCardProps> = ({ tour }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/tours/${tour.id}`);
  };

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4,
          transition: 'all 0.3s ease',
        },
      }}
      onClick={handleClick}
    >
      <CardMedia
        component="img"
        height="200"
        image={tour.mainImage || '/placeholder-tour.jpg'}
        alt={tour.title}
        sx={{ objectFit: 'cover' }}
      />

      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ mb: 1 }}>
          <Chip
            label={getDifficultyText(tour.difficulty)}
            color={getDifficultyColor(tour.difficulty) as any}
            size="small"
            sx={{ mr: 1 }}
          />
          <Chip label={tour.region} size="small" />
        </Box>

        <Typography
          gutterBottom
          variant="h6"
          component="h2"
          sx={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            minHeight: '3.6em',
          }}
        >
          {tour.title}
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            mb: 2,
            minHeight: '4.5em',
          }}
        >
          {tour.description}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <LocationOn fontSize="small" color="action" />
          <Typography variant="body2" sx={{ ml: 0.5 }}>
            {tour.region}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <AccessTime fontSize="small" color="action" />
          <Typography variant="body2" sx={{ ml: 0.5 }}>
            {tour.duration} дней
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <People fontSize="small" color="action" />
          <Typography variant="body2" sx={{ ml: 0.5 }}>
            До {tour.maxParticipants} чел.
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Rating value={tour.rating} readOnly size="small" />
          <Typography variant="body2" color="text.secondary">
            ({tour.reviewsCount})
          </Typography>
        </Box>

        <Typography variant="h6" color="primary" gutterBottom>
          {tour.price.toLocaleString()} ₸
        </Typography>

        <Button variant="contained" fullWidth onClick={handleClick}>
          Подробнее
        </Button>
      </CardContent>
    </Card>
  );
};

export default TourCard; 