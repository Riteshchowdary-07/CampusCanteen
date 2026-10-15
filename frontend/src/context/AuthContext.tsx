import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole = 'STUDENT' | 'STAFF' | 'CANTEEN_ADMIN';

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: UserRole;
  status: string;
}

export interface CartItem {
  menuItem: any;
  quantity: number;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  role: UserRole | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  cart: CartItem[];
  addToCart: (item: any) => void;
  removeFromCart: (itemId: number) => void;
  updateCartQuantity: (itemId: number, qty: number) => void;
  clearCart: () => void;
  cartTotal: number;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('smart_canteen_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('smart_canteen_token') || null;
  });
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('smart_canteen_cart');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('smart_canteen_cart', JSON.stringify(cart));
  }, [cart]);

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('smart_canteen_token', newToken);
    localStorage.setItem('smart_canteen_user', JSON.stringify(newUser));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setCart([]);
    localStorage.removeItem('smart_canteen_token');
    localStorage.removeItem('smart_canteen_user');
    localStorage.removeItem('smart_canteen_cart');
    window.location.href = '/';
  };

  const addToCart = (item: any) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.menuItem.id === item.id);
      if (existing) {
        return prev.map((c) =>
          c.menuItem.id === item.id ? { ...c, quantity: c.quantity + 1 } : c
        );
      }
      return [...prev, { menuItem: item, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId: number) => {
    setCart((prev) => prev.filter((c) => c.menuItem.id !== itemId));
  };

  const updateCartQuantity = (itemId: number, qty: number) => {
    if (qty <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCart((prev) =>
      prev.map((c) => (c.menuItem.id === itemId ? { ...c, quantity: qty } : c))
    );
  };

  const clearCart = () => setCart([]);

  const cartTotal = cart.reduce(
    (sum, c) => sum + c.menuItem.price * c.quantity,
    0
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role: user?.role || null,
        login,
        logout,
        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        cartTotal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
