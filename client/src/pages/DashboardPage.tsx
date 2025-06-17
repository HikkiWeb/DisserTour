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
  TablePagination,
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
  Star,
  CalendarToday,
  Phone,
  Email,
  LocationOn,
  Person,
  AdminPanelSettings,
  SupervisorAccount,
  Verified,
  Badge as BadgeIcon,
  CloudUpload,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import { Booking, Tour as TourType, User } from '../types';
import { getDifficultyText, getCategoryText, getRoleText } from '../utils/translations';

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

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [users, setUsers] = useState<User[]>([]);
  const [tours, setTours] = useState<TourType[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [createUserDialogOpen, setCreateUserDialogOpen] = useState(false);
  const [editUserDialogOpen, setEditUserDialogOpen] = useState(false);
  const [createTourDialogOpen, setCreateTourDialogOpen] = useState(false);
  const [editTourDialogOpen, setEditTourDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [newRole, setNewRole] = useState('');
  const [updating, setUpdating] = useState(false);
  const [reviews, setReviews] = useState<any[]>([]);
  
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
    difficulty: 'moderate' as 'easy' | 'moderate' | 'challenging' | 'hard',
    category: 'nature',
    region: '',
    season: 'all',
    startLocation: '',
    locations: [] as string[],
    itinerary: [] as string[],
    included: [] as string[],
    excluded: [] as string[],
    requirements: [] as string[],
    tags: [] as string[],
    images: [] as File[],
  });

  // Состояние для предварительного просмотра изображений
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);

  const isAdmin = user?.role === 'admin';

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
          apiService.getAdminReviews()
        );
      }

      const responses = await Promise.all(promises);

      if (isAdmin && responses.length >= 4) {
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
      }

      setLoading(false);
    } catch (error: any) {
      setError(error.message || 'Ошибка загрузки данных');
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleUserRoleChange = async () => {
    if (!selectedUser || !newRole) return;
    
    try {
      setUpdating(true);
      setError('');
      
      const response = await apiService.updateUserRole(selectedUser.id, newRole);
      if (response.status === 'success') {
        setSuccess('Роль пользователя обновлена');
        setUserDialogOpen(false);
        setSelectedUser(null);
        setNewRole('');
        loadDashboardData();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка обновления роли');
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteItem = async () => {
    if (!selectedItem) return;
    
    try {
      setUpdating(true);
      setError('');
      
      let response;
      
      switch (selectedItem.type) {
        case 'user':
          response = await apiService.deleteUser(selectedItem.id);
          break;
        case 'tour':
          response = await apiService.deleteAdminTour(selectedItem.id);
          break;
        case 'booking':
          response = await apiService.deleteBooking(selectedItem.id);
          break;
        case 'review':
          response = await apiService.deleteAdminReview(selectedItem.id);
          break;
        default:
          throw new Error('Неизвестный тип элемента');
      }
      
      if (response?.status === 'success') {
        setSuccess('Элемент успешно удален');
        setDeleteDialogOpen(false);
        setSelectedItem(null);
        loadDashboardData();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка удаления');
    } finally {
      setUpdating(false);
    }
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

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <AdminPanelSettings color="error" />;
      default: return <Person color="action" />;
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
      
      // Валидация обязательных полей
      if (!tourFormData.title.trim()) {
        setError('Название тура обязательно');
        return;
      }
      if (!tourFormData.description.trim()) {
        setError('Описание тура обязательно');
        return;
      }
      if (!tourFormData.price || tourFormData.price <= 0) {
        setError('Цена должна быть больше 0');
        return;
      }
      if (!tourFormData.region.trim()) {
        setError('Регион обязателен');
        return;
      }
      
      // Подготовка данных для отправки
      const { images, ...tourData } = tourFormData;
      
      // Обработка сезона
      const processedSeason = tourData.season === 'all' ? ['spring', 'summer', 'autumn', 'winter'] : [tourData.season];
      
      // Обработка startLocation
      const processedStartLocation = tourData.startLocation ? { address: tourData.startLocation } : null;
      
      // Обработка itinerary
      const processedItinerary = tourData.itinerary.length > 0 
        ? tourData.itinerary.map((item, index) => ({
            day: index + 1,
            description: item.trim()
          })).filter(item => item.description)
        : null;
      
      const processedTourData = {
        ...tourData,
        season: processedSeason,
        startLocation: processedStartLocation,
        itinerary: processedItinerary || [],
        locations: tourData.locations || [],
        included: tourData.included || [],
        excluded: tourData.excluded || [],
        requirements: tourData.requirements || [],
        tags: tourData.tags || []
      };
      
      const response = await apiService.createAdminTour(processedTourData);
      
      if (response.status === 'success' && response.data?.tour) {
        const tourId = response.data.tour.id;
        
        // Если есть изображения, загружаем их отдельно
        if (images && images.length > 0) {
          const formData = new FormData();
          images.forEach((file: File) => {
            formData.append('images', file);
          });
          
          try {
            await apiService.uploadTourImages(tourId, formData);
          } catch (imageError: any) {
            console.warn('Ошибка загрузки изображений:', imageError);
            // Тур создан, но изображения не загружены - это не критично
          }
        }
        
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
          startLocation: '',
          locations: [],
          itinerary: [],
          included: [],
          excluded: [],
          requirements: [],
          tags: [],
          images: [],
        });
        setImagePreviewUrls([]);
        loadDashboardData();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка создания тура');
    } finally {
      setUpdating(false);
    }
  };

  const openEditTourDialog = (tour: TourType) => {
    setSelectedItem(tour);
    
    // Обработка сезона - если это массив, берем первый элемент или 'all'
    let seasonValue = 'all';
    if (tour.season && Array.isArray(tour.season)) {
      if (tour.season.length === 4 || tour.season.includes('all')) {
        seasonValue = 'all';
      } else if (tour.season.length > 0) {
        seasonValue = tour.season[0];
      }
    }
    
    // Обработка startLocation
    let startLocationValue = '';
    if (tour.startLocation) {
      if (typeof tour.startLocation === 'string') {
        startLocationValue = tour.startLocation;
      } else if (tour.startLocation.address) {
        startLocationValue = tour.startLocation.address;
      }
    }
    
    // Обработка itinerary
    let itineraryValue: string[] = [];
    if (tour.itinerary) {
      if (Array.isArray(tour.itinerary)) {
        itineraryValue = tour.itinerary.map((item: any) => {
          if (typeof item === 'string') {
            return item;
          } else if (item.description) {
            return item.description;
          } else {
            return `День ${item.day || ''}: ${item.title || ''}`;
          }
        });
      }
    }
    
    setTourFormData({
      title: tour.title,
      description: tour.description,
      shortDescription: tour.shortDescription || '',
      price: tour.price,
      duration: tour.duration,
      maxGroupSize: tour.maxGroupSize || 10,
      difficulty: tour.difficulty,
      category: tour.category || 'nature',
      region: tour.region,
      season: seasonValue,
      startLocation: startLocationValue,
      locations: Array.isArray(tour.locations) ? tour.locations : [],
      itinerary: itineraryValue,
      included: Array.isArray(tour.included) ? tour.included : [],
      excluded: Array.isArray(tour.excluded) ? tour.excluded : [],
      requirements: Array.isArray(tour.requirements) ? tour.requirements : [],
      tags: Array.isArray(tour.tags) ? tour.tags : [],
      images: [],
    });
    setEditTourDialogOpen(true);
  };

  const handleEditTour = async () => {
    if (!selectedItem) return;
    
    try {
      setUpdating(true);
      setError('');
      
      // Валидация обязательных полей
      if (!tourFormData.title.trim()) {
        setError('Название тура обязательно');
        return;
      }
      if (!tourFormData.description.trim()) {
        setError('Описание тура обязательно');
        return;
      }
      if (!tourFormData.price || tourFormData.price <= 0) {
        setError('Цена должна быть больше 0');
        return;
      }
      if (!tourFormData.region.trim()) {
        setError('Регион обязателен');
        return;
      }
      
      // Подготовка данных для отправки
      const { images, ...tourData } = tourFormData;
      
      // Обработка сезона
      const processedSeason = tourData.season === 'all' ? ['spring', 'summer', 'autumn', 'winter'] : [tourData.season];
      
      // Обработка startLocation
      const processedStartLocation = tourData.startLocation ? { address: tourData.startLocation } : null;
      
      // Обработка itinerary
      const processedItinerary = tourData.itinerary.length > 0 
        ? tourData.itinerary.map((item, index) => ({
            day: index + 1,
            description: item.trim()
          })).filter(item => item.description)
        : null;
      
      const processedTourData = {
        ...tourData,
        season: processedSeason,
        startLocation: processedStartLocation,
        itinerary: processedItinerary || [],
        locations: tourData.locations || [],
        included: tourData.included || [],
        excluded: tourData.excluded || [],
        requirements: tourData.requirements || [],
        tags: tourData.tags || []
      };
      
      const response = await apiService.updateAdminTour(selectedItem.id, processedTourData);
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
      startLocation: '',
      locations: [],
      itinerary: [],
      included: [],
      excluded: [],
      requirements: [],
      tags: [],
      images: [],
    });
    setCreateTourDialogOpen(true);
  };

  // Функции для работы с изображениями
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newImages = Array.from(files);
      setTourFormData(prev => ({
        ...prev,
        images: [...prev.images, ...newImages]
      }));
      
      // Создаем предварительные URL для просмотра
      newImages.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          setImagePreviewUrls(prev => [...prev, e.target?.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setTourFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
    setImagePreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const clearImages = () => {
    setTourFormData(prev => ({ ...prev, images: [] }));
    setImagePreviewUrls([]);
  };

  // Фильтрация данных
  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = 
      booking.user?.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.user?.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.tour?.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
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

  if (!isAdmin) {
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Панель управления
        </Typography>
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

      {/* Табы */}
      <Paper elevation={2} sx={{ borderRadius: 2 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          aria-label="dashboard tabs"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Туры" />
          <Tab label="Бронирования" />
          <Tab label="Пользователи" />
          <Tab label="Отзывы" />
        </Tabs>

        {/* Контент табов */}
        <Box sx={{ p: 3 }}>
          {/* Таб туров */}
          <TabPanel value={tabValue} index={0}>
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
                    <TableCell>Сложность</TableCell>
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
                              {getCategoryText(tour.category || '')}
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
                        <Chip
                          label={getDifficultyText(tour.difficulty)}
                          color="primary"
                          variant="outlined"
                          size="small"
                        />
                      </TableCell>
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

          {/* Таб бронирований */}
          <TabPanel value={tabValue} index={1}>
            <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
              <TextField
                size="small"
                placeholder="Поиск бронирований..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
                sx={{ minWidth: 200 }}
              />
            </Box>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Тур</TableCell>
                    <TableCell>Клиент</TableCell>
                    <TableCell>Дата начала</TableCell>
                    <TableCell>Участники</TableCell>
                    <TableCell>Сумма</TableCell>
                    <TableCell>Действия</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredBookings.map((booking) => (
                    <TableRow key={booking.id} hover>
                      <TableCell>
                        <Typography variant="body2">
                          {booking.tour?.title}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar 
                            src={booking.user?.avatar} 
                            sx={{ width: 30, height: 30, mr: 1 }}
                          >
                            {booking.user?.firstName?.charAt(0)}
                          </Avatar>
                          <Typography variant="body2">
                            {booking.user?.firstName} {booking.user?.lastName}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {new Date(booking.startDate).toLocaleDateString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {booking.participants}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatCurrency(booking.totalPrice)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Tooltip title="Удалить">
                          <IconButton 
                            size="small" 
                            color="error"
                            onClick={() => openDeleteDialog(booking, 'booking')}
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

            {filteredBookings.length === 0 && (
              <Box textAlign="center" py={6}>
                <CalendarToday sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Нет бронирований
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {searchTerm ? 'Попробуйте изменить параметры поиска' : 'Бронирования появятся после создания'}
                </Typography>
              </Box>
            )}
          </TabPanel>

          {/* Таб пользователей */}
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
                            color={user.role === 'admin' ? 'error' : 'default'}
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

          {/* Таб отзывов */}
          <TabPanel value={tabValue} index={3}>
            {/* Отзывы */}
          </TabPanel>
        </Box>
      </Paper>

      {/* Диалог изменения статуса бронирования */}
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
            <TextField
              label="Краткое описание"
              value={tourFormData.shortDescription}
              onChange={(e) => setTourFormData({...tourFormData, shortDescription: e.target.value})}
              fullWidth
              multiline
              rows={2}
              helperText="Краткое описание для карточки тура (максимум 200 символов)"
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
                  onChange={(e) => setTourFormData({...tourFormData, difficulty: e.target.value as 'easy' | 'moderate' | 'challenging' | 'hard'})}
                >
                  <MenuItem value="easy">Легкий</MenuItem>
                  <MenuItem value="moderate">Средний</MenuItem>
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
            <FormControl fullWidth>
              <InputLabel>Сезон</InputLabel>
              <Select
                value={tourFormData.season}
                label="Сезон"
                onChange={(e) => setTourFormData({...tourFormData, season: e.target.value})}
              >
                <MenuItem value="all">Круглый год</MenuItem>
                <MenuItem value="spring">Весна</MenuItem>
                <MenuItem value="summer">Лето</MenuItem>
                <MenuItem value="autumn">Осень</MenuItem>
                <MenuItem value="winter">Зима</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Место начала тура"
              value={tourFormData.startLocation}
              onChange={(e) => setTourFormData({...tourFormData, startLocation: e.target.value})}
              fullWidth
              placeholder="Например: Алматы, площадь Республики"
            />
            <TextField
              label="Локации (через запятую)"
              value={tourFormData.locations.join(', ')}
              onChange={(e) => setTourFormData({...tourFormData, locations: e.target.value.split(',').map(s => s.trim()).filter(Boolean)})}
              fullWidth
              placeholder="Например: Медео, Чимбулак, Большое Алматинское озеро"
            />
            <TextField
              label="Маршрут (каждый день с новой строки)"
              value={tourFormData.itinerary.join('\n')}
              onChange={(e) => setTourFormData({...tourFormData, itinerary: e.target.value.split('\n').filter(s => s.trim())})}
              fullWidth
              multiline
              rows={4}
              placeholder="День 1: Прибытие в Алматы&#10;День 2: Экскурсия по городу&#10;День 3: Поход в горы"
            />
            <TextField
              label="Что включено (через запятую)"
              value={tourFormData.included.join(', ')}
              onChange={(e) => setTourFormData({...tourFormData, included: e.target.value.split(',').map(s => s.trim()).filter(Boolean)})}
              fullWidth
              placeholder="Например: Трансфер, питание, проживание, гид"
            />
            <TextField
              label="Что не включено (через запятую)"
              value={tourFormData.excluded.join(', ')}
              onChange={(e) => setTourFormData({...tourFormData, excluded: e.target.value.split(',').map(s => s.trim()).filter(Boolean)})}
              fullWidth
              placeholder="Например: Авиабилеты, страховка, личные расходы"
            />
            <TextField
              label="Требования (через запятую)"
              value={tourFormData.requirements.join(', ')}
              onChange={(e) => setTourFormData({...tourFormData, requirements: e.target.value.split(',').map(s => s.trim()).filter(Boolean)})}
              fullWidth
              placeholder="Например: Удобная обувь, теплая одежда, документы"
            />
            <TextField
              label="Теги (через запятую)"
              value={tourFormData.tags.join(', ')}
              onChange={(e) => setTourFormData({...tourFormData, tags: e.target.value.split(',').map(s => s.trim()).filter(Boolean)})}
              fullWidth
              placeholder="Например: горы, природа, активный отдых"
            />
            
            {/* Загрузка изображений */}
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Изображения тура
              </Typography>
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="tour-images-upload"
                multiple
                type="file"
                onChange={handleImageUpload}
              />
              <label htmlFor="tour-images-upload">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<CloudUpload />}
                  sx={{ mb: 2 }}
                >
                  Загрузить изображения
                </Button>
              </label>
              
              {/* Предварительный просмотр изображений */}
              {imagePreviewUrls.length > 0 && (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                  {imagePreviewUrls.map((url, index) => (
                    <Box key={index} sx={{ position: 'relative' }}>
                      <img
                        src={url}
                        alt={`Preview ${index + 1}`}
                        style={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 4 }}
                      />
                      <IconButton
                        size="small"
                        sx={{
                          position: 'absolute',
                          top: -8,
                          right: -8,
                          backgroundColor: 'error.main',
                          color: 'white',
                          '&:hover': { backgroundColor: 'error.dark' }
                        }}
                        onClick={() => removeImage(index)}
                      >
                        <Close />
                      </IconButton>
                    </Box>
                  ))}
                  <Button
                    size="small"
                    variant="outlined"
                    color="error"
                    onClick={clearImages}
                    sx={{ alignSelf: 'flex-start' }}
                  >
                    Очистить все
                  </Button>
                </Box>
              )}
            </Box>
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
            <TextField
              label="Краткое описание"
              value={tourFormData.shortDescription}
              onChange={(e) => setTourFormData({...tourFormData, shortDescription: e.target.value})}
              fullWidth
              multiline
              rows={2}
              helperText="Краткое описание для карточки тура (максимум 200 символов)"
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
                  onChange={(e) => setTourFormData({...tourFormData, difficulty: e.target.value as 'easy' | 'moderate' | 'challenging' | 'hard'})}
                >
                  <MenuItem value="easy">Легкий</MenuItem>
                  <MenuItem value="moderate">Средний</MenuItem>
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
            <FormControl fullWidth>
              <InputLabel>Сезон</InputLabel>
              <Select
                value={tourFormData.season}
                label="Сезон"
                onChange={(e) => setTourFormData({...tourFormData, season: e.target.value})}
              >
                <MenuItem value="all">Круглый год</MenuItem>
                <MenuItem value="spring">Весна</MenuItem>
                <MenuItem value="summer">Лето</MenuItem>
                <MenuItem value="autumn">Осень</MenuItem>
                <MenuItem value="winter">Зима</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Место начала тура"
              value={tourFormData.startLocation}
              onChange={(e) => setTourFormData({...tourFormData, startLocation: e.target.value})}
              fullWidth
              placeholder="Например: Алматы, площадь Республики"
            />
            <TextField
              label="Локации (через запятую)"
              value={tourFormData.locations.join(', ')}
              onChange={(e) => setTourFormData({...tourFormData, locations: e.target.value.split(',').map(s => s.trim()).filter(Boolean)})}
              fullWidth
              placeholder="Например: Медео, Чимбулак, Большое Алматинское озеро"
            />
            <TextField
              label="Маршрут (каждый день с новой строки)"
              value={tourFormData.itinerary.join('\n')}
              onChange={(e) => setTourFormData({...tourFormData, itinerary: e.target.value.split('\n').filter(s => s.trim())})}
              fullWidth
              multiline
              rows={4}
              placeholder="День 1: Прибытие в Алматы&#10;День 2: Экскурсия по городу&#10;День 3: Поход в горы"
            />
            <TextField
              label="Что включено (через запятую)"
              value={tourFormData.included.join(', ')}
              onChange={(e) => setTourFormData({...tourFormData, included: e.target.value.split(',').map(s => s.trim()).filter(Boolean)})}
              fullWidth
              placeholder="Например: Трансфер, питание, проживание, гид"
            />
            <TextField
              label="Что не включено (через запятую)"
              value={tourFormData.excluded.join(', ')}
              onChange={(e) => setTourFormData({...tourFormData, excluded: e.target.value.split(',').map(s => s.trim()).filter(Boolean)})}
              fullWidth
              placeholder="Например: Авиабилеты, страховка, личные расходы"
            />
            <TextField
              label="Требования (через запятую)"
              value={tourFormData.requirements.join(', ')}
              onChange={(e) => setTourFormData({...tourFormData, requirements: e.target.value.split(',').map(s => s.trim()).filter(Boolean)})}
              fullWidth
              placeholder="Например: Удобная обувь, теплая одежда, документы"
            />
            <TextField
              label="Теги (через запятую)"
              value={tourFormData.tags.join(', ')}
              onChange={(e) => setTourFormData({...tourFormData, tags: e.target.value.split(',').map(s => s.trim()).filter(Boolean)})}
              fullWidth
              placeholder="Например: горы, природа, активный отдых"
            />
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