import React, { useState, useEffect } from 'react';
import {
  Search,
  ArrowRight,
  Flame,
  Star,
  Clock,
  ShieldCheck,
  Award,
  Sparkles,
  Heart,
  ChevronRight,
  ChefHat,
  Truck,
  CheckCircle,
} from 'lucide-react';
import { Food, Category } from '../../types/index.ts';
import { api } from '../../services/api.ts';
import { FoodCard } from '../menu/FoodCard.tsx';
import { FoodImage } from '../common/FoodImage.tsx';

interface HomeViewProps {
  onExploreMenu: (catId?: string, foodType?: string, search?: string) => void;
  onSelectFood: (food: Food) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onExploreMenu, onSelectFood }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [bestsellers, setBestsellers] = useState<Food[]>([]);
  const [todaysSpecials, setTodaysSpecials] = useState<Food[]>([]);
  const [heroSearch, setHeroSearch] = useState('');
  const [activeTypeTab, setActiveTypeTab] = useState<'ALL' | 'VEG' | 'NON_VEG'>('ALL');

  useEffect(() => {
    Promise.all([
      api.getCategories(),
      api.getFoods({ featured: true }),
      api.getFoods({ minRating: 4.8 }),
    ])
      .then(([catRes, bestRes, specRes]) => {
        setCategories(catRes.categories);
        setBestsellers(bestRes.foods.slice(0, 8));
        setTodaysSpecials(specRes.foods.slice(0, 4));
      })
      .catch((err) => {
        console.error('Failed to load home data:', err);
      });
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (heroSearch.trim()) {
      onExploreMenu(undefined, undefined, heroSearch.trim());
    } else {
      onExploreMenu();
    }
  };

  const quickSearchTags = [
    { label: 'Biryani', query: 'Biryani' },
    { label: 'Butter Chicken', query: 'Butter Chicken' },
    { label: 'Paneer Tikka', query: 'Paneer' },
    { label: 'Butter Naan', query: 'Naan' },
    { label: 'Chicken 65', query: 'Chicken 65' },
    { label: 'Desserts', query: 'Ice Cream' },
  ];

  const filteredBestsellers = bestsellers.filter((f) => {
    if (activeTypeTab === 'ALL') return true;
    return f.foodType === activeTypeTab;
  });

  return (
    <div className="space-y-16 sm:space-y-24 pb-20">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-stone-900 via-stone-900 to-stone-950 text-white pt-12 sm:pt-16 pb-20 lg:pb-28">
        {/* Ambient subtle glow background circles */}
        <div className="absolute top-10 left-1/4 w-96 h-96 bg-amber-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-orange-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold tracking-wider uppercase backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Premium Quality Restaurant Ordering</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black font-serif tracking-tight text-white leading-[1.15]">
                Delicious food.{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">
                  Delivered with ease.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-stone-300 max-w-2xl mx-auto lg:mx-0 font-normal leading-relaxed">
                Experience authentic royal dum biryanis, sizzling starters, rich butter gravies, and
                fluffy clay oven naans. Handcrafted with traditional spices and delivered blazing hot
                to your door.
              </p>

              {/* Search Bar */}
              <form
                onSubmit={handleSearchSubmit}
                className="max-w-xl mx-auto lg:mx-0 p-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl flex items-center gap-2 shadow-2xl"
              >
                <div className="relative flex-1">
                  <Search className="w-5 h-5 text-amber-300 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={heroSearch}
                    onChange={(e) => setHeroSearch(e.target.value)}
                    placeholder="Search for biryani, chicken, paneer, pizza..."
                    className="w-full pl-11 pr-3 py-2.5 bg-transparent text-white placeholder-stone-400 text-sm focus:outline-hidden"
                  />
                </div>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-stone-950 font-bold text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer"
                >
                  Search
                </button>
              </form>

              {/* Quick Search Tag Pills */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 pt-1 text-xs">
                <span className="text-stone-300 text-[11px] font-semibold">Popular:</span>
                {quickSearchTags.map((tag) => (
                  <button
                    key={tag.label}
                    onClick={() => onExploreMenu(undefined, undefined, tag.query)}
                    className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-stone-200 text-[11px] font-medium transition-colors cursor-pointer border border-white/10"
                  >
                    {tag.label}
                  </button>
                ))}
              </div>

              {/* Features line */}
              <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-stone-300">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-amber-400" />
                  <span>30-Min Fast Delivery</span>
                </div>
                <div className="flex items-center gap-2">
                  <ChefHat className="w-4 h-4 text-amber-400" />
                  <span>100% Fresh Daily Ingredients</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-amber-400" />
                  <span>Strict Veg & Non-Veg Segregation</span>
                </div>
              </div>
            </div>

            {/* Right Visual Image Card Grid */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md">
                {/* Main Hero Card */}
                <div className="relative rounded-3xl overflow-hidden shadow-2xl border-2 border-white/20 group">
                  <FoodImage
                    src="https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&auto=format&fit=crop&q=80"
                    alt="Royal Hyderabadi Biryani"
                    aspectRatio="square"
                    className="w-full"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500 text-stone-950 font-black text-[10px] uppercase tracking-wider mb-2 w-max">
                      <Flame className="w-3 h-3" />
                      Chef's Special
                    </div>
                    <h3 className="text-xl font-black text-white font-serif">
                      Royal Hyderabadi Chicken Dum Biryani
                    </h3>
                    <p className="text-xs text-stone-300 mt-1 line-clamp-2">
                      Slow-cooked basmati rice with whole spices, tender chicken cuts, saffron, and
                      fresh herbs.
                    </p>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/20">
                      <span className="text-xl font-black text-white">₹269</span>
                      <button
                        onClick={() => onExploreMenu('biryani')}
                        className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <span>Order Now</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Floating mini badge: Today's offer */}
                <div className="absolute -bottom-5 -left-5 bg-white text-stone-900 p-3.5 rounded-2xl shadow-xl border border-stone-100 flex items-center gap-3 animate-in slide-in-from-bottom-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-xs">
                    %
                  </div>
                  <div>
                    <p className="text-xs font-black">Get 10% OFF Today</p>
                    <p className="text-[10px] text-stone-500">Use code: DINEDESK10</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Popular Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between pb-6">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-amber-600">
              Handpicked Delights
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-stone-900 font-serif tracking-tight">
              Popular Categories
            </h2>
          </div>
          <button
            onClick={() => onExploreMenu()}
            className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 group cursor-pointer"
          >
            <span>View Full Menu</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories.map((cat) => (
            <div
              key={cat.id}
              onClick={() => onExploreMenu(cat.id)}
              className="group cursor-pointer bg-white rounded-2xl border border-stone-200/80 p-3 shadow-2xs hover:shadow-xl hover:border-amber-400 transition-all duration-300 flex flex-col items-center text-center"
            >
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden mb-3 shadow-inner group-hover:scale-105 transition-transform">
                <FoodImage
                  src={cat.imageUrl || ''}
                  alt={cat.name}
                  aspectRatio="square"
                  className="w-full h-full"
                />
              </div>
              <h3 className="font-bold text-xs sm:text-sm text-stone-900 group-hover:text-amber-600 transition-colors">
                {cat.name}
              </h3>
              <p className="text-[11px] text-stone-600 line-clamp-1 mt-0.5">{cat.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Best Sellers Section with Veg / Non-Veg Quick Switch */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-stone-200">
          <div>
            <div className="flex items-center gap-2 text-amber-600 text-xs font-extrabold uppercase tracking-widest mb-1">
              <Flame className="w-4 h-4 text-amber-600" />
              <span>Customer Top Choices</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-stone-900 font-serif tracking-tight">
              Best Sellers & Favorites
            </h2>
          </div>

          {/* Veg / Non-Veg Quick Switcher */}
          <div className="flex items-center bg-stone-100 p-1 rounded-xl shrink-0">
            <button
              onClick={() => setActiveTypeTab('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTypeTab === 'ALL'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              All Items
            </button>
            <button
              onClick={() => setActiveTypeTab('VEG')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTypeTab === 'VEG'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-emerald-700 hover:bg-emerald-50'
              }`}
            >
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Veg Only</span>
            </button>
            <button
              onClick={() => setActiveTypeTab('NON_VEG')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTypeTab === 'NON_VEG'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-rose-700 hover:bg-rose-50'
              }`}
            >
              <div className="w-2 h-2 rounded-full bg-rose-400" />
              <span>Non-Veg Only</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pt-6">
          {filteredBestsellers.map((food) => (
            <FoodCard key={food.id} food={food} onSelect={onSelectFood} />
          ))}
        </div>
      </section>

      {/* 4. Today's Specials Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-amber-600 to-orange-600 rounded-3xl p-8 sm:p-10 text-white shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-white/5 skew-x-12 pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <span className="px-3 py-1 rounded-md bg-white/20 text-xs font-black tracking-wider uppercase">
                Chef's Recommendations
              </span>
              <h2 className="text-3xl sm:text-4xl font-black font-serif tracking-tight">
                Specially Prepared For You Today
              </h2>
              <p className="text-amber-100 text-sm leading-relaxed max-w-xl">
                Our master chefs recommend these signature specialties slow-cooked with freshly
                ground spices, aged basmati rice, and authentic clay oven baking.
              </p>
              <button
                onClick={() => onExploreMenu()}
                className="py-3 px-6 rounded-xl bg-white text-stone-900 font-bold text-xs uppercase tracking-wider hover:bg-stone-100 transition-colors shadow-md cursor-pointer"
              >
                Browse All Specials
              </button>
            </div>

            <div className="lg:col-span-5 grid grid-cols-2 gap-3">
              {todaysSpecials.slice(0, 2).map((item) => (
                <div
                  key={item.id}
                  onClick={() => onSelectFood(item)}
                  className="bg-stone-900/40 backdrop-blur-md rounded-2xl p-3 border border-white/20 cursor-pointer hover:bg-stone-900/60 transition-colors"
                >
                  <div className="h-28 rounded-xl overflow-hidden mb-2">
                    <FoodImage
                      src={item.imageUrl}
                      alt={item.name}
                      aspectRatio="video"
                      className="w-full h-full"
                    />
                  </div>
                  <h4 className="font-bold text-xs text-white truncate">{item.name}</h4>
                  <div className="flex items-center justify-between mt-1">
                    <span className="font-extrabold text-amber-300 text-xs">₹{item.price}</span>
                    <span className="text-[10px] text-stone-300">★ {item.rating}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 5. Why Choose DineDesk */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto pb-12">
          <span className="text-xs font-extrabold uppercase tracking-wider text-amber-600">
            Our Standards
          </span>
          <h2 className="text-3xl font-black text-stone-900 font-serif tracking-tight mt-1">
            Why Food Lovers Choose DineDesk
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 mt-2">
            We are committed to exceptional culinary taste, uncompromised kitchen hygiene, and
            rapid thermal packaging.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: Clock,
              title: '30-Minute Delivery',
              desc: 'Hot, fresh food rushed directly from our kitchen to your dining table.',
            },
            {
              icon: Award,
              title: 'Master Chefs',
              desc: 'Authentic culinary masters trained in royal Hyderabadi & Mughlai recipes.',
            },
            {
              icon: ShieldCheck,
              title: 'Strict Veg & Non-Veg',
              desc: 'Separate preparation areas, utensils, and fryers for 100% pure vegetarian dishes.',
            },
            {
              icon: Sparkles,
              title: 'Quality Packaging',
              desc: 'Leak-proof, thermal insulated, and tamper-evident packaging keeping food steaming hot.',
            },
          ].map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-3xl bg-white border border-stone-200/80 shadow-2xs hover:shadow-lg transition-shadow text-center flex flex-col items-center"
              >
                <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
                  <Icon className="w-7 h-7" />
                </div>
                <h3 className="font-bold text-base text-stone-900 mb-1">{feature.title}</h3>
                <p className="text-xs text-stone-600 leading-relaxed">{feature.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 6. Customer Reviews & Ratings */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto pb-10">
          <span className="text-xs font-extrabold uppercase tracking-wider text-amber-600">
            Real Feedback
          </span>
          <h2 className="text-3xl font-black text-stone-900 font-serif tracking-tight mt-1">
            Loved By Thousands of Foodies
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              name: 'Priya Sharma',
              dish: 'Chicken Dum Biryani & Butter Naan',
              comment:
                'The aroma of saffron and genuine spices hit as soon as I opened the container. Tender meat that melted off the bone! Best biryani in town.',
              stars: 5,
            },
            {
              name: 'Rahul Verma',
              dish: 'Paneer Butter Masala & Garlic Naan',
              comment:
                'Creamy, buttery, and rich without being overwhelming. The paneer was super soft and fresh. Live order tracking gave accurate 25-minute ETA!',
              stars: 5,
            },
            {
              name: 'Ananya Reddy',
              dish: 'Chicken 65 & Peri Peri Fries',
              comment:
                'Super crispy, spicy, and packed with authentic curry leaf flavor. The coupon saved me ₹100 on checkout. Will definitely order every weekend!',
              stars: 5,
            },
          ].map((t, idx) => (
            <div
              key={idx}
              className="p-6 rounded-3xl bg-stone-50 border border-stone-200/80 space-y-3"
            >
              <div className="flex items-center gap-1 text-amber-500">
                {Array.from({ length: t.stars }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-500" />
                ))}
              </div>
              <p className="text-xs sm:text-sm text-stone-700 leading-relaxed italic">
                "{t.comment}"
              </p>
              <div className="pt-2 border-t border-stone-200">
                <p className="font-bold text-xs text-stone-900">{t.name}</p>
                <p className="text-[11px] text-amber-700 font-medium">{t.dish}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
