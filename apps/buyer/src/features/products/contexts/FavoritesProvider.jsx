import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import { FavoritesContext } from './FavoritesContext';
import { PRODUCTS_CATALOG, productApi } from '../services/product.api';
import { useAuth } from '../../auth/hooks/useAuth';
import apiClient, { isMockMode } from '../../../../../../shared/utils/api-client';

const STORAGE_KEY = 'taca_user_favorites';
// Backend: GET /users/me/favorites trả tối đa 100/trang (docs auth-user), đủ cho danh sách yêu thích của một người
const SERVER_PAGE_SIZE = 100;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const readLocalFavorites = () => {
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

const idOf = (item) => String(item?.id || item?.product_id || '');

// Gọi thẳng API (favorites.api.js ghi kèm dữ liệu demo vào localStorage và nuốt lỗi → không dùng ở đây)
const serverFavorites = {
  list: () => apiClient.get('/users/me/favorites', { params: { page: 1, size: SERVER_PAGE_SIZE } }),
  add: (productId) => apiClient.post('/users/me/favorites', { product_id: productId }),
  remove: (productId) => apiClient.delete(`/users/me/favorites/${productId}`),
};

// Product Catalog item → shape mà ProductCard/WishlistPage đang dùng
const toFavoriteItem = (p) => ({
  ...p,
  id: p.product_id,
  product_id: p.product_id,
  name: p.title,
  price: p.price?.sale_price ?? p.price?.base_price ?? 0,
  originalPrice: p.price?.base_price,
  image: p.cover_media?.url || '',
  rating: p.rating_summary?.average_rating ?? 0,
  soldCount: p.rating_summary?.sold_count ?? 0,
});

// Lấy chi tiết (tên, giá, ảnh) cho danh sách product_id từ server; giữ thứ tự của server
const hydrate = async (productIds) => {
  if (!productIds.length) return [];
  const res = await productApi.getProducts({ product_ids: productIds, size: productIds.length });
  const items = Array.isArray(res?.data) ? res.data : (res?.data?.items || []);
  const byId = new Map(items.map((p) => [String(p.product_id), toFavoriteItem(p)]));
  return productIds.map((id) => byId.get(String(id)) || { id, product_id: id, name: `Sản phẩm #${id}`, price: 0, image: '' });
};

export const FavoritesProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const useServer = isAuthenticated && !isMockMode();
  const [favorites, setFavorites] = useState(readLocalFavorites);
  const favoritesRef = useRef(favorites);
  favoritesRef.current = favorites;

  // Lưu bản sao vào localStorage: phục vụ khách chưa đăng nhập và đồng bộ giữa các tab
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
    } catch (e) {
      console.error('Failed to save favorites to localStorage', e);
    }
  }, [favorites]);

  // Tab khác thay đổi danh sách → cập nhật tab này (sự kiện storage chỉ bắn ở các tab KHÁC)
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === STORAGE_KEY) setFavorites(readLocalFavorites());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // Đăng nhập: đẩy mục khách đã thích lên server rồi tải danh sách chuẩn từ server
  useEffect(() => {
    if (!useServer) return undefined;
    let cancelled = false;
    (async () => {
      try {
        const res = await serverFavorites.list();
        const serverIds = (res?.data || []).map((f) => String(f.product_id)).filter(Boolean);
        // Chỉ đẩy id sản phẩm thật (UUID); dữ liệu demo cũ trong localStorage (id "1", "2"...) bị bỏ qua
        const guestOnly = favoritesRef.current.map(idOf)
          .filter((id) => UUID_RE.test(id) && !serverIds.includes(id));
        const pushed = await Promise.allSettled(guestOnly.map((id) => serverFavorites.add(id)));
        const accepted = guestOnly.filter((_, i) => pushed[i].status === 'fulfilled');
        const items = await hydrate([...accepted, ...serverIds]);
        if (!cancelled) setFavorites(items);
      } catch (e) {
        console.error('Failed to load favorites from server', e);
      }
    })();
    return () => { cancelled = true; };
  }, [useServer, user?.id]);

  // Đăng xuất: không giữ danh sách của tài khoản trên máy
  const wasServer = useRef(useServer);
  useEffect(() => {
    if (wasServer.current && !useServer) setFavorites([]);
    wasServer.current = useServer;
  }, [useServer]);

  // Check if an item is favorited
  const isFavorite = useCallback((productId) => {
    if (!productId) return false;
    const targetId = String(productId);
    return favorites.some(item => idOf(item) === targetId);
  }, [favorites]);

  const toLocalItem = (productOrId, productId) => {
    if (typeof productOrId === 'object' && productOrId.name) {
      return { ...productOrId, id: productId, product_id: productId };
    }
    const found = PRODUCTS_CATALOG.find(p => String(p.id) === String(productId));
    if (found) return { ...found, product_id: found.id };
    return { id: productId, product_id: productId, name: `Sản phẩm #${productId}`, price: 0, image: '', rating: 5.0, soldCount: 0 };
  };

  // Toggle favorite: cập nhật ngay (optimistic), đồng bộ server khi đã đăng nhập, lỗi thì hoàn tác
  const toggleFavorite = useCallback((productOrId) => {
    if (!productOrId) return false;

    const productId = typeof productOrId === 'object'
      ? productOrId.id || productOrId.product_id
      : productOrId;
    const targetId = String(productId);
    const exists = favoritesRef.current.some(item => idOf(item) === targetId);
    const previous = favoritesRef.current;

    setFavorites(prev => (exists
      ? prev.filter(item => idOf(item) !== targetId)
      : [toLocalItem(productOrId, productId), ...prev]));

    if (useServer) {
      const call = exists ? serverFavorites.remove(productId) : serverFavorites.add(productId);
      call.catch((e) => {
        console.error('Failed to sync favorite', e);
        setFavorites(previous);
      });
    }
    return !exists;
  }, [useServer]);

  // Remove specific item from favorites
  const removeFavorite = useCallback((productId) => {
    const targetId = String(productId);
    const previous = favoritesRef.current;
    setFavorites(prev => prev.filter(item => idOf(item) !== targetId));
    if (useServer) {
      serverFavorites.remove(productId).catch((e) => {
        console.error('Failed to remove favorite', e);
        setFavorites(previous);
      });
    }
  }, [useServer]);

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
