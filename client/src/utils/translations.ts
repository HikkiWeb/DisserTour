// Функции для перевода значений enum на русский язык

export const getDifficultyText = (difficulty: string): string => {
  const difficultyMap: { [key: string]: string } = {
    'easy': 'Легкий',
    'moderate': 'Средний', 
    'challenging': 'Сложный',
    'hard': 'Очень сложный'
  };
  return difficultyMap[difficulty] || difficulty;
};

export const getCategoryText = (category: string): string => {
  const categoryMap: { [key: string]: string } = {
    'nature': 'Природа',
    'culture': 'Культура',
    'adventure': 'Приключения',
    'history': 'История',
    'city': 'Город',
    'mountains': 'Горы'
  };
  return categoryMap[category] || category;
};

export const getRoleText = (role: string): string => {
  const roleMap: { [key: string]: string } = {
    'user': 'Пользователь',
    'admin': 'Администратор'
  };
  return roleMap[role] || role;
};

export const getStatusText = (status: string): string => {
  const statusMap: { [key: string]: string } = {
    'pending': 'Ожидает',
    'confirmed': 'Подтвержден',
    'cancelled': 'Отменен',
    'completed': 'Завершен'
  };
  return statusMap[status] || status;
};

export const getDifficultyColor = (difficulty: string): string => {
  const colorMap: { [key: string]: string } = {
    'easy': 'success',
    'moderate': 'info',
    'challenging': 'warning',
    'hard': 'error'
  };
  return colorMap[difficulty] || 'default';
}; 