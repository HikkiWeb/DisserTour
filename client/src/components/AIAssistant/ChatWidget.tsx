import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  IconButton,
  Typography,
  Fab,
  Chip,
  Alert,
  CircularProgress,
  Avatar,
  Stack,
  Fade,
  Slide,
  useTheme,
  useMediaQuery,
  Tooltip,
} from '@mui/material';
import {
  SmartToy,
  Send,
  Close,
  Refresh,
  Clear,
  ExpandLess,
  ExpandMore,
  AutoAwesome,
} from '@mui/icons-material';
import { useAIChat } from '../../hooks/useAIChat';
import ChatBubble from './ChatBubble';
import QuickActions from './QuickActions';

interface ChatWidgetProps {
  startExpanded?: boolean;
}

const ChatWidget: React.FC<ChatWidgetProps> = ({ startExpanded = false }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [isOpen, setIsOpen] = useState(startExpanded);
  const [isMinimized, setIsMinimized] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    messages,
    isLoading,
    isTyping,
    error,
    quickQuestions,
    isServiceAvailable,
    sendMessage,
    clearChat,
    refreshQuickQuestions,
    checkServiceStatus,
  } = useAIChat();

  // Автопрокрутка к новым сообщениям
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Фокус на инпут при открытии чата
  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, isMinimized]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;
    
    const message = inputMessage.trim();
    setInputMessage('');
    await sendMessage(message);
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const handleQuickQuestion = (question: string) => {
    setInputMessage(question);
    setTimeout(() => handleSendMessage(), 100);
  };

  const toggleChat = () => {
    if (isOpen) {
      setIsOpen(false);
      setIsMinimized(false);
    } else {
      setIsOpen(true);
      setIsMinimized(false);
    }
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  // Floating Action Button
  const ChatFAB = (
    <Tooltip title="AI Помощник по Казахстану" placement="left">
      <Fab
        color="primary"
        onClick={toggleChat}
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 1000,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
            transform: 'scale(1.1)',
          },
          transition: 'all 0.3s ease',
          boxShadow: '0 8px 20px rgba(102, 126, 234, 0.4)',
        }}
      >
        {isOpen ? <Close /> : <SmartToy />}
      </Fab>
    </Tooltip>
  );

  // Chat Dialog для мобильных устройств
  if (isMobile) {
    return (
      <>
        {ChatFAB}
        <Dialog
          open={isOpen}
          onClose={toggleChat}
          fullScreen
          PaperProps={{
            sx: {
              background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
            }
          }}
        >
          <DialogTitle sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
          }}>
            <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>
              <SmartToy />
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6">AI Помощник</Typography>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                Ваш гид по Казахстану
              </Typography>
            </Box>
            <IconButton onClick={toggleChat} sx={{ color: 'white' }}>
              <Close />
            </IconButton>
          </DialogTitle>
          
          <DialogContent sx={{ p: 0, display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Сообщения */}
            <Box sx={{ flex: 1, p: 2, overflow: 'auto' }}>
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                  <IconButton size="small" onClick={checkServiceStatus}>
                    <Refresh />
                  </IconButton>
                </Alert>
              )}

              {messages.length === 0 && (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Avatar sx={{ 
                    width: 64, 
                    height: 64, 
                    mx: 'auto', 
                    mb: 2,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  }}>
                    <AutoAwesome sx={{ fontSize: 32 }} />
                  </Avatar>
                  <Typography variant="h6" gutterBottom>
                    Добро пожаловать!
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Я помогу вам найти лучшие туры по Казахстану
                  </Typography>
                </Box>
              )}

              <Stack spacing={2}>
                {messages.map((message, index) => (
                  <ChatBubble key={index} message={message} />
                ))}
                {isTyping && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CircularProgress size={16} />
                    <Typography variant="body2" color="textSecondary">
                      AI помощник печатает...
                    </Typography>
                  </Box>
                )}
              </Stack>
              <div ref={messagesEndRef} />
            </Box>

            {/* Быстрые действия */}
            {quickQuestions.length > 0 && messages.length === 0 && (
              <QuickActions 
                questions={quickQuestions}
                onQuestionClick={handleQuickQuestion}
                onRefresh={refreshQuickQuestions}
              />
            )}

            {/* Поле ввода */}
            <Paper sx={{ p: 2, borderRadius: 0 }}>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
                <TextField
                  ref={inputRef}
                  fullWidth
                  multiline
                  maxRows={3}
                  placeholder="Спросите что-нибудь о турах по Казахстану..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={!isServiceAvailable || isLoading}
                  variant="outlined"
                  size="small"
                />
                <IconButton 
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                  color="primary"
                >
                  <Send />
                </IconButton>
              </Box>
            </Paper>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  // Desktop версия
  return (
    <>
      {ChatFAB}
      
      <Slide direction="up" in={isOpen} mountOnEnter unmountOnExit>
        <Paper
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            width: 400,
            height: isMinimized ? 'auto' : 600,
            zIndex: 999,
            borderRadius: 3,
            overflow: 'hidden',
            boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
          }}
        >
          {/* Заголовок */}
          <Box sx={{ 
            p: 2, 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            gap: 2,
          }}>
            <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 32, height: 32 }}>
              <SmartToy />
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle1" fontWeight={600}>
                AI Помощник
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                {isServiceAvailable ? 'Онлайн' : 'Офлайн'}
              </Typography>
            </Box>
            <IconButton 
              size="small" 
              onClick={clearChat}
              sx={{ color: 'white' }}
              disabled={messages.length === 0}
            >
              <Clear />
            </IconButton>
            <IconButton 
              size="small" 
              onClick={toggleMinimize}
              sx={{ color: 'white' }}
            >
              {isMinimized ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
            <IconButton 
              size="small" 
              onClick={toggleChat}
              sx={{ color: 'white' }}
            >
              <Close />
            </IconButton>
          </Box>

          {!isMinimized && (
            <Fade in={!isMinimized}>
              <Box sx={{ height: 'calc(600px - 80px)', display: 'flex', flexDirection: 'column' }}>
                {/* Сообщения */}
                <Box sx={{ flex: 1, p: 2, overflow: 'auto' }}>
                  {error && (
                    <Alert severity="error" sx={{ mb: 2 }} action={
                      <IconButton size="small" onClick={checkServiceStatus}>
                        <Refresh />
                      </IconButton>
                    }>
                      {error}
                    </Alert>
                  )}

                  {messages.length === 0 && (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <Avatar sx={{ 
                        width: 48, 
                        height: 48, 
                        mx: 'auto', 
                        mb: 2,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      }}>
                        <AutoAwesome />
                      </Avatar>
                      <Typography variant="subtitle2" gutterBottom>
                        Добро пожаловать!
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Я помогу найти туры по Казахстану
                      </Typography>
                    </Box>
                  )}

                  <Stack spacing={1.5}>
                    {messages.map((message, index) => (
                      <ChatBubble key={index} message={message} />
                    ))}
                    {isTyping && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 1 }}>
                        <CircularProgress size={12} />
                        <Typography variant="caption" color="textSecondary">
                          печатает...
                        </Typography>
                      </Box>
                    )}
                  </Stack>
                  <div ref={messagesEndRef} />
                </Box>

                {/* Быстрые действия */}
                {quickQuestions.length > 0 && messages.length === 0 && (
                  <QuickActions 
                    questions={quickQuestions}
                    onQuestionClick={handleQuickQuestion}
                    onRefresh={refreshQuickQuestions}
                    compact
                  />
                )}

                {/* Поле ввода */}
                <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
                    <TextField
                      ref={inputRef}
                      fullWidth
                      multiline
                      maxRows={2}
                      placeholder="Спросите о турах..."
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      disabled={!isServiceAvailable || isLoading}
                      variant="outlined"
                      size="small"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                        }
                      }}
                    />
                    <IconButton 
                      onClick={handleSendMessage}
                      disabled={!inputMessage.trim() || isLoading}
                      color="primary"
                      sx={{ 
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                        },
                        '&:disabled': {
                          background: 'rgba(0,0,0,0.12)',
                          color: 'rgba(0,0,0,0.26)',
                        }
                      }}
                    >
                      {isLoading ? <CircularProgress size={20} color="inherit" /> : <Send />}
                    </IconButton>
                  </Box>
                </Box>
              </Box>
            </Fade>
          )}
        </Paper>
      </Slide>
    </>
  );
};

export default ChatWidget; 