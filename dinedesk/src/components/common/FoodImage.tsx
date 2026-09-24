import React, { useState } from 'react';
import { Utensils } from 'lucide-react';

interface FoodImageProps {
  src: string;
  alt: string;
  className?: string;
  aspectRatio?: 'square' | 'video' | 'wide' | 'auto';
  foodType?: 'VEG' | 'NON_VEG';
}

const FALLBACK_FOOD_IMG =
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80';

export const FoodImage: React.FC<FoodImageProps> = ({
  src,
  alt,
  className = '',
  aspectRatio = 'square',
  foodType,
}) => {
  const [imgSrc, setImgSrc] = useState(src || FALLBACK_FOOD_IMG);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const aspectClass =
    aspectRatio === 'square'
      ? 'aspect-square'
      : aspectRatio === 'video'
      ? 'aspect-video'
      : aspectRatio === 'wide'
      ? 'aspect-[16/10]'
      : '';

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setImgSrc(FALLBACK_FOOD_IMG);
      setIsLoading(false);
    }
  };

  return (
    <div className={`relative overflow-hidden bg-stone-100 ${aspectClass} ${className}`}>
      {/* Loading Skeleton */}
      {isLoading && (
        <div className="absolute inset-0 bg-stone-200 animate-pulse flex items-center justify-center">
          <Utensils className="w-6 h-6 text-stone-300 animate-bounce" />
        </div>
      )}

      {/* Main Image */}
      <img
        src={imgSrc}
        alt={alt || 'Food Dish'}
        loading="lazy"
        onLoad={() => setIsLoading(false)}
        onError={handleError}
        className={`w-full h-full object-cover transition-transform duration-500 hover:scale-105 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
      />

      {/* Subtle bottom shadow overlay for contrast */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
    </div>
  );
};
