import React, { useState } from 'react';
import { X, Star, Sparkles } from 'lucide-react';
import { OrderItem } from '../../types/index.ts';
import { api } from '../../services/api.ts';
import { useToast } from '../../context/ToastContext.tsx';
import { FoodImage } from '../common/FoodImage.tsx';
import { VegBadge } from '../common/VegBadge.tsx';

interface ReviewModalProps {
  item: OrderItem | null;
  orderId?: string;
  onClose: () => void;
  onReviewSubmitted?: () => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  item,
  orderId,
  onClose,
  onReviewSubmitted,
}) => {
  const { showToast } = useToast();
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!item) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await api.submitReview({
        foodId: item.foodId,
        orderId,
        rating,
        comment,
      });

      showToast(res.message || 'Thank you for your rating!', 'success');
      if (onReviewSubmitted) onReviewSubmitted();
      onClose();
    } catch (err: any) {
      showToast(err.message || 'Failed to submit review', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const ratingDescriptions: Record<number, string> = {
    1: 'Poor / Disappointed',
    2: 'Below Average',
    3: 'Average / Fair',
    4: 'Very Good & Tasty',
    5: 'Excellent! Highly Recommended',
  };

  const activeRating = hoverRating || rating;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/65 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-amber-600 to-orange-500 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-200" />
            <h3 className="font-bold text-base">Rate & Review Food</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Dish preview */}
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-stone-50 border border-stone-100">
            <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0">
              <FoodImage
                src={item.foodImage}
                alt={item.foodName}
                aspectRatio="square"
                foodType={item.foodType}
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <VegBadge type={item.foodType} showText={false} />
                <h4 className="font-bold text-xs text-stone-900">{item.foodName}</h4>
              </div>
              <p className="text-[11px] text-stone-600 mt-0.5">₹{item.price} per portion</p>
            </div>
          </div>

          {/* Star Selector */}
          <div className="text-center py-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-2">
              Your Star Rating
            </label>
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(null)}
                  className="p-1 text-stone-300 hover:scale-125 transition-transform cursor-pointer"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= activeRating
                        ? 'text-amber-500 fill-amber-500 drop-shadow-xs'
                        : 'text-stone-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="text-xs font-bold text-amber-700 mt-2">
              {ratingDescriptions[activeRating]}
            </p>
          </div>

          {/* Text Review */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
              Write Your Feedback (Optional)
            </label>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell others what you loved about the taste, seasoning, spices, and portion size..."
              className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:bg-white resize-none"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-amber-600/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
          >
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <span>Submit Review</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
