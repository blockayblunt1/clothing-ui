'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';

interface CartItem {
  id: number;
  productId: number;
  productName: string;
  productDescription: string;
  price: number;
  productImage?: string;
  quantity: number;
  createdAt: string;
  updatedAt: string;
}

interface Cart {
  id: number;
  userId: number;
  createdAt: string;
  updatedAt: string;
  items: CartItem[];
}

interface CartContextType {
  cart: Cart | null;
  isLoading: boolean;
  fetchCart: () => Promise<void>;
  addToCart: (productId: number, quantity?: number) => Promise<boolean>;
  updateCartItem: (cartItemId: number, quantity: number) => Promise<boolean>;
  removeFromCart: (cartItemId: number) => Promise<boolean>;
  clearCart: () => Promise<boolean>;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  const { token, isAuthenticated } = useAuth();

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated || !token) return;

    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/Cart`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCart(data);
      } else {
        console.error('Failed to fetch cart:', response.status);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setIsLoading(false);
      setHasInitialized(true);
    }
  }, [isAuthenticated, token]);

  const addToCart = async (productId: number, quantity: number = 1): Promise<boolean> => {
    if (!isAuthenticated || !token) return false;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/Cart/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ productId, quantity }),
      });

      if (response.ok) {
        const data = await response.json();
        setCart(data);
        return true;
      } else {
        console.error('Failed to add to cart:', response.status);
        return false;
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      return false;
    }
  };

  const updateCartItem = async (cartItemId: number, quantity: number): Promise<boolean> => {
    if (!isAuthenticated || !token) return false;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/Cart/items/${cartItemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ quantity }),
      });

      if (response.ok) {
        const data = await response.json();
        setCart(data);
        return true;
      } else {
        console.error('Failed to update cart item:', response.status);
        return false;
      }
    } catch (error) {
      console.error('Error updating cart item:', error);
      return false;
    }
  };

  const removeFromCart = async (cartItemId: number): Promise<boolean> => {
    if (!isAuthenticated || !token) return false;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/Cart/items/${cartItemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCart(data);
        return true;
      } else {
        console.error('Failed to remove from cart:', response.status);
        return false;
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
      return false;
    }
  };

  const clearCart = async (): Promise<boolean> => {
    if (!isAuthenticated || !token) return false;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/Cart/clear`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCart(data);
        return true;
      } else {
        console.error('Failed to clear cart:', response.status);
        return false;
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
      return false;
    }
  };

  const getTotalItems = (): number => {
    if (!cart) return 0;
    return cart.items.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = (): number => {
    if (!cart) return 0;
    return cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  // Fetch cart when user authenticates
  useEffect(() => {
    if (isAuthenticated && token && !hasInitialized) {
      fetchCart();
    } else if (!isAuthenticated) {
      setCart(null);
      setHasInitialized(false);
    }
  }, [isAuthenticated, token, hasInitialized, fetchCart]);

  const value: CartContextType = {
    cart,
    isLoading,
    fetchCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    getTotalItems,
    getTotalPrice,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};