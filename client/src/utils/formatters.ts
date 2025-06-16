// Форматирование цены
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('ru-KZ', {
    style: 'currency',
    currency: 'KZT',
    minimumFractionDigits: 0,
  }).format(price);
};

// Форматирование даты
export const formatDate = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(dateObj);
};

// Форматирование короткой даты
export const formatShortDate = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('ru-RU', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(dateObj);
};

// Форматирование даты и времени
export const formatDateTime = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('ru-RU', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(dateObj);
};

// Форматирование продолжительности
export const formatDuration = (days: number): string => {
  if (days === 1) return '1 день';
  if (days < 5) return `${days} дня`;
  return `${days} дней`;
};

// Сокращение текста
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
};

// Форматирование номера телефона
export const formatPhoneNumber = (phone: string): string => {
  // Удаляем все символы кроме цифр
  const cleaned = phone.replace(/\D/g, '');
  
  // Форматируем для казахстанских номеров
  if (cleaned.startsWith('7') && cleaned.length === 11) {
    return `+7 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7, 9)}-${cleaned.slice(9)}`;
  }
  
  return phone;
};

// Получение инициалов
export const getInitials = (firstName: string, lastName: string): string => {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
};

// Перевод статусов на русский
export const translateStatus = (status: string): string => {
  const statusTranslations: Record<string, string> = {
    pending: 'Ожидает',
    confirmed: 'Подтверждено',
    cancelled: 'Отменено',
    completed: 'Завершено',
    paid: 'Оплачено',
    refunded: 'Возвращено',
    active: 'Активный',
    inactive: 'Неактивный',
    verified: 'Верифицирован',
    unverified: 'Не верифицирован',
  };
  
  return statusTranslations[status] || status;
};

// Перевод ролей на русский
export const translateRole = (role: string): string => {
  const roleTranslations: Record<string, string> = {
    user: 'Пользователь',
    guide: 'Гид',
    admin: 'Администратор',
  };
  
  return roleTranslations[role] || role;
}; 