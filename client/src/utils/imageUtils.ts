// Утилиты для работы с изображениями

/**
 * Получает корректный URL для изображения
 * @param imagePath - путь к изображению
 * @returns корректный URL
 */
export const getImageUrl = (imagePath: string | undefined | null): string => {
  // Если изображение не задано, используем data URL с простой картинкой
  if (!imagePath) {
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+CiAgPHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPtCi0YPRgDwvdGV4dD4KICA8L3N2Zz4K';
  }

  // Если это уже полный URL (начинается с http)
  if (imagePath.startsWith('http')) {
    return imagePath;
  }

  // Если это путь к загруженному изображению (начинается с /uploads/)
  // Благодаря proxy в package.json, все запросы будут идти через React dev server
  if (imagePath.startsWith('/uploads/')) {
    return imagePath; // React dev server будет проксировать на http://localhost:5000
  }

  // Если это относительный путь к загруженному изображению (uploads/...)
  if (imagePath.includes('uploads/')) {
    return imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  }

  // Если это статическое изображение (начинается с /images/)
  if (imagePath.startsWith('/images/')) {
    return imagePath;
  }

  // По умолчанию
  return imagePath;
};

/**
 * Получает URL первого изображения из массива
 * @param images - массив путей к изображениям
 * @returns URL первого изображения или изображение по умолчанию
 */
export const getFirstImageUrl = (images: string[] | undefined | null): string => {
  if (!images || images.length === 0) {
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+CiAgPHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPtCi0YPRgDwvdGV4dD4KICA8L3N2Zz4K';
  }
  
  return getImageUrl(images[0]);
};

/**
 * Логирует информацию об изображении для отладки
 * @param label - метка для лога
 * @param imagePath - путь к изображению
 */
export const debugImage = (label: string, imagePath: string | undefined | null) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Image Debug] ${label}:`, {
      originalPath: imagePath,
      processedUrl: getImageUrl(imagePath),
      proxy: 'http://localhost:5000 (через React dev server)'
    });
  }
};

/**
 * Обработчик ошибки загрузки изображения
 * @param event - событие ошибки
 * @param fallbackUrl - URL для fallback
 */
export const handleImageError = (
  event: React.SyntheticEvent<HTMLImageElement, Event>,
  fallbackUrl?: string
) => {
  const target = event.target as HTMLImageElement;
  const currentSrc = target.src;
  
  if (process.env.NODE_ENV === 'development') {
    console.warn('Image failed to load:', currentSrc);
  }
  
  // Используем data URL как надежный fallback
  const defaultFallback = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+CiAgPHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPtCd0LXRgiDRhNC+0YLQvjwvdGV4dD4KICA8L3N2Zz4K';
  
  // Избегаем бесконечного цикла
  if (!currentSrc.includes('data:image/svg+xml')) {
    target.src = fallbackUrl || defaultFallback;
  }
}; 