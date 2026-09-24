import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  SlidersHorizontal,
  Star,
  RotateCcw,
  Sparkles,
  Utensils,
  ChevronDown,
} from 'lucide-react';
import { Food, Category, FoodType } from '../../types/index.ts';
import { api } from '../../services/api.ts';
import { FoodCard } from './FoodCard.tsx';

interface MenuViewProps {
  onSelectFood: (food: Food) => void;
  initialCategory?: string;
  initialFoodType?: string;
  initialSearch?: string;
}

export const MenuView: React.FC<MenuViewProps> = ({
  onSelectFood,
  initialCategory = 'ALL',
  initialFoodType = 'ALL',
  initialSearch = '',
}) => {
  const [foods, setFoods] = useState<Food[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [selectedType, setSelectedType] = useState<string>(initialFoodType);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [searchQuery, setSearchQuery] = useState<string>(initialSearch);
  const [sortBy, setSortBy] = useState<string>('FEATURED');
  const [priceFilter, setPriceFilter] = useState<number>(500);
  const [minRating, setMinRating] = useState<number>(0);

  // Load categories and all foods
  useEffect(() => {
    Promise.all([api.getCategories(), api.getFoods()])
      .then(([catRes, foodRes]) => {
        setCategories(catRes.categories);
        setFoods(foodRes.foods);
      })
      .catch((err) => {
        console.error('Failed to load menu:', err);
      })
      .finally(() => setLoading(false));
  }, []);

  // Update when initial props change
  useEffect(() => {
    if (initialCategory) setSelectedCategory(initialCategory);
  }, [initialCategory]);

  useEffect(() => {
    if (initialFoodType) setSelectedType(initialFoodType);
  }, [initialFoodType]);

  useEffect(() => {
    if (initialSearch !== undefined) setSearchQuery(initialSearch);
  }, [initialSearch]);

  // Client-side instant filter & sort
  const filteredFoods = useMemo(() => {
    let result = [...foods];

    // Veg / Non-Veg filter
    if (selectedType !== 'ALL') {
      result = result.filter((f) => f.foodType === selectedType);
    }

    // Category filter
    if (selectedCategory !== 'ALL') {
      result = result.filter((f) => f.categoryId === selectedCategory);
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (f) =>
          f.name.toLowerCase().includes(q) ||
          f.description.toLowerCase().includes(q) ||
          f.categoryId.toLowerCase().includes(q)
      );
    }

    // Max price
    if (priceFilter < 500) {
      result = result.filter((f) => f.price <= priceFilter);
    }

    // Min rating
    if (minRating > 0) {
      result = result.filter((f) => f.rating >= minRating);
    }

    // Sorting
    switch (sortBy) {
      case 'PRICE_ASC':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'PRICE_DESC':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'RATING':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'NAME':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default: // FEATURED
        result.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
        break;
    }

    return result;
  }, [foods, selectedType, selectedCategory, searchQuery, priceFilter, minRating, sortBy]);

  const resetFilters = () => {
    setSelectedType('ALL');
    setSelectedCategory('ALL');
    setSearchQuery('');
    setSortBy('FEATURED');
    setPriceFilter(500);
    setMinRating(0);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Page Title & Tagline */}
      <div className="pb-6 border-b border-stone-200">
        <div className="flex items-center gap-2 text-amber-600 text-xs font-extrabold uppercase tracking-widest mb-1">
          <Utensils className="w-4 h-4" />
          <span>Our Complete Culinary Menu</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-stone-900 font-serif tracking-tight">
          Explore Dishes & Specialties
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-2xl">
          Freshly cooked authentic Hyderabadi dum biryanis, sizzler starters, velvety gravies,
          piping-hot tandoori rotis, and delectable desserts.
        </p>
      </div>

      {/* Main Filter Section */}
      <div className="my-8 space-y-5 bg-stone-50/80 p-5 rounded-3xl border border-stone-200/90 shadow-2xs">
        {/* Row 1: Search + Veg/Non-Veg Toggle + Sort */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-600 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search dishes (e.g. Biryani, Paneer Butter Masala, Lollipop, Naan...)"
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-stone-200 rounded-2xl text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500 shadow-2xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-3 text-stone-600 hover:text-stone-600 text-xs"
              >
                Clear
              </button>
            )}
          </div>

          {/* VEG / NON-VEG Segmented Control */}
          <div className="flex items-center bg-stone-200/80 p-1 rounded-2xl shrink-0">
            <button
              onClick={() => setSelectedType('ALL')}
              className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedType === 'ALL'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              All Types
            </button>
            <button
              onClick={() => setSelectedType('VEG')}
              className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                selectedType === 'VEG'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-emerald-700 hover:bg-emerald-50'
              }`}
            >
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-300" />
              <span>Veg Only</span>
            </button>
            <button
              onClick={() => setSelectedType('NON_VEG')}
              className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                selectedType === 'NON_VEG'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-rose-700 hover:bg-rose-50'
              }`}
            >
              <div className="w-2.5 h-2.5 rounded-full bg-rose-300" />
              <span>Non-Veg Only</span>
            </button>
          </div>

          {/* Sort Dropdown */}
          <div className="relative shrink-0">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none w-full lg:w-48 px-4 py-2.5 bg-white border border-stone-200 rounded-2xl text-xs font-bold text-stone-800 pr-9 focus:ring-2 focus:ring-amber-500 shadow-2xs cursor-pointer"
            >
              <option value="FEATURED">⭐ Bestsellers First</option>
              <option value="RATING">⭐ Highest Rated</option>
              <option value="PRICE_ASC">💵 Price: Low to High</option>
              <option value="PRICE_DESC">💵 Price: High to Low</option>
              <option value="NAME">🔤 Name (A - Z)</option>
            </select>
            <ChevronDown className="w-4 h-4 text-stone-600 absolute right-3 top-3 pointer-events-none" />
          </div>
        </div>

        {/* Row 2: Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all shrink-0 ${
              selectedCategory === 'ALL'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
            }`}
          >
            All Categories ({foods.length})
          </button>
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all shrink-0 ${
                  isSelected
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
                }`}
              >
                {cat.name}
              </button>
            );
          })}
        </div>

        {/* Row 3: Secondary Quick Filters (Rating & Max Price) */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-stone-200/80 text-xs">
          <div className="flex flex-wrap items-center gap-4">
            {/* Rating Filter Pills */}
            <div className="flex items-center gap-1.5">
              <span className="text-stone-600 font-bold uppercase text-[10px]">Min Rating:</span>
              {[0, 4.5, 4.7].map((r) => (
                <button
                  key={r}
                  onClick={() => setMinRating(r)}
                  className={`px-2.5 py-1 rounded-lg font-bold text-[11px] flex items-center gap-1 transition-colors ${
                    minRating === r
                      ? 'bg-stone-900 text-white'
                      : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                  <span>{r === 0 ? 'Any' : `${r}+`}</span>
                </button>
              ))}
            </div>

            {/* Price Filter Pills */}
            <div className="flex items-center gap-1.5">
              <span className="text-stone-600 font-bold uppercase text-[10px]">Price:</span>
              {[500, 300, 200, 100].map((p) => (
                <button
                  key={p}
                  onClick={() => setPriceFilter(p)}
                  className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-colors ${
                    priceFilter === p
                      ? 'bg-stone-900 text-white'
                      : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  {p === 500 ? 'All' : `Under ₹${p}`}
                </button>
              ))}
            </div>
          </div>

          {/* Reset Filters */}
          <button
            onClick={resetFilters}
            className="flex items-center gap-1 text-xs font-bold text-stone-600 hover:text-amber-700 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Filters</span>
          </button>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-xs font-bold text-stone-600 uppercase tracking-wider">
          Showing <span className="text-stone-900 font-black">{filteredFoods.length}</span> dishes
        </p>
      </div>

      {/* Food Cards Grid */}
      {loading ? (
        <div className="py-24 text-center text-xs text-stone-600 font-semibold animate-pulse">
          Loading dishes from kitchen...
        </div>
      ) : filteredFoods.length === 0 ? (
        <div className="py-24 text-center bg-stone-50 rounded-3xl border border-stone-200/80 p-8">
          <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Search className="w-8 h-8" />
          </div>
          <h3 className="font-bold text-stone-900 text-base mb-1">No dishes match your filters</h3>
          <p className="text-xs text-stone-600 max-w-sm mx-auto mb-4">
            Try adjusting your search query, price limit, or category to find delicious dishes.
          </p>
          <button
            onClick={resetFilters}
            className="px-5 py-2.5 rounded-xl bg-amber-600 text-white text-xs font-bold shadow-xs hover:bg-amber-700 transition-colors cursor-pointer"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredFoods.map((food) => (
            <FoodCard key={food.id} food={food} onSelect={onSelectFood} />
          ))}
        </div>
      )}
    </div>
  );
};
