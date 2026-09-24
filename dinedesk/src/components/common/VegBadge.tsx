import React from 'react';
import { FoodType } from '../../types/index.ts';

interface VegBadgeProps {
  type: FoodType;
  showText?: boolean;
  className?: string;
}

export const VegBadge: React.FC<VegBadgeProps> = ({ type, showText = true, className = '' }) => {
  const isVeg = type === 'VEG';

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded border text-[11px] font-bold tracking-wider uppercase ${
        isVeg
          ? 'bg-emerald-50/90 text-emerald-700 border-emerald-500'
          : 'bg-rose-50/90 text-rose-700 border-rose-500'
      } ${className}`}
      title={isVeg ? 'Vegetarian dish' : 'Non-Vegetarian dish'}
    >
      {/* Standard Indian FSSAI Veg/Non-Veg icon: Square with centered dot or triangle */}
      <div
        className={`w-3.5 h-3.5 border flex items-center justify-center p-0.5 rounded-[3px] shrink-0 ${
          isVeg ? 'border-emerald-600' : 'border-rose-600'
        }`}
      >
        {isVeg ? (
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
        ) : (
          <div className="w-0 h-0 border-l-[3.5px] border-l-transparent border-r-[3.5px] border-r-transparent border-b-[5px] border-b-rose-600" />
        )}
      </div>

      {showText && <span>{isVeg ? 'VEG' : 'NON-VEG'}</span>}
    </div>
  );
};
