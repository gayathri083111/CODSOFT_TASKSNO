import React, { useState } from 'react';
import {
  UtensilsCrossed,
  ShoppingBag,
  Heart,
  User as UserIcon,
  ShieldCheck,
  Menu as MenuIcon,
  X,
  LogOut,
  Clock,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useCart } from '../../context/CartContext.tsx';
import { useFavorites } from '../../context/FavoritesContext.tsx';

interface NavbarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  onOpenSearch?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, setCurrentView }) => {
  const { user, openAuthModal, logout } = useAuth();
  const { cartCount, openCart } = useCart();
  const { favorites } = useFavorites();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'menu', label: 'Menu' },
    { id: 'favorites', label: 'Favorites', badge: favorites.length },
    { id: 'orders', label: 'Orders' },
  ];

  const handleNavClick = (viewId: string) => {
    setCurrentView(viewId);
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Logo */}
          <div
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-orange-500 flex items-center justify-center text-white shadow-md shadow-amber-600/20 group-hover:scale-105 transition-transform">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-2xl font-black tracking-tight text-stone-900 font-serif">
                  Dine<span className="text-amber-600">Desk</span>
                </span>
              </div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-stone-600 block -mt-1">
                Restaurant & Delivery
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navLinks.map((link) => {
              const isActive = currentView === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.id)}
                  className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-all relative ${
                    isActive
                      ? 'text-amber-600 bg-amber-50/80 font-bold'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100/70'
                  }`}
                >
                  {link.label}
                  {Boolean(link.badge) && (
                    <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-500 text-white">
                      {link.badge}
                    </span>
                  )}
                </button>
              );
            })}

            {/* Admin Dashboard shortcut if ADMIN */}
            {user?.role === 'ADMIN' && (
              <button
                onClick={() => handleNavClick('admin')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                  currentView === 'admin'
                    ? 'bg-purple-600 text-white shadow-sm shadow-purple-500/20'
                    : 'bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Admin Portal</span>
              </button>
            )}
          </nav>

          {/* Right Action Icons: Cart & Profile */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Cart Trigger */}
            <button
              onClick={openCart}
              className="relative p-2.5 rounded-xl bg-stone-100 hover:bg-stone-200/80 text-stone-800 transition-colors flex items-center gap-2 group"
              aria-label="View Cart"
            >
              <ShoppingBag className="w-5 h-5 text-stone-700 group-hover:text-amber-600 transition-colors" />
              <span className="hidden sm:inline-block text-xs font-bold text-stone-700">
                Cart
              </span>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-600 text-white text-[11px] font-black flex items-center justify-center shadow-sm animate-in zoom-in-50">
                  {cartCount}
                </span>
              )}
            </button>

            {/* User Account / Login */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 p-1.5 pl-2 rounded-xl border border-stone-200 hover:border-stone-300 bg-white hover:bg-stone-50 transition-all text-left"
                >
                  <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-sm">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="hidden lg:block text-xs leading-tight">
                    <p className="font-bold text-stone-900 truncate max-w-[100px]">
                      {user.name.split(' ')[0]}
                    </p>
                    <p className="text-[10px] text-stone-600 font-medium capitalize">
                      {user.role.toLowerCase()}
                    </p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-stone-600" />
                </button>

                {/* Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-stone-100 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="px-4 py-2.5 border-b border-stone-100">
                      <p className="text-xs font-bold text-stone-900">{user.name}</p>
                      <p className="text-[11px] text-stone-600 truncate">{user.email}</p>
                    </div>

                    <button
                      onClick={() => {
                        handleNavClick('orders');
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full px-4 py-2.5 text-left text-xs font-medium text-stone-700 hover:bg-amber-50 hover:text-amber-700 flex items-center gap-2.5 transition-colors"
                    >
                      <Clock className="w-4 h-4 text-stone-600" />
                      Order History & Tracking
                    </button>

                    <button
                      onClick={() => {
                        handleNavClick('favorites');
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full px-4 py-2.5 text-left text-xs font-medium text-stone-700 hover:bg-amber-50 hover:text-amber-700 flex items-center gap-2.5 transition-colors"
                    >
                      <Heart className="w-4 h-4 text-stone-600" />
                      My Saved Favorites
                    </button>

                    {user.role === 'ADMIN' && (
                      <button
                        onClick={() => {
                          handleNavClick('admin');
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full px-4 py-2.5 text-left text-xs font-bold text-purple-700 hover:bg-purple-50 flex items-center gap-2.5 transition-colors border-t border-stone-100"
                      >
                        <ShieldCheck className="w-4 h-4 text-purple-600" />
                        Admin Management
                      </button>
                    )}

                    <div className="border-t border-stone-100 mt-1 pt-1">
                      <button
                        onClick={() => {
                          logout();
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full px-4 py-2 text-left text-xs font-medium text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => openAuthModal('login')}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-sm shadow-amber-600/20 transition-all flex items-center gap-1.5"
              >
                <UserIcon className="w-4 h-4" />
                <span>Sign In</span>
              </button>
            )}

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-stone-700 hover:bg-stone-100"
              aria-label="Toggle Navigation Menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-stone-200 px-4 pt-3 pb-5 space-y-1 shadow-lg">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => handleNavClick(link.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold ${
                currentView === link.id
                  ? 'bg-amber-50 text-amber-600 font-bold'
                  : 'text-stone-700 hover:bg-stone-50'
              }`}
            >
              <span>{link.label}</span>
              {Boolean(link.badge) && (
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-500 text-white">
                  {link.badge}
                </span>
              )}
            </button>
          ))}

          {user?.role === 'ADMIN' && (
            <button
              onClick={() => handleNavClick('admin')}
              className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-bold text-purple-700 bg-purple-50"
            >
              <ShieldCheck className="w-5 h-5 text-purple-600" />
              Admin Portal
            </button>
          )}

          {!user && (
            <div className="pt-2">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  openAuthModal('login');
                }}
                className="w-full py-2.5 rounded-xl bg-amber-600 text-white font-bold text-sm text-center"
              >
                Sign In / Register
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
