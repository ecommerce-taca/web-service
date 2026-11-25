import { useContext } from 'react';
import { CartContext } from '../contexts/CartContext';

const DEFAULT_CART_VALUE = {
  cartId: null,
  items: [],
  loading: false,
  error: null,
  cartCount: 0,
  selectedIds: [],
  selectedItems: [],
  selectedSubtotal: 0,
  addToCart: async () => false,
  updateQuantity: () => {},
  removeFromCart: async () => {},
  clearCart: () => {},
  refreshCart: async () => {},
  clearError: () => {},
  toggleSelectItem: () => {},
  selectAll: () => {},
  deselectAll: () => {},
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    return DEFAULT_CART_VALUE;
  }
  return context;
};

export default useCart;
