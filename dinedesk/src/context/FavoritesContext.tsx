import React, { createContext, useContext, useState, useEffect } from 'react';
import { Food } from '../types/index.ts';
import { api } from '../services/api.ts';
import { useAuth } from './AuthContext.tsx';
import { useToast } from './ToastContext.tsx';

interface FavoritesContextType {
  favorites: Food[];
  favoriteIds: Set<string>;
  loading: boolean;
  toggleFavorite: (food: Food) => Promise<void>;
  isFavorite: (foodId: string) => boolean;
  refreshFavorites: () => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, openAuthModal } = useAuth();
  const { showToast } = useToast();
  const [favorites, setFavorites] = useState<Food[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  const refreshFavorites = async () => {
    if (!user) {
      setFavorites([]);
      setFavoriteIds(new Set());
      return;
    }
    try {
      setLoading(true);
      const res = await api.getFavorites();
      setFavorites(res.favorites);
      setFavoriteIds(new Set(res.favoriteFoodIds));
    } catch (err) {
      console.error('Failed to load favorites:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      refreshFavorites();
    } else {
      setFavorites([]);
      setFavoriteIds(new Set());
    }
  }, [user]);

  const isFavorite = (foodId: string) => {
    return favoriteIds.has(foodId);
  };

  const toggleFavorite = async (food: Food) => {
    if (!user) {
      openAuthModal('login');
      showToast('Please log in to save favorites', 'info');
      return;
    }

    const wasFav = favoriteIds.has(food.id);

    // Optimistic UI update
    setFavoriteIds((prev) => {
      const next = new Set(prev);
      if (wasFav) {
        next.delete(food.id);
      } else {
        next.add(food.id);
      }
      return next;
    });

    if (wasFav) {
      setFavorites((prev) => prev.filter((f) => f.id !== food.id));
    } else {
      setFavorites((prev) => [food, ...prev]);
    }

    try {
      const res = await api.toggleFavorite(food.id);
      showToast(res.message, res.isFavorite ? 'success' : 'info');
    } catch (err: any) {
      // Rollback
      refreshFavorites();
      showToast(err.message || 'Failed to update favorite', 'error');
    }
  };

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        favoriteIds,
        loading,
        toggleFavorite,
        isFavorite,
        refreshFavorites,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within FavoritesProvider');
  }
  return context;
};
