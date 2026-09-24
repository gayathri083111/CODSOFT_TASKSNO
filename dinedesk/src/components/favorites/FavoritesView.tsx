import React from 'react';
import { Heart, ShoppingBag } from 'lucide-react';
import { useFavorites } from '../../context/FavoritesContext.tsx';
import { useAuth } from '../../context/AuthContext.tsx';
import { FoodCard } from '../menu/FoodCard.tsx';
import { Food } from '../../types/index.ts';

interface FavoritesViewProps {
  onSelectFood: (food: Food) => void;
  onNavigateMenu: () => void;
}

export const FavoritesView: React.FC<FavoritesViewProps> = ({
  onSelectFood,
  onNavigateMenu,
}) => {
  const { user, openAuthModal } = useAuth();
  const { favorites, loading } = useFavorites();

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="w-20 h-20 bg-rose-50 rounded-3xl flex items-center justify-center text-rose-500 mx-auto mb-4">
          <Heart className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-black text-stone-900 font-serif mb-2">
          Your Saved Delicacies
        </h2>
        <p className="text-stone-600 text-sm max-w-md mx-auto mb-6">
          Sign in to save your favorite dishes, biryanis, appetizers, and curries for quick
          one-click ordering.
        </p>
        <button
          onClick={() => openAuthModal('login')}
          className="py-3 px-8 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-amber-600/20 cursor-pointer"
        >
          Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="pb-8 border-b border-stone-200">
        <div className="flex items-center gap-2 text-amber-600 text-xs font-extrabold uppercase tracking-widest mb-1">
          <Heart className="w-4 h-4 fill-amber-600" />
          <span>Curated For You</span>
        </div>
        <h1 className="text-3xl font-black text-stone-900 font-serif tracking-tight">
          Favorite Dishes ({favorites.length})
        </h1>
        <p className="text-xs text-stone-600 mt-1">
          Your handpicked selection of aromatic biryanis, gravies, tandoori breads, and desserts.
        </p>
      </div>

      {loading ? (
        <div className="py-20 text-center text-xs text-stone-600 font-semibold animate-pulse">
          Loading your favorites...
        </div>
      ) : favorites.length === 0 ? (
        <div className="py-20 text-center">
          <div className="w-20 h-20 bg-rose-50 rounded-3xl flex items-center justify-center text-rose-400 mx-auto mb-4">
            <Heart className="w-10 h-10" />
          </div>
          <h3 className="font-bold text-stone-900 text-lg mb-1">No favorite dishes yet</h3>
          <p className="text-xs text-stone-600 max-w-sm mx-auto mb-6">
            Click the heart icon on any mouthwatering item in our menu to save it here for later!
          </p>
          <button
            onClick={onNavigateMenu}
            className="py-3 px-8 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-amber-600/20 cursor-pointer"
          >
            Explore Menu
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pt-8">
          {favorites.map((food) => (
            <FoodCard key={food.id} food={food} onSelect={onSelectFood} />
          ))}
        </div>
      )}
    </div>
  );
};
