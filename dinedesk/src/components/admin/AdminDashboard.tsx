import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  ShoppingBag,
  Users,
  Utensils,
  DollarSign,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  Edit2,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Search,
  Filter,
  Tag,
  Star,
  RefreshCw,
  ShieldCheck,
  ChevronRight,
  Layers,
  X,
} from 'lucide-react';
import { Food, Category, Order, Coupon, Review, FoodType } from '../../types/index.ts';
import { api } from '../../services/api.ts';
import { useAuth } from '../../context/AuthContext.tsx';
import { useToast } from '../../context/ToastContext.tsx';
import { FoodImage } from '../common/FoodImage.tsx';
import { VegBadge } from '../common/VegBadge.tsx';

type AdminTab = 'overview' | 'orders' | 'menu' | 'categories' | 'coupons' | 'customers' | 'reviews';

export const AdminDashboard: React.FC<{ onNavigateHome: () => void }> = ({ onNavigateHome }) => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [loading, setLoading] = useState(true);

  // Dashboard metrics state
  const [metrics, setMetrics] = useState<any>(null);
  const [ordersByStatus, setOrdersByStatus] = useState<Record<string, number>>({});
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [popularItems, setPopularItems] = useState<any[]>([]);

  // Orders management state
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderFilterStatus, setOrderFilterStatus] = useState('ALL');
  const [orderSearch, setOrderSearch] = useState('');

  // Food items management state
  const [foods, setFoods] = useState<Food[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [foodSearch, setFoodSearch] = useState('');
  const [foodCategoryFilter, setFoodCategoryFilter] = useState('ALL');

  // Food modal state (Add / Edit)
  const [isFoodModalOpen, setIsFoodModalOpen] = useState(false);
  const [editingFood, setEditingFood] = useState<Food | null>(null);
  const [foodForm, setFoodForm] = useState({
    name: '',
    categoryId: '',
    foodType: 'VEG' as FoodType,
    price: 199,
    description: '',
    imageUrl: '',
    preparationTime: '20-25 min',
    featured: false,
    available: true,
  });

  // Category modal state
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [categoryForm, setCategoryForm] = useState({
    id: '',
    name: '',
    description: '',
    imageUrl: '',
  });

  // Coupons state
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [couponForm, setCouponForm] = useState<{
    code: string;
    discountType: 'PERCENTAGE' | 'FIXED';
    discountValue: number;
    minOrderAmount: number;
    maxDiscount: number;
    active: boolean;
  }>({
    code: '',
    discountType: 'PERCENTAGE',
    discountValue: 10,
    minOrderAmount: 299,
    maxDiscount: 100,
    active: true,
  });

  // Customers state
  const [customers, setCustomers] = useState<any[]>([]);

  // Reviews state
  const [reviews, setReviews] = useState<Review[]>([]);

  // Fetch data
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [dashData, foodsData, catData, ordersData, couponsData, custData, reviewsData] =
        await Promise.all([
          api.getAdminDashboard(),
          api.getFoods(),
          api.getCategories(),
          api.getAdminOrders(),
          api.getAdminCoupons(),
          api.getAdminCustomers(),
          api.getAdminReviews(),
        ]);

      setMetrics(dashData.metrics);
      setOrdersByStatus(dashData.ordersByStatus);
      setRecentOrders(dashData.recentOrders);
      setPopularItems(dashData.popularItems);

      setFoods(foodsData.foods);
      setCategories(catData.categories);
      setOrders(ordersData.orders);
      setCoupons(couponsData.coupons);
      setCustomers(custData.customers);
      setReviews(reviewsData.reviews);
    } catch (err: any) {
      showToast(err.message || 'Failed to load admin data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      loadDashboardData();
    }
  }, [user]);

  if (user?.role !== 'ADMIN') {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <AlertCircle className="w-16 h-16 text-rose-500 mx-auto mb-4" />
        <h2 className="text-2xl font-black text-stone-900 font-serif">Admin Access Restricted</h2>
        <p className="text-xs text-stone-600 mt-2 mb-6">
          This portal requires administrator privileges. Please sign in with an admin account.
        </p>
        <button
          onClick={onNavigateHome}
          className="px-6 py-2.5 rounded-xl bg-amber-600 text-white text-xs font-bold"
        >
          Return to Home
        </button>
      </div>
    );
  }

  // Handle Order Status Update
  const handleOrderStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const res = await api.updateOrderStatus(orderId, newStatus);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? res.order : o)));
      showToast(`Order status updated to ${newStatus}`, 'success');
      // Refresh dashboard metrics
      const dash = await api.getAdminDashboard();
      setMetrics(dash.metrics);
      setOrdersByStatus(dash.ordersByStatus);
    } catch (err: any) {
      showToast(err.message || 'Failed to update order status', 'error');
    }
  };

  // Handle Food Availability Toggle
  const handleToggleFoodAvailability = async (foodId: string) => {
    try {
      const res = await api.toggleFoodAvailability(foodId);
      setFoods((prev) => prev.map((f) => (f.id === foodId ? res.food : f)));
      showToast(`"${res.food.name}" is now ${res.food.available ? 'In Stock' : 'Out of Stock'}`);
    } catch (err: any) {
      showToast(err.message || 'Failed to toggle status', 'error');
    }
  };

  // Handle Delete Food
  const handleDeleteFood = async (foodId: string, foodName: string) => {
    if (!window.confirm(`Are you sure you want to delete "${foodName}" from the menu?`)) return;
    try {
      await api.deleteFood(foodId);
      setFoods((prev) => prev.filter((f) => f.id !== foodId));
      showToast(`"${foodName}" deleted successfully`, 'info');
    } catch (err: any) {
      showToast(err.message || 'Failed to delete dish', 'error');
    }
  };

  // Handle Save Food (Create or Update)
  const handleSaveFood = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingFood) {
        const res = await api.updateFood(editingFood.id, foodForm);
        setFoods((prev) => prev.map((f) => (f.id === editingFood.id ? res.food : f)));
        showToast('Food item updated successfully!', 'success');
      } else {
        const res = await api.createFood(foodForm);
        setFoods((prev) => [res.food, ...prev]);
        showToast('New food item added to menu!', 'success');
      }
      setIsFoodModalOpen(false);
      setEditingFood(null);
    } catch (err: any) {
      showToast(err.message || 'Failed to save food item', 'error');
    }
  };

  const openAddFoodModal = () => {
    setEditingFood(null);
    setFoodForm({
      name: '',
      categoryId: categories[0]?.id || 'biryani',
      foodType: 'VEG',
      price: 199,
      description: '',
      imageUrl:
        'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
      preparationTime: '20-25 min',
      featured: false,
      available: true,
    });
    setIsFoodModalOpen(true);
  };

  const openEditFoodModal = (food: Food) => {
    setEditingFood(food);
    setFoodForm({
      name: food.name,
      categoryId: food.categoryId,
      foodType: food.foodType,
      price: food.price,
      description: food.description,
      imageUrl: food.imageUrl,
      preparationTime: food.preparationTime,
      featured: food.featured,
      available: food.available,
    });
    setIsFoodModalOpen(true);
  };

  // Handle Category Creation
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.createCategory(categoryForm);
      setCategories((prev) => [...prev, res.category]);
      showToast('New category created!', 'success');
      setIsCategoryModalOpen(false);
      setCategoryForm({ id: '', name: '', description: '', imageUrl: '' });
    } catch (err: any) {
      showToast(err.message || 'Failed to create category', 'error');
    }
  };

  // Handle Coupon Creation
  const handleSaveCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.createCoupon(couponForm);
      setCoupons((prev) => [res.coupon, ...prev]);
      showToast(`Coupon ${res.coupon.code} created!`, 'success');
      setIsCouponModalOpen(false);
      setCouponForm({
        code: '',
        discountType: 'PERCENTAGE',
        discountValue: 10,
        minOrderAmount: 299,
        maxDiscount: 100,
        active: true,
      });
    } catch (err: any) {
      showToast(err.message || 'Failed to create coupon', 'error');
    }
  };

  // Handle Coupon Toggle
  const handleToggleCoupon = async (couponId: string) => {
    try {
      const res = await api.toggleCoupon(couponId);
      setCoupons((prev) => prev.map((c) => (c.id === couponId ? res.coupon : c)));
      showToast(`Coupon ${res.coupon.code} status updated`);
    } catch (err: any) {
      showToast(err.message || 'Failed to toggle coupon', 'error');
    }
  };

  // Filtered orders in Orders tab
  const filteredOrders = orders.filter((o) => {
    if (orderFilterStatus !== 'ALL' && o.status !== orderFilterStatus) return false;
    if (orderSearch.trim()) {
      const q = orderSearch.toLowerCase().trim();
      return (
        o.orderNumber.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.customerEmail.toLowerCase().includes(q) ||
        o.customerPhone.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Filtered foods in Menu tab
  const filteredFoods = foods.filter((f) => {
    if (foodCategoryFilter !== 'ALL' && f.categoryId !== foodCategoryFilter) return false;
    if (foodSearch.trim()) {
      const q = foodSearch.toLowerCase().trim();
      return f.name.toLowerCase().includes(q) || f.description.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-purple-100 text-purple-800 font-extrabold text-[11px] uppercase tracking-wider flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin Management Suite</span>
            </span>
            <span className="text-xs text-stone-600 font-semibold">• Live PostgreSQL</span>
          </div>
          <h1 className="text-3xl font-black text-stone-900 font-serif tracking-tight mt-1">
            Restaurant Control Hub
          </h1>
        </div>

        <button
          onClick={loadDashboardData}
          disabled={loading}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Live Metrics</span>
        </button>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto py-4 border-b border-stone-200/80 mb-8 scrollbar-none">
        {[
          { id: 'overview', label: 'Dashboard Overview', icon: TrendingUp },
          { id: 'orders', label: `Orders (${orders.length})`, icon: ShoppingBag },
          { id: 'menu', label: `Menu Items (${foods.length})`, icon: Utensils },
          { id: 'categories', label: `Categories (${categories.length})`, icon: Layers },
          { id: 'coupons', label: `Coupons (${coupons.length})`, icon: Tag },
          { id: 'customers', label: `Customers (${customers.length})`, icon: Users },
          { id: 'reviews', label: `Customer Reviews (${reviews.length})`, icon: Star },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as AdminTab)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                  : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border border-stone-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW METRICS */}
      {activeTab === 'overview' && metrics && (
        <div className="space-y-8">
          {/* Top 4 KPI Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="p-5 rounded-2xl bg-white border border-stone-200/80 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-600 uppercase tracking-wider">
                  Total Orders
                </span>
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5" />
                </div>
              </div>
              <p className="text-3xl font-black text-stone-900 mt-2">{metrics.totalOrders}</p>
              <p className="text-xs text-emerald-600 font-semibold mt-1">
                {metrics.todayOrders} orders placed today
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-stone-200/80 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-600 uppercase tracking-wider">
                  Total Revenue
                </span>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <DollarSign className="w-5 h-5" />
                </div>
              </div>
              <p className="text-3xl font-black text-stone-900 mt-2">₹{metrics.totalRevenue}</p>
              <p className="text-xs text-stone-600 font-semibold mt-1">
                ₹{metrics.todayRevenue} today's sales
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-stone-200/80 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-600 uppercase tracking-wider">
                  Active / Pending
                </span>
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </div>
              </div>
              <p className="text-3xl font-black text-amber-600 mt-2">{metrics.pendingOrders}</p>
              <p className="text-xs text-stone-600 font-semibold mt-1">
                Orders cooking or awaiting dispatch
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-stone-200/80 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-600 uppercase tracking-wider">
                  Customers & Menu
                </span>
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
              </div>
              <p className="text-3xl font-black text-stone-900 mt-2">{metrics.totalCustomers}</p>
              <p className="text-xs text-stone-600 font-semibold mt-1">
                {metrics.totalMenuItems} dishes in active catalog
              </p>
            </div>
          </div>

          {/* Orders by Status Breakdown */}
          <div className="p-6 rounded-3xl bg-white border border-stone-200/80 shadow-2xs space-y-4">
            <h3 className="font-bold text-sm text-stone-900 uppercase tracking-wider">
              Live Order Status Pipeline
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {[
                { key: 'PENDING', label: 'Placed', color: 'bg-stone-100 text-stone-800' },
                { key: 'CONFIRMED', label: 'Confirmed', color: 'bg-indigo-50 text-indigo-700' },
                { key: 'PREPARING', label: 'Preparing', color: 'bg-amber-50 text-amber-700' },
                {
                  key: 'OUT_FOR_DELIVERY',
                  label: 'In Transit',
                  color: 'bg-blue-50 text-blue-700',
                },
                { key: 'DELIVERED', label: 'Delivered', color: 'bg-emerald-50 text-emerald-700' },
                { key: 'CANCELLED', label: 'Cancelled', color: 'bg-rose-50 text-rose-700' },
              ].map((st) => (
                <div
                  key={st.key}
                  onClick={() => {
                    setOrderFilterStatus(st.key);
                    setActiveTab('orders');
                  }}
                  className={`p-3.5 rounded-2xl border border-stone-200/60 ${st.color} cursor-pointer hover:shadow-xs transition-all`}
                >
                  <p className="text-[10px] font-extrabold uppercase tracking-wider">{st.label}</p>
                  <p className="text-2xl font-black mt-1">{ordersByStatus[st.key] || 0}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Orders & Popular Dishes side by side */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Recent Orders */}
            <div className="lg:col-span-7 p-6 rounded-3xl bg-white border border-stone-200/80 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-stone-900 uppercase tracking-wider">
                  Recent Orders
                </h3>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="text-xs font-bold text-purple-600 hover:text-purple-700"
                >
                  View All Orders →
                </button>
              </div>

              <div className="space-y-3">
                {recentOrders.map((ord) => (
                  <div
                    key={ord.id}
                    className="p-3.5 rounded-2xl bg-stone-50 border border-stone-100 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-stone-900">
                          {ord.orderNumber}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-stone-200 text-stone-800">
                          {ord.status}
                        </span>
                      </div>
                      <p className="text-stone-600 mt-0.5">
                        {ord.customerName} • {ord.items.length} items
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="font-black text-stone-900 text-sm">₹{ord.total}</span>
                      <p className="text-[10px] text-stone-600">
                        {new Date(ord.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Popular Dishes */}
            <div className="lg:col-span-5 p-6 rounded-3xl bg-white border border-stone-200/80 shadow-2xs space-y-4">
              <h3 className="font-bold text-sm text-stone-900 uppercase tracking-wider">
                Top Ordered Dishes
              </h3>
              <div className="space-y-3">
                {popularItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-2xl bg-stone-50 border border-stone-100"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0">
                        <FoodImage
                          src={item.imageUrl}
                          alt={item.name}
                          aspectRatio="square"
                          foodType={item.foodType}
                        />
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-stone-900">{item.name}</h4>
                        <span className="text-[10px] text-stone-600">
                          {item.soldCount} portions ordered
                        </span>
                      </div>
                    </div>
                    <span className="font-bold text-xs text-emerald-700">₹{item.totalSales}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ORDERS MANAGEMENT */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          {/* Filter and Search Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-stone-50 p-4 rounded-2xl border border-stone-200">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-stone-600 absolute left-3 top-3" />
              <input
                type="text"
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                placeholder="Search order #, customer, email, phone..."
                className="w-full pl-9 pr-3 py-2 bg-white border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs font-bold text-stone-600">Status:</span>
              <select
                value={orderFilterStatus}
                onChange={(e) => setOrderFilterStatus(e.target.value)}
                className="px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs font-bold text-stone-800"
              >
                <option value="ALL">All Statuses ({orders.length})</option>
                <option value="PENDING">PENDING</option>
                <option value="CONFIRMED">CONFIRMED</option>
                <option value="PREPARING">PREPARING</option>
                <option value="OUT_FOR_DELIVERY">OUT_FOR_DELIVERY</option>
                <option value="DELIVERED">DELIVERED</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>
          </div>

          {/* Orders Table */}
          <div className="bg-white rounded-3xl border border-stone-200 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 uppercase font-bold text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Order ID & Date</th>
                    <th className="py-3.5 px-4">Customer Details</th>
                    <th className="py-3.5 px-4">Dishes & Quantity</th>
                    <th className="py-3.5 px-4">Amount</th>
                    <th className="py-3.5 px-4">Change Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredOrders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-stone-50/70 transition-colors">
                      <td className="py-4 px-4 font-medium">
                        <span className="font-mono font-bold text-stone-900 block">
                          {ord.orderNumber}
                        </span>
                        <span className="text-[11px] text-stone-600">
                          {new Date(ord.createdAt).toLocaleDateString()}{' '}
                          {new Date(ord.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </td>

                      <td className="py-4 px-4">
                        <span className="font-bold text-stone-900 block">{ord.customerName}</span>
                        <span className="text-[11px] text-stone-600 block">
                          {ord.customerPhone}
                        </span>
                        <span className="text-[10px] text-stone-600 line-clamp-1 max-w-xs">
                          {ord.deliveryAddressText}
                        </span>
                      </td>

                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          {ord.items.map((it) => (
                            <div key={it.id} className="text-[11px] text-stone-700">
                              <span className="font-semibold">{it.foodName}</span> × {it.quantity}
                            </div>
                          ))}
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <span className="font-black text-stone-900 text-sm block">₹{ord.total}</span>
                        <span className="text-[10px] text-stone-600">
                          {ord.paymentMethod} ({ord.paymentStatus})
                        </span>
                      </td>

                      <td className="py-4 px-4">
                        <select
                          value={ord.status}
                          onChange={(e) => handleOrderStatusChange(ord.id, e.target.value)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                            ord.status === 'DELIVERED'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : ord.status === 'PREPARING'
                              ? 'bg-amber-50 text-amber-800 border-amber-300'
                              : ord.status === 'OUT_FOR_DELIVERY'
                              ? 'bg-blue-50 text-blue-800 border-blue-300'
                              : ord.status === 'CANCELLED'
                              ? 'bg-rose-50 text-rose-800 border-rose-300'
                              : 'bg-stone-50 text-stone-800 border-stone-300'
                          }`}
                        >
                          <option value="PENDING">PENDING</option>
                          <option value="CONFIRMED">CONFIRMED</option>
                          <option value="PREPARING">PREPARING</option>
                          <option value="OUT_FOR_DELIVERY">OUT FOR DELIVERY</option>
                          <option value="DELIVERED">DELIVERED</option>
                          <option value="CANCELLED">CANCELLED</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: MENU ITEMS MANAGEMENT */}
      {activeTab === 'menu' && (
        <div className="space-y-6">
          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-stone-50 p-4 rounded-2xl border border-stone-200">
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-stone-600 absolute left-3 top-3" />
                <input
                  type="text"
                  value={foodSearch}
                  onChange={(e) => setFoodSearch(e.target.value)}
                  placeholder="Search food by name..."
                  className="w-full pl-9 pr-3 py-2 bg-white border border-stone-200 rounded-xl text-xs"
                />
              </div>

              <select
                value={foodCategoryFilter}
                onChange={(e) => setFoodCategoryFilter(e.target.value)}
                className="px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs font-bold"
              >
                <option value="ALL">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={openAddFoodModal}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Dish</span>
            </button>
          </div>

          {/* Foods Table */}
          <div className="bg-white rounded-3xl border border-stone-200 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 uppercase font-bold text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Dish</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Price</th>
                    <th className="py-3.5 px-4">Rating</th>
                    <th className="py-3.5 px-4">Stock Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredFoods.map((f) => (
                    <tr key={f.id} className="hover:bg-stone-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0">
                            <FoodImage
                              src={f.imageUrl}
                              alt={f.name}
                              aspectRatio="square"
                              foodType={f.foodType}
                            />
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <VegBadge type={f.foodType} showText={false} />
                              <span className="font-bold text-stone-900">{f.name}</span>
                            </div>
                            <span className="text-[10px] text-stone-600 line-clamp-1 max-w-xs">
                              {f.description}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-stone-700">
                        {f.category?.name || f.categoryId}
                      </td>

                      <td className="py-3.5 px-4 font-black text-stone-900 text-sm">₹{f.price}</td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1 font-bold text-amber-800">
                          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                          <span>{f.rating}</span>
                          <span className="text-[10px] text-stone-600">({f.reviewCount})</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => handleToggleFoodAvailability(f.id)}
                          className={`px-3 py-1 rounded-xl text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
                            f.available
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                              : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                          }`}
                        >
                          {f.available ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5" /> In Stock
                            </>
                          ) : (
                            <>
                              <AlertCircle className="w-3.5 h-3.5" /> Sold Out
                            </>
                          )}
                        </button>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditFoodModal(f)}
                            className="p-1.5 rounded-lg text-stone-600 hover:text-amber-700 hover:bg-stone-100 transition-colors cursor-pointer"
                            title="Edit food"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteFood(f.id, f.name)}
                            className="p-1.5 rounded-lg text-stone-600 hover:text-rose-700 hover:bg-stone-100 transition-colors cursor-pointer"
                            title="Delete food"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: CATEGORIES MANAGEMENT */}
      {activeTab === 'categories' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-stone-50 p-4 rounded-2xl border border-stone-200">
            <div>
              <h3 className="font-bold text-sm text-stone-900">Menu Categories</h3>
              <p className="text-xs text-stone-600">Manage categories and their display images.</p>
            </div>
            <button
              onClick={() => setIsCategoryModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Category</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="p-4 rounded-2xl bg-white border border-stone-200 shadow-2xs flex items-center gap-4"
              >
                <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0">
                  <FoodImage src={cat.imageUrl || ''} alt={cat.name} aspectRatio="square" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-stone-900">{cat.name}</h4>
                  <p className="text-xs text-stone-600 line-clamp-2 mt-0.5">{cat.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: COUPONS MANAGEMENT */}
      {activeTab === 'coupons' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-stone-50 p-4 rounded-2xl border border-stone-200">
            <div>
              <h3 className="font-bold text-sm text-stone-900">Discount Coupons & Offers</h3>
              <p className="text-xs text-stone-600">
                Create promotional discount coupons for checkout.
              </p>
            </div>
            <button
              onClick={() => setIsCouponModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Coupon</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {coupons.map((c) => (
              <div
                key={c.id}
                className="p-5 rounded-2xl bg-white border border-stone-200 shadow-2xs flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-black text-amber-700 text-base">{c.code}</span>
                    <button
                      onClick={() => handleToggleCoupon(c.id)}
                      className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase ${
                        c.active ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-600'
                      }`}
                    >
                      {c.active ? 'Active' : 'Disabled'}
                    </button>
                  </div>
                  <p className="text-xs font-bold text-stone-800 mt-1">
                    {c.discountType === 'PERCENTAGE'
                      ? `${c.discountValue}% OFF (Max ₹${c.maxDiscount || 'unlimited'})`
                      : `Flat ₹${c.discountValue} OFF`}
                  </p>
                  <p className="text-[11px] text-stone-600 mt-0.5">
                    Min order amount: ₹{c.minOrderAmount}
                  </p>
                </div>

                <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
                  <span className="text-stone-600">
                    Used: <strong>{c._count?.orders || 0} times</strong>
                  </span>
                  <button
                    onClick={() => handleToggleCoupon(c.id)}
                    className="text-amber-700 hover:underline font-bold text-[11px] cursor-pointer"
                  >
                    {c.active ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: CUSTOMERS LIST */}
      {activeTab === 'customers' && (
        <div className="bg-white rounded-3xl border border-stone-200 shadow-2xs overflow-hidden">
          <div className="p-4 bg-stone-50 border-b border-stone-200">
            <h3 className="font-bold text-sm text-stone-900">Registered Customer Accounts</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 uppercase font-bold text-[10px] tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Phone</th>
                  <th className="py-3.5 px-4">Total Orders</th>
                  <th className="py-3.5 px-4">Total Spent</th>
                  <th className="py-3.5 px-4">Joined Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-stone-50/70">
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-stone-900 block">{c.name}</span>
                      <span className="text-[11px] text-stone-600">{c.email}</span>
                    </td>
                    <td className="py-3.5 px-4 text-stone-700">{c.phone}</td>
                    <td className="py-3.5 px-4 font-bold text-stone-900">{c.orderCount}</td>
                    <td className="py-3.5 px-4 font-black text-emerald-700">₹{c.totalSpending}</td>
                    <td className="py-3.5 px-4 text-stone-600">
                      {new Date(c.joinedDate).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 7: REVIEWS */}
      {activeTab === 'reviews' && (
        <div className="bg-white rounded-3xl border border-stone-200 shadow-2xs overflow-hidden">
          <div className="p-4 bg-stone-50 border-b border-stone-200">
            <h3 className="font-bold text-sm text-stone-900">Customer Feedback & Reviews</h3>
          </div>
          <div className="divide-y divide-stone-100">
            {reviews.map((rev) => (
              <div key={rev.id} className="p-4 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0">
                    <FoodImage
                      src={rev.food?.imageUrl || ''}
                      alt={rev.food?.name || 'Dish'}
                      aspectRatio="square"
                    />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-stone-900">{rev.food?.name}</h4>
                    <p className="text-[11px] text-stone-600">
                      By {rev.userName} on {new Date(rev.createdAt).toLocaleDateString()}
                    </p>
                    {rev.comment && (
                      <p className="text-xs text-stone-700 mt-1 italic leading-relaxed">
                        "{rev.comment}"
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1 text-amber-500 shrink-0">
                  {Array.from({ length: rev.rating }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-500" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: Add / Edit Food */}
      {isFoodModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/65 backdrop-blur-xs animate-in fade-in overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-8">
            <div className="p-5 bg-stone-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-base">
                {editingFood ? 'Edit Food Dish' : 'Add New Food Item'}
              </h3>
              <button
                onClick={() => setIsFoodModalOpen(false)}
                className="p-1 rounded-full hover:bg-white/20"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveFood} className="p-6 space-y-3.5 max-h-[75vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Food Name</label>
                <input
                  type="text"
                  required
                  value={foodForm.name}
                  onChange={(e) => setFoodForm({ ...foodForm, name: e.target.value })}
                  placeholder="e.g. Chicken Dum Biryani"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Category</label>
                  <select
                    value={foodForm.categoryId}
                    onChange={(e) => setFoodForm({ ...foodForm, categoryId: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Food Type</label>
                  <select
                    value={foodForm.foodType}
                    onChange={(e) =>
                      setFoodForm({ ...foodForm, foodType: e.target.value as FoodType })
                    }
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold"
                  >
                    <option value="VEG">🥬 VEG</option>
                    <option value="NON_VEG">🍗 NON-VEG</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Price (₹)</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={foodForm.price}
                    onChange={(e) =>
                      setFoodForm({ ...foodForm, price: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Preparation Time
                  </label>
                  <input
                    type="text"
                    value={foodForm.preparationTime}
                    onChange={(e) =>
                      setFoodForm({ ...foodForm, preparationTime: e.target.value })
                    }
                    placeholder="20-25 min"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Image URL</label>
                <input
                  type="url"
                  required
                  value={foodForm.imageUrl}
                  onChange={(e) => setFoodForm({ ...foodForm, imageUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  required
                  value={foodForm.description}
                  onChange={(e) => setFoodForm({ ...foodForm, description: e.target.value })}
                  placeholder="Describe authentic spices, preparation style, and ingredients..."
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs"
                />
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={foodForm.featured}
                    onChange={(e) => setFoodForm({ ...foodForm, featured: e.target.checked })}
                    className="rounded text-amber-600 focus:ring-amber-500"
                  />
                  <span>Mark as Bestseller / Featured</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={foodForm.available}
                    onChange={(e) => setFoodForm({ ...foodForm, available: e.target.checked })}
                    className="rounded text-amber-600 focus:ring-amber-500"
                  />
                  <span>Available in Kitchen</span>
                </label>
              </div>

              <button
                type="submit"
                className="w-full mt-4 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
              >
                {editingFood ? 'Save Changes' : 'Create Dish'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Create Category */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/65 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden">
            <div className="p-5 bg-purple-700 text-white flex items-center justify-between">
              <h3 className="font-bold text-base">Add New Category</h3>
              <button
                onClick={() => setIsCategoryModalOpen(false)}
                className="p-1 rounded-full hover:bg-white/20"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="p-6 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Category ID</label>
                <input
                  type="text"
                  required
                  value={categoryForm.id}
                  onChange={(e) =>
                    setCategoryForm({
                      ...categoryForm,
                      id: e.target.value.toLowerCase().replace(/\s+/g, '-'),
                    })
                  }
                  placeholder="e.g. tandoor-specials"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Category Name</label>
                <input
                  type="text"
                  required
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  placeholder="e.g. Tandoor Specials"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Description</label>
                <input
                  type="text"
                  value={categoryForm.description}
                  onChange={(e) =>
                    setCategoryForm({ ...categoryForm, description: e.target.value })
                  }
                  placeholder="Short description of this cuisine segment..."
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Image URL</label>
                <input
                  type="url"
                  value={categoryForm.imageUrl}
                  onChange={(e) => setCategoryForm({ ...categoryForm, imageUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
              >
                Create Category
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Create Coupon */}
      {isCouponModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/65 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden">
            <div className="p-5 bg-amber-600 text-white flex items-center justify-between">
              <h3 className="font-bold text-base">Create Discount Coupon</h3>
              <button
                onClick={() => setIsCouponModalOpen(false)}
                className="p-1 rounded-full hover:bg-white/20"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCoupon} className="p-6 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Coupon Code</label>
                <input
                  type="text"
                  required
                  value={couponForm.code}
                  onChange={(e) =>
                    setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })
                  }
                  placeholder="e.g. FESTIVE20"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs uppercase font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Discount Type
                  </label>
                  <select
                    value={couponForm.discountType}
                    onChange={(e) =>
                      setCouponForm({
                        ...couponForm,
                        discountType: e.target.value as 'PERCENTAGE' | 'FIXED',
                      })
                    }
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED">Fixed (₹)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Discount Value
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={couponForm.discountValue}
                    onChange={(e) =>
                      setCouponForm({
                        ...couponForm,
                        discountValue: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Min Order (₹)
                  </label>
                  <input
                    type="number"
                    value={couponForm.minOrderAmount}
                    onChange={(e) =>
                      setCouponForm({
                        ...couponForm,
                        minOrderAmount: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Max Discount (₹)
                  </label>
                  <input
                    type="number"
                    value={couponForm.maxDiscount}
                    onChange={(e) =>
                      setCouponForm({
                        ...couponForm,
                        maxDiscount: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
              >
                Save Coupon
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
