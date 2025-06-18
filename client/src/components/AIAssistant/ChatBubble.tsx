import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Avatar,
  useTheme,
} from '@mui/material';
import {
  SmartToy,
  Person,
} from '@mui/icons-material';
import { ChatMessage } from '../../services/aiService';

interface ChatBubbleProps {
  message: ChatMessage;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ message }) => {
  const theme = useTheme();
  const isUser = message.role === 'user';

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        alignItems: 'flex-start',
        gap: 1,
      }}
    >
      {!isUser && (
        <Avatar
          sx={{
            width: 32,
            height: 32,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            order: 0,
          }}
        >
          <SmartToy sx={{ fontSize: 18 }} />
        </Avatar>
      )}

      <Paper
        sx={{
          px: 2,
          py: 1.5,
          maxWidth: '75%',
          background: isUser
            ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            : theme.palette.background.paper,
          color: isUser ? 'white' : theme.palette.text.primary,
          borderRadius: isUser
            ? '18px 18px 4px 18px'
            : '18px 18px 18px 4px',
          boxShadow: isUser
            ? '0 4px 12px rgba(102, 126, 234, 0.3)'
            : '0 2px 8px rgba(0, 0, 0, 0.1)',
          position: 'relative',
          order: isUser ? 0 : 1,
          '&::before': isUser ? {
            content: '""',
            position: 'absolute',
            bottom: 0,
            right: -8,
            width: 0,
            height: 0,
            borderLeft: '8px solid transparent',
            borderTop: `8px solid ${theme.palette.primary.main}`,
            borderRadius: '0 0 0 4px',
          } : {
            content: '""',
            position: 'absolute',
            bottom: 0,
            left: -8,
            width: 0,
            height: 0,
            borderRight: '8px solid transparent',
            borderTop: `8px solid ${theme.palette.background.paper}`,
            borderRadius: '0 0 4px 0',
          },
        }}
      >
        <Typography 
          variant="body2" 
          sx={{ 
            lineHeight: 1.4,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}
        >
          {message.content}
        </Typography>
        
        <Typography
          variant="caption"
          sx={{
            display: 'block',
            mt: 0.5,
            opacity: 0.7,
            fontSize: '0.7rem',
            textAlign: isUser ? 'right' : 'left',
          }}
        >
          {new Date(message.timestamp).toLocaleTimeString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Typography>
      </Paper>

      {isUser && (
        <Avatar
          sx={{
            width: 32,
            height: 32,
            bgcolor: theme.palette.grey[400],
            order: 1,
          }}
        >
          <Person sx={{ fontSize: 18 }} />
        </Avatar>
      )}
    </Box>
  );
};

export default ChatBubble; 