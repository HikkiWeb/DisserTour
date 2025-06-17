import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Card,
  CardContent,
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
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Switch,
  FormControlLabel,
  Tooltip,
  Badge,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  TrendingUp,
  People,
  AttachMoney,
  Tour,
  Visibility,
  Edit,
  Delete,
  Add,
  Group,
  Search,
  FilterList,
  MoreVert,
  Check,
  Close,
  Block,
  Star,
  CalendarToday,
  Phone,
  Email,
  LocationOn,
  Person,
  AdminPanelSettings,
  SupervisorAccount,
  Verified,
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
  activeTours: number;
  pendingBookings: number;
  monthlyRevenue: number;
}

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [tabValue, setTabValue] = useState(0);
  const [stats, setStats] = useState<Stats>({
    totalBookings: 0,
    totalRevenue: 0,
    activeUsers: 0,
    activeTours: 0,
    pendingBookings: 0,
    monthlyRevenue: 0,
  });
  
  // Данные
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [tours, setTours] = useState<TourType[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  
  // Фильтры и поиск
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  
  // Диалоги
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [tourDialogOpen, setTourDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [createUserDialogOpen, setCreateUserDialogOpen] = useState(false);
  const [createTourDialogOpen, setCreateTourDialogOpen] = useState(false);
  const [editUserDialogOpen, setEditUserDialogOpen] = useState(false);
  const [editTourDialogOpen, setEditTourDialogOpen] = useState(false);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  
  // Выбранные элементы
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedTour, setSelectedTour] = useState<TourType | null>(null);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [selectedReview, setSelectedReview] = useState<any>(null);
  
  // Состояния форм
  const [newStatus, setNewStatus] = useState('');
  const [newRole, setNewRole] = useState('');
  const [updating, setUpdating] = useState(false);
  const [reviews, setReviews] = useState<any[]>([]);
  const [guides, setGuides] = useState<User[]>([]);
  
  // Данные форм
  const [userFormData, setUserFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'user',
    phone: '',
  });
  
  const [tourFormData, setTourFormData] = useState({
    title: '',
    description: '',
    shortDescription: '',
    price: 0,
    duration: 1,
    maxGroupSize: 10,
    difficulty: 'medium',
    category: 'nature',
    region: '',
    season: 'all',
    guideId: '',
    startLocation: '',
    locations: [] as string[],
    itinerary: [] as string[],
    included: [] as string[],
    excluded: [] as string[],
    requirements: [] as string[],
    tags: [] as string[],
  });

  const isAdmin = user?.role === 'admin';
  const isGuide = user?.role === 'guide';

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      const promises: Promise<any>[] = [];

      if (isAdmin) {
        promises.push(
          apiService.getUsers(),
          apiService.getAdminTours(),
          apiService.getAllBookings(),
          apiService.getAdminReviews(),
          apiService.getGuides()
        );
      } else if (isGuide) {
        promises.push(
          apiService.getGuideTours(),
          apiService.getGuideBookings()
        );
      }

      const responses = await Promise.all(promises);

      if (isAdmin && responses.length >= 5) {
        if (responses[0].status === 'success' && responses[0].data) {
          setUsers(responses[0].data.data || responses[0].data.users || []);
        }
        if (responses[1].status === 'success' && responses[1].data) {
          setTours(responses[1].data.data || responses[1].data.tours || []);
        }
        if (responses[2].status === 'success' && responses[2].data) {
          setBookings(responses[2].data.data || responses[2].data.bookings || []);
        }
        if (responses[3].status === 'success' && responses[3].data) {
          setReviews(responses[3].data.data || responses[3].data.reviews || []);
        }
        if (responses[4].status === 'success' && responses[4].data) {
          setGuides(responses[4].data.guides || []);
        }
      } else if (isGuide && responses.length >= 2) {
        if (responses[0].status === 'success' && responses[0].data) {
          setTours(responses[0].data.data || responses[0].data.tours || []);
        }
        if (responses[1].status === 'success' && responses[1].data) {
          setBookings(responses[1].data.data || responses[1].data.bookings || []);
        }
      }

      calculateStats();
    } catch (err: any) {
      console.error('Ошибка загрузки данных:', err);
      setError('Ошибка загрузки данных');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    const totalRevenue = bookings.reduce((sum, booking) => sum + (booking.totalPrice || 0), 0);
    const pendingBookings = bookings.filter(b => b.status === 'pending').length;
    const activeTours = tours.filter(t => t.isActive !== false).length;
    
    // Подсчет месячного дохода (за последние 30 дней)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const monthlyRevenue = bookings
      .filter(b => new Date(b.createdAt || b.startDate) >= thirtyDaysAgo && b.status === 'confirmed')
      .reduce((sum, booking) => sum + (booking.totalPrice || 0), 0);

    setStats({
      totalBookings: bookings.length,
      totalRevenue,
      activeUsers: users.filter(u => u.isVerified).length,
      activeTours,
      pendingBookings,
      monthlyRevenue,
    });
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Функции для бронирований
  const handleStatusChange = async () => {
    if (!selectedBooking || !newStatus) return;

    try {
      setUpdating(true);
      const response = await apiService.updateBookingStatus(selectedBooking.id, newStatus);
      
      if (response.status === 'success') {
        setSuccess('Статус бронирования обновлен');
        loadDashboardData();
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

  // Функции для пользователей
  const handleUserRoleChange = async () => {
    if (!selectedUser || !newRole) return;

    try {
      setUpdating(true);
      // Здесь нужно будет добавить API метод для изменения роли
      // const response = await apiService.updateUserRole(selectedUser.id, newRole);
      
      setSuccess('Роль пользователя обновлена');
      loadDashboardData();
      setUserDialogOpen(false);
      setSelectedUser(null);
      setNewRole('');
    } catch (err: any) {
      setError('Ошибка при обновлении роли');
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteItem = async () => {
    if (!selectedItem) return;

    try {
      setUpdating(true);
      setError('');
      
      if (selectedItem.type === 'user') {
        const response = await apiService.deleteUser(selectedItem.id);
        if (response.status === 'success') {
          setSuccess('Пользователь успешно удален');
        }
      } else if (selectedItem.type === 'tour') {
        const response = await apiService.deleteAdminTour(selectedItem.id);
        if (response.status === 'success') {
          setSuccess('Тур успешно удален');
        }
      } else if (selectedItem.type === 'booking') {
        const response = await apiService.deleteBooking(selectedItem.id);
        if (response.status === 'success') {
          setSuccess('Бронирование успешно удалено');
        }
      }
      
      setDeleteDialogOpen(false);
      setSelectedItem(null);
      loadDashboardData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка при удалении');
    } finally {
      setUpdating(false);
    }
  };

  // Функции открытия диалогов
  const openStatusDialog = (booking: Booking) => {
    setSelectedBooking(booking);
    setNewStatus(booking.status);
    setStatusDialogOpen(true);
  };

  const openUserDialog = (user: User) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setUserDialogOpen(true);
  };

  const openDeleteDialog = (item: any, type: string) => {
    setSelectedItem({ ...item, type });
    setDeleteDialogOpen(true);
  };

  // Вспомогательные функции
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

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <AdminPanelSettings color="error" />;
      case 'guide': return <SupervisorAccount color="warning" />;
      default: return <Person color="action" />;
    }
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case 'admin': return 'Администратор';
      case 'guide': return 'Гид';
      default: return 'Пользователь';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-KZ', {
      style: 'currency',
      currency: 'KZT',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // CRUD функции
  const handleCreateUser = async () => {
    try {
      setUpdating(true);
      setError('');
      
      const response = await apiService.createUser(userFormData);
      if (response.status === 'success') {
        setSuccess('Пользователь успешно создан');
        setCreateUserDialogOpen(false);
        setUserFormData({
          email: '',
          password: '',
          firstName: '',
          lastName: '',
          role: 'user',
          phone: '',
        });
        loadDashboardData();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка создания пользователя');
    } finally {
      setUpdating(false);
    }
  };

  const handleEditUser = async () => {
    if (!selectedUser) return;
    
    try {
      setUpdating(true);
      setError('');
      
      const response = await apiService.updateUser(selectedUser.id, userFormData);
      if (response.status === 'success') {
        setSuccess('Пользователь успешно обновлен');
        setEditUserDialogOpen(false);
        loadDashboardData();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка обновления пользователя');
    } finally {
      setUpdating(false);
    }
  };

  const handleCreateTour = async () => {
    try {
      setUpdating(true);
      setError('');
      
      const response = await apiService.createAdminTour(tourFormData);
      if (response.status === 'success') {
        setSuccess('Тур успешно создан');
        setCreateTourDialogOpen(false);
        setTourFormData({
          title: '',
          description: '',
          shortDescription: '',
          price: 0,
          duration: 1,
          maxGroupSize: 10,
          difficulty: 'moderate',
          category: 'nature',
          region: '',
          season: 'all',
          guideId: '',
          startLocation: '',
          locations: [],
          itinerary: [],
          included: [],
          excluded: [],
          requirements: [],
          tags: [],
        });
        loadDashboardData();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка создания тура');
    } finally {
      setUpdating(false);
    }
  };

  const handleEditTour = async () => {
    if (!selectedTour) return;
    
    try {
      setUpdating(true);
      setError('');
      
      console.log('=== CLIENT TOUR UPDATE ===');
      console.log('Tour data being sent:', tourFormData);
      console.log('========================');
      
      const response = await apiService.updateAdminTour(selectedTour.id, tourFormData);
      if (response.status === 'success') {
        setSuccess('Тур успешно обновлен');
        setEditTourDialogOpen(false);
        loadDashboardData();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка обновления тура');
    } finally {
      setUpdating(false);
    }
  };

  const openCreateUserDialog = () => {
    setUserFormData({
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      role: 'user',
      phone: '',
    });
    setCreateUserDialogOpen(true);
  };

  const openEditUserDialog = (user: User) => {
    setSelectedUser(user);
    setUserFormData({
      email: user.email,
      password: '',
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      phone: user.phone || '',
    });
    setEditUserDialogOpen(true);
  };

  const openCreateTourDialog = () => {
    setTourFormData({
      title: '',
      description: '',
      shortDescription: '',
      price: 0,
      duration: 1,
      maxGroupSize: 10,
      difficulty: 'moderate',
      category: 'nature',
      region: '',
      season: 'all',
      guideId: '',
      startLocation: '',
      locations: [],
      itinerary: [],
      included: [],
      excluded: [],
      requirements: [],
      tags: [],
    });
    setCreateTourDialogOpen(true);
  };

  const openEditTourDialog = (tour: TourType) => {
    setSelectedTour(tour);
    setTourFormData({
      title: tour.title,
      description: tour.description,
      shortDescription: '',
      price: tour.price,
      duration: tour.duration,
      maxGroupSize: tour.maxParticipants || 10,
      difficulty: tour.difficulty,
      category: tour.category || 'nature',
      region: tour.region,
      season: 'all',
      guideId: tour.guide?.id || '',
      startLocation: '',
      locations: [],
      itinerary: tour.itinerary ? tour.itinerary.map(item => 
        typeof item === 'string' ? item : `День ${item.day}: ${item.title || ''} - ${item.description || ''}`
      ) : [],
      included: tour.included || [],
      excluded: tour.notIncluded || [],
      requirements: tour.requirements || [],
      tags: [],
    });
    setEditTourDialogOpen(true);
  };

  // Фильтрация данных
  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = booking.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const filteredTours = tours.filter(tour => 
    tour.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      {/* Заголовок */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <DashboardIcon sx={{ mr: 2, fontSize: 40, color: 'primary.main' }} />
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Панель управления
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            {isAdmin ? 'Администратор' : 'Гид'} • {user?.firstName} {user?.lastName}
          </Typography>
        </Box>
      </Box>

      {/* Уведомления */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {/* Статистика */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 3, mb: 4 }}>
        <Card elevation={2}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Tour color="primary" sx={{ fontSize: 40, mr: 2 }} />
              <Box>
                <Typography color="textSecondary" gutterBottom>
                  Активные туры
                </Typography>
                <Typography variant="h4">
                  {stats.activeTours}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Card elevation={2}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <CalendarToday color="success" sx={{ fontSize: 40, mr: 2 }} />
              <Box>
                <Typography color="textSecondary" gutterBottom>
                  Всего бронирований
                </Typography>
                <Typography variant="h4">
                  {stats.totalBookings}
                </Typography>
                {stats.pendingBookings > 0 && (
                  <Typography variant="caption" color="warning.main">
                    {stats.pendingBookings} ожидают
                  </Typography>
                )}
              </Box>
            </Box>
          </CardContent>
        </Card>

        {isAdmin && (
          <Card elevation={2}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Group color="info" sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Активные пользователи
                  </Typography>
                  <Typography variant="h4">
                    {stats.activeUsers}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    из {users.length} всего
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        )}

        <Card elevation={2}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <AttachMoney color="warning" sx={{ fontSize: 40, mr: 2 }} />
              <Box>
                <Typography color="textSecondary" gutterBottom>
                  Общий доход
                </Typography>
                <Typography variant="h4" sx={{ fontSize: '1.5rem' }}>
                  {formatCurrency(stats.totalRevenue)}
                </Typography>
                <Typography variant="caption" color="success.main">
                  +{formatCurrency(stats.monthlyRevenue)} за месяц
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Основной контент */}
      <Paper elevation={2} sx={{ borderRadius: 2 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab 
            icon={<CalendarToday />} 
            label="Бронирования" 
            iconPosition="start"
          />
          <Tab 
            icon={<Tour />} 
            label="Туры" 
            iconPosition="start"
          />
          {isAdmin && (
            <Tab 
              icon={<People />} 
              label="Пользователи" 
              iconPosition="start"
            />
          )}
        </Tabs>

        {/* Вкладка бронирований */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
            <TextField
              size="small"
              placeholder="Поиск по ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
              sx={{ minWidth: 200 }}
            />
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Статус</InputLabel>
              <Select
                value={statusFilter}
                label="Статус"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="all">Все</MenuItem>
                <MenuItem value="pending">Ожидают</MenuItem>
                <MenuItem value="confirmed">Подтверждены</MenuItem>
                <MenuItem value="cancelled">Отменены</MenuItem>
              </Select>
            </FormControl>
          </Box>

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
                {filteredBookings.map((booking) => (
                  <TableRow key={booking.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        #{booking.id.slice(-8)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {new Date(booking.startDate).toLocaleDateString('ru-RU')}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <People sx={{ mr: 1, fontSize: 16 }} />
                        {booking.participants}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {formatCurrency(booking.totalPrice || 0)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusText(booking.status)}
                        color={getStatusColor(booking.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Tooltip title="Изменить статус">
                        <IconButton
                          size="small"
                          onClick={() => openStatusDialog(booking)}
                          disabled={booking.status === 'cancelled'}
                        >
                          <Edit />
                        </IconButton>
                      </Tooltip>
                      {isAdmin && (
                        <Tooltip title="Удалить">
                          <IconButton 
                            size="small" 
                            color="error"
                            onClick={() => openDeleteDialog(booking, 'booking')}
                          >
                            <Delete />
                          </IconButton>
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {filteredBookings.length === 0 && (
            <Box textAlign="center" py={6}>
              <CalendarToday sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Нет бронирований
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Попробуйте изменить фильтры поиска' 
                  : 'Бронирования появятся здесь после создания'}
              </Typography>
            </Box>
          )}
        </TabPanel>

        {/* Вкладка туров */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
            <TextField
              size="small"
              placeholder="Поиск туров..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
              sx={{ minWidth: 200 }}
            />
            {isAdmin && (
              <Button 
                variant="contained" 
                startIcon={<Add />}
                onClick={openCreateTourDialog}
              >
                Добавить тур
              </Button>
            )}
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
                  <TableCell>Статус</TableCell>
                  <TableCell>Действия</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredTours.map((tour) => (
                  <TableRow key={tour.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar 
                          src={tour.images?.[0]} 
                          sx={{ mr: 2, width: 40, height: 40 }}
                        >
                          <Tour />
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {tour.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {tour.category}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <LocationOn sx={{ mr: 1, fontSize: 16 }} />
                        {tour.region}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {formatCurrency(tour.price)}
                      </Typography>
                    </TableCell>
                    <TableCell>{tour.duration} дней</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Star sx={{ mr: 1, fontSize: 16, color: 'warning.main' }} />
                        {tour.rating}/5
                        <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                          ({tour.ratingCount})
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={tour.isActive !== false ? 'Активен' : 'Неактивен'}
                        color={tour.isActive !== false ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Tooltip title="Просмотр">
                        <IconButton size="small">
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Редактировать">
                        <IconButton 
                          size="small"
                          onClick={() => openEditTourDialog(tour)}
                        >
                          <Edit />
                        </IconButton>
                      </Tooltip>
                      {isAdmin && (
                        <Tooltip title="Удалить">
                          <IconButton 
                            size="small" 
                            color="error"
                            onClick={() => openDeleteDialog(tour, 'tour')}
                          >
                            <Delete />
                          </IconButton>
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {filteredTours.length === 0 && (
            <Box textAlign="center" py={6}>
              <Tour sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Нет туров
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {searchTerm 
                  ? 'Попробуйте изменить поисковый запрос' 
                  : 'Создайте первый тур для начала работы'}
              </Typography>
            </Box>
          )}
        </TabPanel>

        {/* Вкладка пользователей (только для админа) */}
        {isAdmin && (
          <TabPanel value={tabValue} index={2}>
            <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
              <TextField
                size="small"
                placeholder="Поиск пользователей..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
                sx={{ minWidth: 200 }}
              />
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Роль</InputLabel>
                <Select
                  value={roleFilter}
                  label="Роль"
                  onChange={(e) => setRoleFilter(e.target.value)}
                >
                  <MenuItem value="all">Все</MenuItem>
                  <MenuItem value="user">Пользователи</MenuItem>
                  <MenuItem value="guide">Гиды</MenuItem>
                  <MenuItem value="admin">Администраторы</MenuItem>
                </Select>
              </FormControl>
              <Button 
                variant="contained" 
                startIcon={<Add />}
                onClick={openCreateUserDialog}
              >
                Добавить пользователя
              </Button>
            </Box>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Пользователь</TableCell>
                    <TableCell>Контакты</TableCell>
                    <TableCell>Роль</TableCell>
                    <TableCell>Статус</TableCell>
                    <TableCell>Регистрация</TableCell>
                    <TableCell>Действия</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Badge
                            overlap="circular"
                            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                            badgeContent={
                              user.isVerified ? (
                                <Verified sx={{ color: 'success.main', fontSize: 16 }} />
                              ) : null
                            }
                          >
                            <Avatar 
                              src={user.avatar} 
                              sx={{ mr: 2, width: 40, height: 40 }}
                            >
                              {user.firstName.charAt(0)}
                            </Avatar>
                          </Badge>
                          <Box>
                            <Typography variant="body2" fontWeight="medium">
                              {user.firstName} {user.lastName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              ID: {user.id.slice(-8)}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                            <Email sx={{ mr: 1, fontSize: 14 }} />
                            <Typography variant="caption">
                              {user.email}
                            </Typography>
                          </Box>
                          {user.phone && (
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Phone sx={{ mr: 1, fontSize: 14 }} />
                              <Typography variant="caption">
                                {user.phone}
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {getRoleIcon(user.role)}
                          <Chip
                            label={getRoleText(user.role)}
                            color={user.role === 'admin' ? 'error' : 
                                   user.role === 'guide' ? 'warning' : 'default'}
                            size="small"
                            sx={{ ml: 1 }}
                          />
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={user.isVerified ? 'Подтвержден' : 'Не подтвержден'}
                          color={user.isVerified ? 'success' : 'warning'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {new Date(user.createdAt || user.id).toLocaleDateString('ru-RU')}
                      </TableCell>
                      <TableCell>
                        <Tooltip title="Редактировать">
                          <IconButton 
                            size="small"
                            onClick={() => openEditUserDialog(user)}
                          >
                            <Edit />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Изменить роль">
                          <IconButton 
                            size="small"
                            onClick={() => openUserDialog(user)}
                            color="warning"
                          >
                            <AdminPanelSettings />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Удалить">
                          <IconButton 
                            size="small" 
                            color="error"
                            onClick={() => openDeleteDialog(user, 'user')}
                            disabled={false} // Админ может удалить любого пользователя
                          >
                            <Delete />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {filteredUsers.length === 0 && (
              <Box textAlign="center" py={6}>
                <People sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Нет пользователей
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {searchTerm || roleFilter !== 'all' 
                    ? 'Попробуйте изменить фильтры поиска' 
                    : 'Пользователи появятся после регистрации'}
                </Typography>
              </Box>
            )}
          </TabPanel>
        )}
      </Paper>

      {/* Диалог изменения статуса бронирования */}
      <Dialog open={statusDialogOpen} onClose={() => setStatusDialogOpen(false)}>
        <DialogTitle>Изменить статус бронирования</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Бронирование #{selectedBooking?.id.slice(-8)}
          </Typography>
          <FormControl fullWidth>
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
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusDialogOpen(false)}>Отмена</Button>
          <Button 
            onClick={handleStatusChange} 
            variant="contained"
            disabled={updating || !newStatus}
          >
            {updating ? <CircularProgress size={20} /> : 'Сохранить'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Диалог изменения роли пользователя */}
      <Dialog open={userDialogOpen} onClose={() => setUserDialogOpen(false)}>
        <DialogTitle>Изменить роль пользователя</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {selectedUser?.firstName} {selectedUser?.lastName}
          </Typography>
          <FormControl fullWidth>
            <InputLabel>Роль</InputLabel>
            <Select
              value={newRole}
              label="Роль"
              onChange={(e) => setNewRole(e.target.value)}
            >
              <MenuItem value="user">Пользователь</MenuItem>
              <MenuItem value="guide">Гид</MenuItem>
              <MenuItem value="admin">Администратор</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUserDialogOpen(false)}>Отмена</Button>
          <Button 
            onClick={handleUserRoleChange} 
            variant="contained"
            disabled={updating || !newRole}
          >
            {updating ? <CircularProgress size={20} /> : 'Сохранить'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Диалог подтверждения удаления */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Подтвердите удаление</DialogTitle>
        <DialogContent>
          <Typography>
            Вы уверены, что хотите удалить{' '}
            {selectedItem?.type === 'user' ? 'пользователя' : 
             selectedItem?.type === 'tour' ? 'тур' : 
             selectedItem?.type === 'booking' ? 'бронирование' : 'элемент'}?
          </Typography>
          <Typography variant="body2" color="error" sx={{ mt: 1 }}>
            Это действие нельзя отменить.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Отмена</Button>
          <Button 
            onClick={handleDeleteItem} 
            color="error"
            variant="contained"
            disabled={updating}
          >
            {updating ? <CircularProgress size={20} /> : 'Удалить'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Диалог создания пользователя */}
      <Dialog open={createUserDialogOpen} onClose={() => setCreateUserDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Создать пользователя</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Имя"
              value={userFormData.firstName}
              onChange={(e) => setUserFormData({...userFormData, firstName: e.target.value})}
              fullWidth
              required
            />
            <TextField
              label="Фамилия"
              value={userFormData.lastName}
              onChange={(e) => setUserFormData({...userFormData, lastName: e.target.value})}
              fullWidth
              required
            />
            <TextField
              label="Email"
              type="email"
              value={userFormData.email}
              onChange={(e) => setUserFormData({...userFormData, email: e.target.value})}
              fullWidth
              required
            />
            <TextField
              label="Пароль"
              type="password"
              value={userFormData.password}
              onChange={(e) => setUserFormData({...userFormData, password: e.target.value})}
              fullWidth
              required
            />
            <TextField
              label="Телефон"
              value={userFormData.phone}
              onChange={(e) => setUserFormData({...userFormData, phone: e.target.value})}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Роль</InputLabel>
              <Select
                value={userFormData.role}
                label="Роль"
                onChange={(e) => setUserFormData({...userFormData, role: e.target.value})}
              >
                <MenuItem value="user">Пользователь</MenuItem>
                <MenuItem value="guide">Гид</MenuItem>
                <MenuItem value="admin">Администратор</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateUserDialogOpen(false)}>Отмена</Button>
          <Button 
            onClick={handleCreateUser} 
            variant="contained"
            disabled={updating || !userFormData.firstName || !userFormData.lastName || !userFormData.email || !userFormData.password}
          >
            {updating ? <CircularProgress size={20} /> : 'Создать'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Диалог редактирования пользователя */}
      <Dialog open={editUserDialogOpen} onClose={() => setEditUserDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Редактировать пользователя</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Имя"
              value={userFormData.firstName}
              onChange={(e) => setUserFormData({...userFormData, firstName: e.target.value})}
              fullWidth
              required
            />
            <TextField
              label="Фамилия"
              value={userFormData.lastName}
              onChange={(e) => setUserFormData({...userFormData, lastName: e.target.value})}
              fullWidth
              required
            />
            <TextField
              label="Email"
              type="email"
              value={userFormData.email}
              onChange={(e) => setUserFormData({...userFormData, email: e.target.value})}
              fullWidth
              required
            />
            <TextField
              label="Телефон"
              value={userFormData.phone}
              onChange={(e) => setUserFormData({...userFormData, phone: e.target.value})}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Роль</InputLabel>
              <Select
                value={userFormData.role}
                label="Роль"
                onChange={(e) => setUserFormData({...userFormData, role: e.target.value})}
              >
                <MenuItem value="user">Пользователь</MenuItem>
                <MenuItem value="guide">Гид</MenuItem>
                <MenuItem value="admin">Администратор</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditUserDialogOpen(false)}>Отмена</Button>
          <Button 
            onClick={handleEditUser} 
            variant="contained"
            disabled={updating || !userFormData.firstName || !userFormData.lastName || !userFormData.email}
          >
            {updating ? <CircularProgress size={20} /> : 'Сохранить'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Диалог создания тура */}
      <Dialog open={createTourDialogOpen} onClose={() => setCreateTourDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Создать тур</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Название тура"
              value={tourFormData.title}
              onChange={(e) => setTourFormData({...tourFormData, title: e.target.value})}
              fullWidth
              required
            />
            <TextField
              label="Описание"
              value={tourFormData.description}
              onChange={(e) => setTourFormData({...tourFormData, description: e.target.value})}
              fullWidth
              multiline
              rows={3}
              required
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Цена (KZT)"
                type="number"
                value={tourFormData.price}
                onChange={(e) => setTourFormData({...tourFormData, price: Number(e.target.value)})}
                fullWidth
                required
              />
              <TextField
                label="Длительность (дни)"
                type="number"
                value={tourFormData.duration}
                onChange={(e) => setTourFormData({...tourFormData, duration: Number(e.target.value)})}
                fullWidth
                required
              />
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Регион"
                value={tourFormData.region}
                onChange={(e) => setTourFormData({...tourFormData, region: e.target.value})}
                fullWidth
                required
              />
              <TextField
                label="Максимум участников"
                type="number"
                value={tourFormData.maxGroupSize}
                onChange={(e) => setTourFormData({...tourFormData, maxGroupSize: Number(e.target.value)})}
                fullWidth
              />
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Сложность</InputLabel>
                <Select
                  value={tourFormData.difficulty}
                  label="Сложность"
                  onChange={(e) => setTourFormData({...tourFormData, difficulty: e.target.value})}
                >
                  <MenuItem value="easy">Легкий</MenuItem>
                  <MenuItem value="moderate">Умеренный</MenuItem>
                  <MenuItem value="challenging">Сложный</MenuItem>
                  <MenuItem value="hard">Очень сложный</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Категория</InputLabel>
                <Select
                  value={tourFormData.category}
                  label="Категория"
                  onChange={(e) => setTourFormData({...tourFormData, category: e.target.value})}
                >
                  <MenuItem value="nature">Природа</MenuItem>
                  <MenuItem value="culture">Культура</MenuItem>
                  <MenuItem value="adventure">Приключения</MenuItem>
                  <MenuItem value="history">История</MenuItem>
                </Select>
              </FormControl>
            </Box>
            {guides.length > 0 && (
              <FormControl fullWidth>
                <InputLabel>Гид</InputLabel>
                <Select
                  value={tourFormData.guideId}
                  label="Гид"
                  onChange={(e) => setTourFormData({...tourFormData, guideId: e.target.value})}
                >
                  <MenuItem value="">Без гида</MenuItem>
                  {guides.map((guide) => (
                    <MenuItem key={guide.id} value={guide.id}>
                      {guide.firstName} {guide.lastName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateTourDialogOpen(false)}>Отмена</Button>
          <Button 
            onClick={handleCreateTour} 
            variant="contained"
            disabled={updating || !tourFormData.title || !tourFormData.description || !tourFormData.price || !tourFormData.region}
          >
            {updating ? <CircularProgress size={20} /> : 'Создать'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Диалог редактирования тура */}
      <Dialog open={editTourDialogOpen} onClose={() => setEditTourDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Редактировать тур</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Название тура"
              value={tourFormData.title}
              onChange={(e) => setTourFormData({...tourFormData, title: e.target.value})}
              fullWidth
              required
            />
            <TextField
              label="Описание"
              value={tourFormData.description}
              onChange={(e) => setTourFormData({...tourFormData, description: e.target.value})}
              fullWidth
              multiline
              rows={3}
              required
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Цена (KZT)"
                type="number"
                value={tourFormData.price}
                onChange={(e) => setTourFormData({...tourFormData, price: Number(e.target.value)})}
                fullWidth
                required
              />
              <TextField
                label="Длительность (дни)"
                type="number"
                value={tourFormData.duration}
                onChange={(e) => setTourFormData({...tourFormData, duration: Number(e.target.value)})}
                fullWidth
                required
              />
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Регион"
                value={tourFormData.region}
                onChange={(e) => setTourFormData({...tourFormData, region: e.target.value})}
                fullWidth
                required
              />
              <TextField
                label="Максимум участников"
                type="number"
                value={tourFormData.maxGroupSize}
                onChange={(e) => setTourFormData({...tourFormData, maxGroupSize: Number(e.target.value)})}
                fullWidth
              />
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Сложность</InputLabel>
                <Select
                  value={tourFormData.difficulty}
                  label="Сложность"
                  onChange={(e) => setTourFormData({...tourFormData, difficulty: e.target.value})}
                >
                  <MenuItem value="easy">Легкий</MenuItem>
                  <MenuItem value="moderate">Умеренный</MenuItem>
                  <MenuItem value="challenging">Сложный</MenuItem>
                  <MenuItem value="hard">Очень сложный</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Категория</InputLabel>
                <Select
                  value={tourFormData.category}
                  label="Категория"
                  onChange={(e) => setTourFormData({...tourFormData, category: e.target.value})}
                >
                  <MenuItem value="nature">Природа</MenuItem>
                  <MenuItem value="culture">Культура</MenuItem>
                  <MenuItem value="adventure">Приключения</MenuItem>
                  <MenuItem value="history">История</MenuItem>
                </Select>
              </FormControl>
            </Box>
            {guides.length > 0 && (
              <FormControl fullWidth>
                <InputLabel>Гид</InputLabel>
                <Select
                  value={tourFormData.guideId}
                  label="Гид"
                  onChange={(e) => setTourFormData({...tourFormData, guideId: e.target.value})}
                >
                  <MenuItem value="">Без гида</MenuItem>
                  {guides.map((guide) => (
                    <MenuItem key={guide.id} value={guide.id}>
                      {guide.firstName} {guide.lastName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditTourDialogOpen(false)}>Отмена</Button>
          <Button 
            onClick={handleEditTour} 
            variant="contained"
            disabled={updating || !tourFormData.title || !tourFormData.description || !tourFormData.price || !tourFormData.region}
          >
            {updating ? <CircularProgress size={20} /> : 'Сохранить'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default DashboardPage; 