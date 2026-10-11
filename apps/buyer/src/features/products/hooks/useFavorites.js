import { useContext } from 'react';
import { FavoritesContext } from '../contexts/FavoritesContext';

const DEFAULT_FAVORITES_CONTEXT = {
  favorites: [],
  favoritesMap: {},
  isFavorite: () => false,
  toggleFavorite: () => false,
  removeFavorite: () => {},
};

/**
 * Hook truy xuất và quản lý danh sách sản phẩm yêu thích (Favorites)
 */
export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    return DEFAULT_FAVORITES_CONTEXT;
  }
  return context;
};

export default useFavorites;
