import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import { CartContext } from './CartContext';
import {
  cartApi,
  getStoredCartId,
  getStoredLocalCart,
  saveStoredLocalCart,
  saveItemMeta,
} from '../services/cart.api';
import { isMockMode } from '../../../../../../shared/utils/api-client';

const DEMO_MOCK_ITEMS = [
  {
    id: '1-IP16PM-256-NAT',
    itemId: '1-IP16PM-256-NAT',
    productId: '1',
    skuId: 'IP16PM-256-NAT',
    sku: 'IP16PM-256-NAT',
    shopId: 'shop-apple',
    name: 'iPhone 16 Pro Max 256GB',
    variant: 'Titan tự nhiên - SKU IP16PM-256-NAT',
    price: 29490000,
    lineTotal: 29490000,
    quantity: 1,
    available: true,
    availabilityStatus: 'AVAILABLE',
    image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=300&auto=format&fit=crop&q=80',
    shopName: 'Taca Apple Flagship Store',
  },
  {
    id: '2-SONY-XM5-BLK',
    itemId: '2-SONY-XM5-BLK',
    productId: '2',
    skuId: 'SONY-XM5-BLK',
    sku: 'SONY-XM5-BLK',
    shopId: 'shop-sony',
    name: 'Sony WH-1000XM5',
    variant: 'Đen - SKU SONY-XM5-BLK',
    price: 7490000,
    lineTotal: 7490000,
    quantity: 1,
    available: true,
    availabilityStatus: 'AVAILABLE',
    image: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=300&auto=format&fit=crop&q=80',
    shopName: 'Sony Official Store',
  },
];

const hasAccessToken = () =>
  typeof window !== 'undefined' && Boolean(localStorage.getItem('taca_access_token'));

const getInitialCart = () => {
  const stored = getStoredLocalCart();
  if (stored !== null) {
    return stored;
  }
  return isMockMode() ? DEMO_MOCK_ITEMS : [];
};

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(getInitialCart);
  const [cartId, setCartId] = useState(getStoredCartId);
  const [selectedIds, setSelectedIds] = useState(() =>
    getInitialCart()
      .filter((i) => i.available !== false)
      .map((i) => i.id)
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const debounceTimersRef = useRef({});
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    const timers = debounceTimersRef.current;
    return () => {
      isMountedRef.current = false;
      Object.values(timers).forEach((timerId) => clearTimeout(timerId));
    };
  }, []);

  const refreshCart = useCallback(async () => {
    if (isMockMode() || !hasAccessToken()) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await cartApi.getCart();
      if (!isMountedRef.current) return;
      const remoteItems = res?.data?.items || [];
      setCartId(res?.data?.cart_id || null);
      setItems(remoteItems);
      setSelectedIds((prev) => {
        const availableSet = new Set(
          remoteItems.filter((i) => i.available !== false).map((i) => i.id)
        );
        if (prev.length === 0) {
          return Array.from(availableSet);
        }
        return prev.filter((id) => availableSet.has(id));
      });
    } catch (err) {
      if (!isMountedRef.current) return;
      if (err?.status !== 401) {
        setError(err?.message || 'Không thể tải giỏ hàng từ hệ thống.');
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  // Đồng bộ giỏ hàng từ Backend khi khởi động (nếu đã đăng nhập) và lắng nghe sự kiện auth
  useEffect(() => {
    if (!isMockMode() && hasAccessToken()) {
      refreshCart();
    }

    const handleAuthLogin = () => {
      refreshCart();
    };

    const handleAuthLogout = () => {
      Object.values(debounceTimersRef.current).forEach((t) => clearTimeout(t));
      debounceTimersRef.current = {};
      setItems([]);
      setSelectedIds([]);
      setCartId(null);
      setError(null);
      cartApi.clearCart().catch(() => {});
    };

    window.addEventListener('auth:login', handleAuthLogin);
    window.addEventListener('auth:logout', handleAuthLogout);
    return () => {
      window.removeEventListener('auth:login', handleAuthLogin);
      window.removeEventListener('auth:logout', handleAuthLogout);
    };
  }, [refreshCart]);

  // Đồng bộ localStorage khi items thay đổi
  useEffect(() => {
    saveStoredLocalCart(items);
  }, [items]);

  // Giữ selectedIds chỉ chứa các item còn tồn tại và khả dụng
  useEffect(() => {
    const validIds = new Set(
      items.filter((i) => i.available !== false).map((i) => i.id)
    );
    setSelectedIds((prev) => {
      const next = prev.filter((id) => validIds.has(id));
      return next.length === prev.length ? prev : next;
    });
  }, [items]);

  const clearError = useCallback(() => setError(null), []);

  const addToCart = useCallback(async (product, quantity = 1, options = {}) => {
    const productId = String(product?.product_id || product?.productId || product?.id || '').trim();
    const skuId = String(options?.sku_id || product?.sku_id || options?.sku || product?.sku || '').trim();
    const qty = Math.max(1, Math.min(999, Math.trunc(Number(quantity) || 1)));

    if (!productId || !skuId) {
      setError('Không xác định được mã sản phẩm hoặc phân loại (SKU).');
      return false;
    }

    const variant =
      options?.variant ||
      product?.variant ||
      (options?.selectedAttributes && Object.values(options.selectedAttributes).filter(Boolean).join(' · ')) ||
      (skuId ? `SKU: ${skuId}` : 'Tiêu chuẩn');
    const unitPrice = Number(product?.price ?? 0);
    const image = product?.image || (Array.isArray(product?.images) ? product.images[0] : '') || '';
    const shopName = product?.shop?.name || product?.shopName || '';
    const shopId = String(product?.shop?.id || product?.shop_id || product?.shopId || '');

    saveItemMeta(skuId, { image, shopName });
    setError(null);

    if (!isMockMode() && hasAccessToken()) {
      try {
        const res = await cartApi.addItem({
          product_id: productId,
          sku_id: skuId,
          quantity: qty,
          price: unitPrice,
        });

        const data = res?.data || {};
        const realItemId = String(data.item_id || `${productId}-${skuId}`);
        const realCartId = data.cart_id || null;
        const realQty = Number(data.quantity) || qty;
        const realLineTotal = Number(data.line_total ?? unitPrice * realQty);

        if (realCartId) {
          setCartId(realCartId);
        }

        setItems((prevItems) => {
          const existingIndex = prevItems.findIndex(
            (i) => i.id === realItemId || i.skuId === skuId
          );
          if (existingIndex > -1) {
            const next = [...prevItems];
            const existing = next[existingIndex];
            next[existingIndex] = {
              ...existing,
              id: realItemId,
              itemId: realItemId,
              quantity: realQty,
              lineTotal: realLineTotal,
              price: realQty > 0 ? Math.round(realLineTotal / realQty) : existing.price,
              available: true,
              availabilityStatus: 'AVAILABLE',
            };
            return next;
          }

          return [
            ...prevItems,
            {
              id: realItemId,
              itemId: realItemId,
              productId,
              skuId,
              sku: skuId,
              shopId,
              name: product?.name || product?.title || 'Sản phẩm',
              variant,
              price: realQty > 0 ? Math.round(realLineTotal / realQty) : unitPrice,
              lineTotal: realLineTotal,
              quantity: realQty,
              available: true,
              availabilityStatus: 'AVAILABLE',
              image,
              shopName,
            },
          ];
        });

        setSelectedIds((prev) => (prev.includes(realItemId) ? prev : [...prev, realItemId]));
        return true;
      } catch (err) {
        setError(err?.message || 'Không thể thêm sản phẩm vào giỏ hàng.');
        if (err?.code === 'CART_VERSION_CONFLICT') {
          refreshCart();
        }
        return false;
      }
    }

    // Guest / Mock mode local cart
    const localItemId = `${productId}-${skuId}`;
    setItems((prevItems) => {
      const existingIndex = prevItems.findIndex((i) => i.id === localItemId);
      if (existingIndex > -1) {
        const next = [...prevItems];
        const nextQty = Math.min(999, next[existingIndex].quantity + qty);
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: nextQty,
          lineTotal: next[existingIndex].price * nextQty,
        };
        return next;
      }

      if (prevItems.length >= 100) {
        setError('Giỏ hàng đã đạt giới hạn tối đa 100 sản phẩm.');
        return prevItems;
      }

      return [
        ...prevItems,
        {
          id: localItemId,
          itemId: localItemId,
          productId,
          skuId,
          sku: skuId,
          shopId,
          name: product?.name || product?.title || 'Sản phẩm',
          variant,
          price: unitPrice,
          lineTotal: unitPrice * qty,
          quantity: qty,
          available: true,
          availabilityStatus: 'AVAILABLE',
          image,
          shopName,
        },
      ];
    });

    setSelectedIds((prev) => (prev.includes(localItemId) ? prev : [...prev, localItemId]));
    return true;
  }, [refreshCart]);

  const removeFromCart = useCallback(async (itemId) => {
    if (debounceTimersRef.current[itemId]) {
      clearTimeout(debounceTimersRef.current[itemId]);
      delete debounceTimersRef.current[itemId];
    }

    setError(null);
    setItems((prev) => prev.filter((i) => i.id !== itemId));

    if (!isMockMode() && hasAccessToken()) {
      try {
        await cartApi.removeItem(itemId);
      } catch (err) {
        if (err?.code !== 'CART_ITEM_NOT_FOUND') {
          setError(err?.message || 'Không thể xóa sản phẩm khỏi giỏ hàng.');
          refreshCart();
        }
      }
    }
  }, [refreshCart]);

  const updateQuantity = useCallback((itemId, newQuantity) => {
    const targetQty = Math.trunc(Number(newQuantity));
    if (targetQty < 1) {
      removeFromCart(itemId);
      return;
    }

    const clampedQty = Math.min(999, targetQty);
    setError(null);

    const currentItem = items.find((i) => i.id === itemId);
    const shouldRehydrateAfterUpdate =
      currentItem && currentItem.availabilityStatus && currentItem.availabilityStatus !== 'AVAILABLE';

    setItems((prev) =>
      prev.map((i) =>
        i.id === itemId
          ? { ...i, quantity: clampedQty, lineTotal: i.price * clampedQty }
          : i
      )
    );

    if (!isMockMode() && hasAccessToken()) {
      if (debounceTimersRef.current[itemId]) {
        clearTimeout(debounceTimersRef.current[itemId]);
      }

      debounceTimersRef.current[itemId] = setTimeout(async () => {
        delete debounceTimersRef.current[itemId];
        try {
          const res = await cartApi.updateItemQuantity(itemId, clampedQty);
          const data = res?.data;
          if (isMountedRef.current && data && typeof data.quantity === 'number') {
            if (shouldRehydrateAfterUpdate) {
              refreshCart();
              return;
            }
            setItems((prev) =>
              prev.map((i) =>
                i.id === itemId
                  ? {
                      ...i,
                      quantity: data.quantity,
                      lineTotal: Number(data.line_total ?? i.price * data.quantity),
                    }
                  : i
              )
            );
          }
        } catch (err) {
          if (!isMountedRef.current) return;
          setError(err?.message || 'Không thể cập nhật số lượng sản phẩm.');
          refreshCart();
        }
      }, 350);
    }
  }, [items, removeFromCart, refreshCart]);

  const clearCart = useCallback(() => {
    Object.values(debounceTimersRef.current).forEach((t) => clearTimeout(t));
    debounceTimersRef.current = {};
    setItems([]);
    setSelectedIds([]);
    setCartId(null);
    setError(null);
    cartApi.clearCart().catch(() => {});
  }, []);

  const toggleSelectItem = useCallback((itemId) => {
    setSelectedIds((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
    );
  }, []);

  const selectAll = useCallback(() => {
    setSelectedIds(items.filter((i) => i.available !== false).map((i) => i.id));
  }, [items]);

  const deselectAll = useCallback(() => {
    setSelectedIds([]);
  }, []);

  const cartCount = useMemo(() => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  }, [items]);

  const selectedItems = useMemo(() => {
    return items.filter((item) => selectedIds.includes(item.id) && item.available !== false);
  }, [items, selectedIds]);

  const selectedSubtotal = useMemo(() => {
    return selectedItems.reduce(
      (sum, item) => sum + (Number(item.lineTotal) || item.price * item.quantity),
      0
    );
  }, [selectedItems]);

  const value = useMemo(() => ({
    cartId,
    items,
    loading,
    error,
    cartCount,
    selectedIds,
    selectedItems,
    selectedSubtotal,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    refreshCart,
    clearError,
    toggleSelectItem,
    selectAll,
    deselectAll,
  }), [
    cartId,
    items,
    loading,
    error,
    cartCount,
    selectedIds,
    selectedItems,
    selectedSubtotal,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    refreshCart,
    clearError,
    toggleSelectItem,
    selectAll,
    deselectAll,
  ]);

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

CartProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default CartProvider;
