import React, { useState } from 'react';
import { ToastProvider } from './context/ToastContext.tsx';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { CartProvider, useCart } from './context/CartContext.tsx';
import { FavoritesProvider } from './context/FavoritesContext.tsx';

import { Navbar } from './components/common/Navbar.tsx';
import { Footer } from './components/common/Footer.tsx';
import { HomeView } from './components/home/HomeView.tsx';
import { MenuView } from './components/menu/MenuView.tsx';
import { FavoritesView } from './components/favorites/FavoritesView.tsx';
import { OrderHistoryView } from './components/orders/OrderHistoryView.tsx';
import { AdminDashboard } from './components/admin/AdminDashboard.tsx';

import { FoodDetailModal } from './components/menu/FoodDetailModal.tsx';
import { CartDrawer } from './components/cart/CartDrawer.tsx';
import { CheckoutModal } from './components/checkout/CheckoutModal.tsx';
import { OrderTrackerModal } from './components/orders/OrderTrackerModal.tsx';
import { AuthModal } from './components/auth/AuthModal.tsx';
import { Food, Order } from './types/index.ts';

function DineDeskApp() {
  const [currentView, setCurrentView] = useState<string>('home');

  // Navigation filter state for Menu view
  const [menuFilterCategory, setMenuFilterCategory] = useState<string>('ALL');
  const [menuFilterFoodType, setMenuFilterFoodType] = useState<string>('ALL');
  const [menuFilterSearch, setMenuFilterSearch] = useState<string>('');

  // Modals state
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [activeTrackingOrder, setActiveTrackingOrder] = useState<Order | null>(null);

  const handleExploreMenu = (catId?: string, foodType?: string, search?: string) => {
    if (catId) setMenuFilterCategory(catId);
    if (foodType) setMenuFilterFoodType(foodType);
    if (search !== undefined) setMenuFilterSearch(search);
    setCurrentView('menu');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOrderSuccess = (order: Order) => {
    setActiveTrackingOrder(order);
  };

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900 font-sans selection:bg-amber-500 selection:text-stone-950">
      {/* Navbar */}
      <Navbar currentView={currentView} setCurrentView={setCurrentView} />

      {/* Main View Router */}
      <main className="flex-1">
        {currentView === 'home' && (
          <HomeView
            onExploreMenu={handleExploreMenu}
            onSelectFood={(food) => setSelectedFood(food)}
          />
        )}

        {currentView === 'menu' && (
          <MenuView
            onSelectFood={(food) => setSelectedFood(food)}
            initialCategory={menuFilterCategory}
            initialFoodType={menuFilterFoodType}
            initialSearch={menuFilterSearch}
          />
        )}

        {currentView === 'favorites' && (
          <FavoritesView
            onSelectFood={(food) => setSelectedFood(food)}
            onNavigateMenu={() => setCurrentView('menu')}
          />
        )}

        {currentView === 'orders' && (
          <OrderHistoryView onNavigateMenu={() => setCurrentView('menu')} />
        )}

        {currentView === 'admin' && (
          <AdminDashboard onNavigateHome={() => setCurrentView('home')} />
        )}
      </main>

      {/* Modals & Drawers */}
      <FoodDetailModal food={selectedFood} onClose={() => setSelectedFood(null)} />

      <CartDrawer
        onProceedToCheckout={() => setIsCheckoutOpen(true)}
        onExploreMenu={() => setCurrentView('menu')}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onOrderSuccess={handleOrderSuccess}
      />

      <OrderTrackerModal
        order={activeTrackingOrder}
        onClose={() => setActiveTrackingOrder(null)}
      />

      <AuthModal />

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <CartProvider>
          <FavoritesProvider>
            <DineDeskApp />
          </FavoritesProvider>
        </CartProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
