import React, { useState, useEffect } from 'react';
import { X, Star, Clock, Heart, Minus, Plus, ShoppingBag, MessageSquare, CheckCircle2 } from 'lucide-react';
import { Food, Review } from '../../types/index.ts';
import { VegBadge } from '../common/VegBadge.tsx';
import { FoodImage } from '../common/FoodImage.tsx';
import { useFavorites } from '../../context/FavoritesContext.tsx';
import { useCart } from '../../context/CartContext.tsx';
import { api } from '../../services/api.ts';

interface FoodDetailModalProps {
  food: Food | null;
  onClose: () => void;
}

export const FoodDetailModal: React.FC<FoodDetailModalProps> = ({ food, onClose }) => {
  const { isFavorite, toggleFavorite } = useFavorites();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);

  useEffect(() => {
    if (food) {
      setQuantity(1);
      setLoadingReviews(true);
      api
        .getFoodReviews(food.id)
        .then((res) => setReviews(res.reviews))
        .catch(() => setReviews([]))
        .finally(() => setLoadingReviews(false));
    }
  }, [food]);

  if (!food) return null;

  const fav = isFavorite(food.id);

  const handleAddToCart = () => {
    addToCart(food.id, quantity);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs animate-in fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-stone-700 hover:text-stone-950 flex items-center justify-center shadow-md transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Large Food Image */}
        <div className="relative w-full h-64 sm:h-76 overflow-hidden">
          <FoodImage
            src={food.imageUrl}
            alt={food.name}
            aspectRatio="auto"
            foodType={food.foodType}
            className="w-full h-full object-cover"
          />

          {/* Type Badge */}
          <div className="absolute top-4 left-4 z-10">
            <VegBadge type={food.foodType} className="bg-white/95 backdrop-blur-xs px-3 py-1 shadow-sm" />
          </div>

          {/* Prep time */}
          <div className="absolute bottom-4 left-4 z-10 px-3 py-1.5 rounded-lg bg-stone-950/80 backdrop-blur-xs text-white text-xs font-semibold flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Preparation time: {food.preparationTime}</span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8">
          {/* Header Row: Title & Price */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-stone-100">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-600">
                  {food.category?.name || 'Cuisine Special'}
                </span>
                {food.featured && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-extrabold uppercase">
                    Bestseller
                  </span>
                )}
              </div>
              <h2 className="text-2xl font-black text-stone-900 tracking-tight font-serif">
                {food.name}
              </h2>
            </div>

            <div className="flex items-center sm:flex-col sm:items-end gap-2">
              <span className="text-2xl font-black text-stone-900">₹{food.price}</span>
              <div className="flex items-center gap-1 bg-amber-50 border border-amber-200/60 px-2 py-0.5 rounded-lg text-xs font-bold text-amber-900">
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span>{food.rating.toFixed(1)}</span>
                <span className="text-stone-600 font-normal">({food.reviewCount} reviews)</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="py-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
              Description
            </h4>
            <p className="text-sm text-stone-600 leading-relaxed">{food.description}</p>
          </div>

          {/* Availability */}
          <div className="flex items-center gap-2 text-xs font-semibold py-2">
            <span className="text-stone-600">Status:</span>
            {food.available ? (
              <span className="flex items-center gap-1 text-emerald-600 font-bold">
                <CheckCircle2 className="w-4 h-4" /> In Stock & Freshly Prepared
              </span>
            ) : (
              <span className="text-rose-600 font-bold">Currently Sold Out</span>
            )}
          </div>

          {/* Action Row: Quantity & Add to Cart */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-stone-100">
            {/* Quantity Stepper */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-stone-600 uppercase">Quantity:</span>
              <div className="flex items-center border border-stone-200 rounded-xl overflow-hidden bg-stone-50">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="p-2 hover:bg-stone-200 text-stone-700 transition-colors"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-8 text-center text-sm font-extrabold text-stone-900">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="p-2 hover:bg-stone-200 text-stone-700 transition-colors"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => toggleFavorite(food)}
                className={`p-3 rounded-xl border transition-all ${
                  fav
                    ? 'border-rose-300 bg-rose-50 text-rose-600'
                    : 'border-stone-200 hover:bg-stone-50 text-stone-600 hover:text-rose-600'
                }`}
                aria-label={fav ? 'Remove from favorites' : 'Add to favorites'}
              >
                <Heart className={`w-5 h-5 ${fav ? 'fill-rose-600' : ''}`} />
              </button>

              <button
                onClick={handleAddToCart}
                disabled={!food.available}
                className="px-6 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm shadow-md shadow-amber-600/20 transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Add {quantity} to Cart • ₹{food.price * quantity}</span>
              </button>
            </div>
          </div>

          {/* Customer Reviews Section */}
          <div className="mt-6 pt-6 border-t border-stone-100">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-600 flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-amber-500" />
                Customer Reviews ({reviews.length})
              </h4>
            </div>

            {loadingReviews ? (
              <div className="py-4 text-center text-xs text-stone-600">Loading reviews...</div>
            ) : reviews.length === 0 ? (
              <div className="py-4 text-center text-xs text-stone-600 italic">
                No reviews yet. Be the first to order and review this dish!
              </div>
            ) : (
              <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                {reviews.map((rev) => (
                  <div key={rev.id} className="p-3 rounded-xl bg-stone-50 border border-stone-100">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-stone-800">{rev.userName}</span>
                      <div className="flex items-center gap-0.5 text-amber-500">
                        {Array.from({ length: rev.rating }).map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-amber-500" />
                        ))}
                      </div>
                    </div>
                    {rev.comment && <p className="text-xs text-stone-600">{rev.comment}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
