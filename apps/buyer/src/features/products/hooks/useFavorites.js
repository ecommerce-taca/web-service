import { useState, useEffect } from 'react';
import { useAuth } from '../../auth/hooks/useAuth';
import { favoritesApi } from '../services/favorites.api';

/**
 * Hook kiểm tra trạng thái yêu thích của danh sách sản phẩm (API 40)
 * @param {Array<string|number>} productIds - Mảng các ID sản phẩm
 * @returns {Object} { favoritesMap, loading, error, toggleFavorite }
 */
export const useFavorites = (productIds) => {
  const { user } = useAuth();
  const [favoritesMap, setFavoritesMap] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Chỉ kiểm tra khi có user đăng nhập và có danh sách ID
    if (!user || !productIds || productIds.length === 0) {
      setFavoritesMap({});
      return;
    }

    const checkStatus = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await favoritesApi.checkFavoriteStatus(productIds);
        // Giả sử API trả về mảng các productId đã được yêu thích, hoặc map
        const data = response.data || []; 
        const newMap = {};
        data.forEach(id => {
          newMap[id] = true;
        });
        setFavoritesMap(newMap);
      } catch (err) {
        console.error('Error checking favorite status:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    checkStatus();
  }, [user, JSON.stringify(productIds)]);

  // Hàm helper để toggle một sản phẩm
  const toggleFavorite = async (productId, currentStatus) => {
    if (!user) {
      // Trigger modal đăng nhập (hoặc thông báo) nếu cần
      alert('Vui lòng đăng nhập để sử dụng tính năng này!');
      return false;
    }

    // Optimistic update
    const newStatus = !currentStatus;
    setFavoritesMap(prev => ({
      ...prev,
      [productId]: newStatus
    }));

    try {
      if (newStatus) {
        await favoritesApi.addFavorite(productId);
      } else {
        await favoritesApi.removeFavorite(productId);
      }
      return newStatus;
    } catch (err) {
      console.error('Error toggling favorite:', err);
      // Rollback
      setFavoritesMap(prev => ({
        ...prev,
        [productId]: currentStatus
      }));
      return currentStatus;
    }
  };

  return { favoritesMap, loading, error, toggleFavorite };
};
