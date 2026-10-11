import { useState, useEffect, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { FavoritesContext } from './FavoritesContext';
import { PRODUCTS_CATALOG } from '../services/product.api';

const STORAGE_KEY = 'taca_user_favorites';

const getInitialFavorites = () => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error('Failed to parse favorites from localStorage', e);
  }
  return [];
};

export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState(getInitialFavorites);

  // Sync with localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
    } catch (e) {
      console.error('Failed to save favorites to localStorage', e);
    }
  }, [favorites]);

  // Check if an item is favorited
  const isFavorite = useCallback((productId) => {
    if (!productId) return false;
    const targetId = String(productId);
    return favorites.some(item => String(item.id || item.product_id) === targetId);
  }, [favorites]);

  // Toggle favorite for an item
  const toggleFavorite = useCallback((productOrId) => {
    if (!productOrId) return false;

    const productId = typeof productOrId === 'object' 
      ? productOrId.id || productOrId.product_id 
      : productOrId;
    const targetId = String(productId);

    let nextState = false;
    setFavorites(prev => {
      const existsIndex = prev.findIndex(item => String(item.id || item.product_id) === targetId);
      
      if (existsIndex > -1) {
        // Remove from favorites
        nextState = false;
        return prev.filter((_, idx) => idx !== existsIndex);
      }

      // Add to favorites
      nextState = true;
      let fullProduct;
      if (typeof productOrId === 'object' && productOrId.name) {
        fullProduct = {
          ...productOrId,
          id: productId,
          product_id: productId,
        };
      } else {
        // Lookup from catalog
        const found = PRODUCTS_CATALOG.find(p => String(p.id) === targetId);
        if (found) {
          fullProduct = { ...found, product_id: found.id };
        } else {
          fullProduct = {
            id: productId,
            product_id: productId,
            name: `Sản phẩm #${productId}`,
            price: 0,
            image: '',
            rating: 5.0,
            soldCount: 0
          };
        }
      }

      return [fullProduct, ...prev];
    });

    return nextState;
  }, []);

  // Remove specific item from favorites
  const removeFavorite = useCallback((productId) => {
    const targetId = String(productId);
    setFavorites(prev => prev.filter(item => String(item.id || item.product_id) !== targetId));
  }, []);

  // Map representation for fast lookup
  const favoritesMap = useMemo(() => {
    const map = {};
    favorites.forEach(item => {
      const id = item.id || item.product_id;
      if (id) {
        map[id] = true;
        map[String(id)] = true;
      }
    });
    return map;
  }, [favorites]);

  const value = useMemo(() => ({
    favorites,
    favoritesMap,
    isFavorite,
    toggleFavorite,
    removeFavorite,
  }), [favorites, favoritesMap, isFavorite, toggleFavorite, removeFavorite]);

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
};

FavoritesProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default FavoritesProvider;
