import { useState, useEffect, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { CartContext } from './CartContext';

const STORAGE_KEY = 'taca_cart_items';

const getInitialCart = () => {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Failed to parse cart items from localStorage', e);
  }
  // Default demo items if completely empty
  return [
    {
      id: '1-IP16PM-256-NAT',
      productId: 1,
      name: 'iPhone 16 Pro Max 256GB',
      variant: 'Titan tự nhiên - SKU IP16PM-256-NAT',
      sku: 'IP16PM-256-NAT',
      price: 29490000,
      originalPrice: 34990000,
      quantity: 1,
      image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=300&auto=format&fit=crop&q=80',
      shopName: 'Taca Apple Flagship Store'
    },
    {
      id: '2-SONY-XM5-BLK',
      productId: 2,
      name: 'Sony WH-1000XM5',
      variant: 'Đen - SKU SONY-XM5-BLK',
      sku: 'SONY-XM5-BLK',
      price: 7490000,
      originalPrice: 8490000,
      quantity: 1,
      image: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=300&auto=format&fit=crop&q=80',
      shopName: 'Sony Official Store'
    }
  ];
};

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(getInitialCart);
  const [selectedIds, setSelectedIds] = useState(() => items.map(i => i.id));

  // Sync to localStorage whenever items change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('Failed to save cart to localStorage', e);
    }
  }, [items]);

  // Keep selectedIds in sync if items are removed
  useEffect(() => {
    const existingIds = new Set(items.map(i => i.id));
    setSelectedIds(prev => prev.filter(id => existingIds.has(id)));
  }, [items]);

  const addToCart = useCallback((product, quantity = 1, options = {}) => {
    const sku = options.sku || product.sku || 'DEFAULT';
    const variant = options.variant || (options.sku ? `SKU: ${options.sku}` : 'Tiêu chuẩn');
    const itemId = `${product.id}-${sku}`;

    setItems(prevItems => {
      const existingIndex = prevItems.findIndex(i => i.id === itemId);
      if (existingIndex > -1) {
        const next = [...prevItems];
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: next[existingIndex].quantity + quantity
        };
        return next;
      }

      const newItem = {
        id: itemId,
        productId: product.id,
        name: product.name,
        variant,
        sku,
        price: product.price,
        originalPrice: product.originalPrice || product.price,
        quantity,
        image: product.image || (product.images && product.images[0]) || 'https://via.placeholder.com/150',
        shopName: product.shop?.name || 'Taca Store'
      };

      return [...prevItems, newItem];
    });

    // Auto select newly added item
    setSelectedIds(prev => (prev.includes(itemId) ? prev : [...prev, itemId]));
    return true;
  }, []);

  const updateQuantity = useCallback((itemId, newQuantity) => {
    if (newQuantity < 1) {
      setItems(prev => prev.filter(i => i.id !== itemId));
    } else {
      setItems(prev => prev.map(i => i.id === itemId ? { ...i, quantity: newQuantity } : i));
    }
  }, []);

  const removeFromCart = useCallback((itemId) => {
    setItems(prev => prev.filter(i => i.id !== itemId));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    setSelectedIds([]);
  }, []);

  const toggleSelectItem = useCallback((itemId) => {
    setSelectedIds(prev => 
      prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]
    );
  }, []);

  const selectAll = useCallback(() => {
    setSelectedIds(items.map(i => i.id));
  }, [items]);

  const deselectAll = useCallback(() => {
    setSelectedIds([]);
  }, []);

  const cartCount = useMemo(() => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  }, [items]);

  const selectedItems = useMemo(() => {
    return items.filter(item => selectedIds.includes(item.id));
  }, [items, selectedIds]);

  const selectedSubtotal = useMemo(() => {
    return selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [selectedItems]);

  const value = useMemo(() => ({
    items,
    cartCount,
    selectedIds,
    selectedItems,
    selectedSubtotal,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    toggleSelectItem,
    selectAll,
    deselectAll,
  }), [
    items,
    cartCount,
    selectedIds,
    selectedItems,
    selectedSubtotal,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    toggleSelectItem,
    selectAll,
    deselectAll
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
