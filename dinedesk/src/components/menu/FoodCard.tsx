import React from 'react';
import { Star, Clock, Heart, Plus, Minus, ShoppingBag } from 'lucide-react';
import { Food } from '../../types/index.ts';
import { VegBadge } from '../common/VegBadge.tsx';
import { FoodImage } from '../common/FoodImage.tsx';
import { useFavorites } from '../../context/FavoritesContext.tsx';
import { useCart } from '../../context/CartContext.tsx';

interface FoodCardProps {
  food: Food;
  onSelect: (food: Food) => void;
}

export const FoodCard: React.FC<FoodCardProps> = ({ food, onSelect }) => {
  const { isFavorite, toggleFavorite } = useFavorites();
  const { items, addToCart, updateQuantity } = useCart();

  const fav = isFavorite(food.id);

  // Check if item is in cart
  const cartItem = items.find((i) => i.foodId === food.id);

  return (
    <div className="group bg-white rounded-2xl border border-stone-200/80 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden hover:-translate-y-1">
      {/* Image & Badges Container */}
      <div className="relative cursor-pointer overflow-hidden" onClick={() => onSelect(food)}>
        <FoodImage
          src={food.imageUrl}
          alt={food.name}
          aspectRatio="wide"
          foodType={food.foodType}
          className="w-full"
        />

        {/* Veg / Non-Veg Badge */}
        <div className="absolute top-3 left-3 z-10">
          <VegBadge type={food.foodType} />
        </div>

        {/* Preparation Time Badge */}
        <div className="absolute bottom-3 left-3 z-10 px-2 py-1 rounded-md bg-stone-900/85 backdrop-blur-xs text-white text-[11px] font-semibold flex items-center gap-1">
          <Clock className="w-3 h-3 text-amber-400" />
          <span>{food.preparationTime}</span>
        </div>

        {/* Favorite Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(food);
          }}
          className={`absolute top-3 right-3 z-10 w-9 h-9 rounded-full flex items-center justify-center transition-all ${
            fav
              ? 'bg-rose-50 text-rose-600 shadow-md'
              : 'bg-white/90 text-stone-600 hover:text-rose-600 shadow-xs'
          }`}
          aria-label={fav ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart className={`w-4.5 h-4.5 ${fav ? 'fill-rose-600' : ''}`} />
        </button>
      </div>

      {/* Card Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2 mb-1">
            <h3
              onClick={() => onSelect(food)}
              className="font-bold text-base text-stone-900 group-hover:text-amber-600 transition-colors cursor-pointer line-clamp-1"
            >
              {food.name}
            </h3>
            {/* Rating */}
            <div className="flex items-center gap-1 bg-amber-50 px-1.5 py-0.5 rounded text-xs font-bold text-amber-800 shrink-0">
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>{food.rating.toFixed(1)}</span>
            </div>
          </div>

          <p
            onClick={() => onSelect(food)}
            className="text-xs text-stone-500 line-clamp-2 mb-3 cursor-pointer"
          >
            {food.description}
          </p>
        </div>

        {/* Bottom Price & Add Action */}
        <div className="flex items-center justify-between pt-2 border-t border-stone-100 mt-auto">
          <div className="flex flex-col">
            <span className="text-[10px] text-stone-600 uppercase font-semibold">Price</span>
            <span className="text-lg font-black text-stone-900 tracking-tight">
              ₹{food.price}
            </span>
          </div>

          {/* Cart Control */}
          {cartItem ? (
            <div className="flex items-center gap-2 bg-amber-600 text-white px-2 py-1.5 rounded-xl font-bold text-xs shadow-md shadow-amber-600/20">
              <button
                onClick={() => updateQuantity(cartItem.id, cartItem.quantity - 1)}
                className="p-1 hover:bg-amber-700 rounded-md transition-colors"
                aria-label="Decrease quantity"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-5 text-center font-extrabold">{cartItem.quantity}</span>
              <button
                onClick={() => updateQuantity(cartItem.id, cartItem.quantity + 1)}
                className="p-1 hover:bg-amber-700 rounded-md transition-colors"
                aria-label="Increase quantity"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => addToCart(food.id, 1)}
              disabled={!food.available}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                food.available
                  ? 'bg-amber-500 hover:bg-amber-600 text-stone-950 hover:text-white shadow-xs hover:shadow-md'
                  : 'bg-stone-200 text-stone-600 cursor-not-allowed'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>{food.available ? 'Add to Cart' : 'Unavailable'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
