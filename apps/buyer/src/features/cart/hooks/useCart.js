import { useContext } from 'react';
import { CartContext } from '../contexts/CartContext';

const DEFAULT_CART_VALUE = {
  items: [],
  cartCount: 0,
  selectedIds: [],
  selectedItems: [],
  selectedSubtotal: 0,
  addToCart: () => false,
  updateQuantity: () => {},
  removeFromCart: () => {},
  clearCart: () => {},
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
