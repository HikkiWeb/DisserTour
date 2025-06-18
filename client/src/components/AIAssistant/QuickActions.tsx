import React from 'react';
import {
  Box,
  Chip,
  IconButton,
  Typography,
  Stack,
  useTheme,
} from '@mui/material';
import {
  Refresh,
  TouchApp,
} from '@mui/icons-material';

interface QuickActionsProps {
  questions: string[];
  onQuestionClick: (question: string) => void;
  onRefresh: () => void;
  compact?: boolean;
}

const QuickActions: React.FC<QuickActionsProps> = ({
  questions,
  onQuestionClick,
  onRefresh,
  compact = false,
}) => {
  const theme = useTheme();

  return (
    <Box sx={{ 
      p: compact ? 1.5 : 2, 
      borderTop: compact ? '1px solid' : undefined,
      borderColor: 'divider',
      backgroundColor: compact ? 'rgba(255,255,255,0.8)' : 'transparent',
    }}>
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        mb: 1,
      }}>
        <Typography 
          variant={compact ? "caption" : "body2"} 
          color="textSecondary"
          sx={{ 
            display: 'flex', 
            alignItems: 'center',
            gap: 0.5,
            fontWeight: 500,
          }}
        >
          <TouchApp sx={{ fontSize: compact ? 14 : 16 }} />
          Быстрые вопросы
        </Typography>
        
        <IconButton 
          size="small" 
          onClick={onRefresh}
          sx={{ 
            opacity: 0.7,
            '&:hover': { opacity: 1 },
          }}
        >
          <Refresh sx={{ fontSize: compact ? 16 : 18 }} />
        </IconButton>
      </Box>

      <Stack 
        direction={compact ? "column" : "row"} 
        spacing={1}
        sx={{ flexWrap: compact ? 'nowrap' : 'wrap' }}
      >
        {questions.map((question, index) => (
          <Chip
            key={index}
            label={question}
            onClick={() => onQuestionClick(question)}
            clickable
            size={compact ? "small" : "medium"}
            sx={{
              background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
              border: '1px solid rgba(102, 126, 234, 0.2)',
              color: theme.palette.primary.main,
              fontSize: compact ? '0.7rem' : '0.8rem',
              fontWeight: 500,
              '&:hover': {
                background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%)',
                transform: 'translateY(-1px)',
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.2)',
              },
              transition: 'all 0.2s ease',
              cursor: 'pointer',
              minWidth: compact ? 'auto' : 'fit-content',
              justifyContent: 'flex-start',
            }}
          />
        ))}
      </Stack>

      {!compact && questions.length === 0 && (
        <Typography 
          variant="caption" 
          color="textSecondary"
          sx={{ 
            display: 'block',
            textAlign: 'center',
            fontStyle: 'italic',
            py: 2,
          }}
        >
          Быстрые вопросы загружаются...
        </Typography>
      )}
    </Box>
  );
};

export default QuickActions; 