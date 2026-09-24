import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { Cart, CartItem, Coupon } from '../types/index.ts';
import { api } from '../services/api.ts';
import { useAuth } from './AuthContext.tsx';
import { useToast } from './ToastContext.tsx';

interface AppliedCoupon {
  code: string;
  discount: number;
  discountType: string;
  discountValue: number;
}

interface CartContextType {
  cart: Cart | null;
  items: CartItem[];
  cartCount: number;
  subtotal: number;
  deliveryFee: number;
  tax: number;
  discount: number;
  total: number;
  appliedCoupon: AppliedCoupon | null;
  isCartOpen: boolean;
  loading: boolean;
  openCart: () => void;
  closeCart: () => void;
  addToCart: (foodId: string, quantity?: number) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  applyCoupon: (code: string) => Promise<boolean>;
  removeCoupon: () => void;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, openAuthModal } = useAuth();
  const { showToast } = useToast();
  const [cart, setCart] = useState<Cart | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);

  const refreshCart = async () => {
    if (!user) {
      setCart(null);
      return;
    }
    try {
      setLoading(true);
      const res = await api.getCart();
      setCart(res.cart);
    } catch (err) {
      console.error('Failed to load cart:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      refreshCart();
    } else {
      setCart(null);
      setAppliedCoupon(null);
    }
  }, [user]);

  const items = cart?.items || [];

  const cartCount = useMemo(() => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  }, [items]);

  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => sum + item.food.price * item.quantity, 0);
  }, [items]);

  // Delivery fee: ₹40, or free if >= 500
  const deliveryFee = useMemo(() => {
    if (subtotal === 0) return 0;
    return subtotal >= 500 ? 0 : 40;
  }, [subtotal]);

  // 5% GST Restaurant Tax
  const tax = useMemo(() => {
    return Math.round(subtotal * 0.05);
  }, [subtotal]);

  // Discount
  const discount = useMemo(() => {
    if (!appliedCoupon || subtotal === 0) return 0;
    let disc = 0;
    if (appliedCoupon.discountType === 'PERCENTAGE') {
      disc = (subtotal * appliedCoupon.discountValue) / 100;
    } else {
      disc = appliedCoupon.discountValue;
    }
    return Math.round(Math.min(disc, subtotal));
  }, [appliedCoupon, subtotal]);

  // Final Total
  const total = useMemo(() => {
    if (subtotal === 0) return 0;
    return Math.max(0, Math.round(subtotal + deliveryFee + tax - discount));
  }, [subtotal, deliveryFee, tax, discount]);

  const addToCart = async (foodId: string, quantity = 1) => {
    if (!user) {
      openAuthModal('login');
      showToast('Please log in to add items to your cart', 'info');
      return;
    }

    try {
      const res = await api.addToCart(foodId, quantity);
      setCart(res.cart);
      showToast(res.message || 'Added to cart!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to add item', 'error');
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (!user) return;
    try {
      const res = await api.updateCartItemQuantity(itemId, quantity);
      setCart(res.cart);
    } catch (err: any) {
      showToast(err.message || 'Failed to update quantity', 'error');
    }
  };

  const removeFromCart = async (itemId: string) => {
    if (!user) return;
    try {
      const res = await api.removeCartItem(itemId);
      setCart(res.cart);
      showToast('Item removed from cart', 'info');
    } catch (err: any) {
      showToast(err.message || 'Failed to remove item', 'error');
    }
  };

  const clearCart = async () => {
    if (!user) return;
    try {
      const res = await api.clearCart();
      setCart(res.cart);
      setAppliedCoupon(null);
    } catch (err: any) {
      showToast(err.message || 'Failed to clear cart', 'error');
    }
  };

  const applyCoupon = async (code: string): Promise<boolean> => {
    if (subtotal === 0) {
      showToast('Add items to cart before applying coupon', 'error');
      return false;
    }

    try {
      const res = await api.validateCoupon(code, subtotal);
      if (res.valid) {
        setAppliedCoupon({
          code: res.coupon.code,
          discount: res.discount,
          discountType: res.coupon.discountType,
          discountValue: res.coupon.discountValue,
        });
        showToast(res.message, 'success');
        return true;
      }
      return false;
    } catch (err: any) {
      showToast(err.message || 'Invalid coupon', 'error');
      return false;
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    showToast('Coupon removed', 'info');
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        items,
        cartCount,
        subtotal,
        deliveryFee,
        tax,
        discount,
        total,
        appliedCoupon,
        isCartOpen,
        loading,
        openCart: () => setIsCartOpen(true),
        closeCart: () => setIsCartOpen(false),
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        applyCoupon,
        removeCoupon,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};
