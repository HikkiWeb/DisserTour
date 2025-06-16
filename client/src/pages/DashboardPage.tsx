import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Button,
  Alert,
  CircularProgress,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  TrendingUp,
  People,
  AttachMoney,
  Tour,
  Visibility,
  Edit,
  Check,
  Close,
  Add,
  Group,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import { Booking, Tour as TourType, User } from '../types';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`dashboard-tabpanel-${index}`}
      aria-labelledby={`dashboard-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

interface Stats {
  totalBookings: number;
  totalRevenue: number;
  activeUsers: number;
  completedTours: number;
}

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [tabValue, setTabValue] = useState(0);
  const [stats, setStats] = useState<Stats>({
    totalBookings: 0,
    totalRevenue: 0,
    activeUsers: 0,
    completedTours: 0,
  });
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [tours, setTours] = useState<TourType[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [updating, setUpdating] = useState(false);

  const isAdmin = user?.role === 'admin';
  const isGuide = user?.role === 'guide';

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      const promises = [];

      if (isAdmin) {
        promises.push(
          apiService.getUsers(),
          apiService.getTours({ page: 1, limit: 100 }),
          Promise.resolve({ status: 'success', data: { data: [] } }) // Mock for all bookings
        );
      } else if (isGuide) {
        promises.push(
          apiService.getGuideTours(),
          apiService.getGuideBookings()
        );
      }

      const responses = await Promise.all(promises);

      if (isAdmin) {
        if (responses[0].status === 'success' && responses[0].data) {
          setUsers(responses[0].data.data);
        }
        if (responses[1].status === 'success' && responses[1].data) {
          setTours(responses[1].data.data);
        }
        if (responses[2].status === 'success' && responses[2].data) {
          setBookings(responses[2].data.data);
        }
      } else if (isGuide) {
        if (responses[0].status === 'success' && responses[0].data) {
          setTours(responses[0].data.data);
        }
        if (responses[1].status === 'success' && responses[1].data) {
          setBookings(responses[1].data.data);
        }
      }

      // Подсчет статистики
      calculateStats();
    } catch (err: any) {
      setError('Ошибка загрузки данных');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    const totalRevenue = bookings.reduce((sum, booking) => sum + booking.totalPrice, 0);
    const completedBookings = bookings.filter(b => b.status === 'confirmed').length;

    setStats({
      totalBookings: bookings.length,
      totalRevenue,
      activeUsers: users.length,
      completedTours: completedBookings,
    });
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleStatusChange = async () => {
    if (!selectedBooking || !newStatus) return;

    try {
      setUpdating(true);
      const response = await apiService.updateBookingStatus(selectedBooking.id, newStatus);
      
      if (response.status === 'success') {
        loadDashboardData(); // Перезагружаем данные
        setStatusDialogOpen(false);
        setSelectedBooking(null);
        setNewStatus('');
      }
    } catch (err: any) {
      setError('Ошибка при обновлении статуса');
    } finally {
      setUpdating(false);
    }
  };

  const openStatusDialog = (booking: Booking) => {
    setSelectedBooking(booking);
    setNewStatus(booking.status);
    setStatusDialogOpen(true);
  };

  const closeStatusDialog = () => {
    setStatusDialogOpen(false);
    setSelectedBooking(null);
    setNewStatus('');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'success';
      case 'pending': return 'warning';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Подтверждено';
      case 'pending': return 'Ожидает';
      case 'cancelled': return 'Отменено';
      default: return status;
    }
  };

  if (!isAdmin && !isGuide) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          У вас нет доступа к панели управления
        </Alert>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        <DashboardIcon sx={{ mr: 2, verticalAlign: 'middle' }} />
        Панель управления
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Статистика */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4 }}>
        <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TrendingUp color="primary" sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Всего туров
                  </Typography>
                  <Typography variant="h4">
                    {tours.length}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <People color="success" sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Бронирований
                  </Typography>
                  <Typography variant="h4">
                    {bookings.length}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>

        {isAdmin && (
          <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Group color="info" sx={{ fontSize: 40, mr: 2 }} />
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      Пользователей
                    </Typography>
                    <Typography variant="h4">
                      {users.length}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
        )}

        <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <AttachMoney color="warning" sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Общий доход
                  </Typography>
                  <Typography variant="h4">
                    ₸{bookings.reduce((sum, booking) => sum + booking.totalPrice, 0).toLocaleString('ru-RU')}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Вкладки */}
      <Paper>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          variant="fullWidth"
        >
          <Tab label="Бронирования" />
          <Tab label="Туры" />
          {isAdmin && <Tab label="Пользователи" />}
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Дата начала</TableCell>
                  <TableCell>Участники</TableCell>
                  <TableCell>Сумма</TableCell>
                  <TableCell>Статус</TableCell>
                  <TableCell>Действия</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {bookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell>#{booking.id.slice(-8)}</TableCell>
                    <TableCell>
                      {new Date(booking.startDate).toLocaleDateString('ru-RU')}
                    </TableCell>
                    <TableCell>{booking.participants}</TableCell>
                    <TableCell>{booking.totalPrice.toLocaleString()} ₸</TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusText(booking.status)}
                        color={getStatusColor(booking.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => openStatusDialog(booking)}
                        disabled={booking.status === 'cancelled'}
                      >
                        <Edit />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {bookings.length === 0 && (
            <Box textAlign="center" py={4}>
              <Typography color="text.secondary">
                Нет бронирований
              </Typography>
            </Box>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Box sx={{ mb: 2 }}>
            <Button variant="contained" startIcon={<Add />}>
              Добавить тур
            </Button>
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Название</TableCell>
                  <TableCell>Регион</TableCell>
                  <TableCell>Цена</TableCell>
                  <TableCell>Длительность</TableCell>
                  <TableCell>Рейтинг</TableCell>
                  <TableCell>Действия</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tours.map((tour) => (
                  <TableRow key={tour.id}>
                    <TableCell>{tour.title}</TableCell>
                    <TableCell>{tour.region}</TableCell>
                    <TableCell>{tour.price.toLocaleString()} ₸</TableCell>
                    <TableCell>{tour.duration} дней</TableCell>
                    <TableCell>{tour.rating}/5</TableCell>
                    <TableCell>
                      <IconButton size="small">
                        <Visibility />
                      </IconButton>
                      <IconButton size="small">
                        <Edit />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {tours.length === 0 && (
            <Box textAlign="center" py={4}>
              <Typography color="text.secondary">
                Нет туров
              </Typography>
            </Box>
          )}
        </TabPanel>

        {isAdmin && (
          <TabPanel value={tabValue} index={2}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Имя</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Роль</TableCell>
                    <TableCell>Дата регистрации</TableCell>
                    <TableCell>Действия</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.firstName} {user.lastName}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Chip
                          label={user.role === 'admin' ? 'Администратор' : 
                                 user.role === 'guide' ? 'Гид' : 'Пользователь'}
                          color={user.role === 'admin' ? 'error' : 
                                 user.role === 'guide' ? 'warning' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {new Date(user.id).toLocaleDateString('ru-RU')}
                      </TableCell>
                      <TableCell>
                        <IconButton size="small">
                          <Edit />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {users.length === 0 && (
              <Box textAlign="center" py={4}>
                <Typography color="text.secondary">
                  Нет пользователей
                </Typography>
              </Box>
            )}
          </TabPanel>
        )}
      </Paper>

      {/* Диалог изменения статуса */}
      <Dialog
        open={statusDialogOpen}
        onClose={closeStatusDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Изменить статус бронирования</DialogTitle>
        <DialogContent>
          {selectedBooking && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body1" gutterBottom>
                Бронирование #{selectedBooking.id.slice(-8)}
              </Typography>
              
              <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel>Статус</InputLabel>
                <Select
                  value={newStatus}
                  label="Статус"
                  onChange={(e) => setNewStatus(e.target.value)}
                >
                  <MenuItem value="pending">Ожидает подтверждения</MenuItem>
                  <MenuItem value="confirmed">Подтверждено</MenuItem>
                  <MenuItem value="cancelled">Отменено</MenuItem>
                </Select>
              </FormControl>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeStatusDialog} disabled={updating}>
            Отмена
          </Button>
          <Button 
            onClick={handleStatusChange}
            variant="contained"
            disabled={updating || !newStatus}
          >
            {updating ? <CircularProgress size={20} /> : 'Сохранить'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default DashboardPage; 