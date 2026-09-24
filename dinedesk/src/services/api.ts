import { Food, Category, Cart, Order, Review, Coupon, Address, User } from '../types/index.ts';

const API_BASE = '/api';

function getAuthToken(): string | null {
  return localStorage.getItem('dinedesk_token');
}

export function setAuthToken(token: string | null) {
  if (token) {
    localStorage.setItem('dinedesk_token', token);
  } else {
    localStorage.removeItem('dinedesk_token');
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.error || data.message || `Request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }

  return data as T;
}

export const api = {
  // Auth
  register: (body: { name: string; email: string; password: string; phone?: string }) =>
    request<{ user: User; token: string; message: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  login: (body: { email: string; password: string }) =>
    request<{ user: User; token: string; message: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  getMe: () => request<{ user: User }>('/auth/me'),

  logout: () => request<{ message: string }>('/auth/logout', { method: 'POST' }),

  updateProfile: (body: { name?: string; phone?: string }) =>
    request<{ user: User; message: string }>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(body),
    }),

  getAddresses: () => request<{ addresses: Address[] }>('/auth/addresses'),

  addAddress: (body: Partial<Address>) =>
    request<{ address: Address; message: string }>('/auth/addresses', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  deleteAddress: (id: string) =>
    request<{ message: string }>(`/auth/addresses/${id}`, { method: 'DELETE' }),

  // Foods
  getFoods: (params?: {
    category?: string;
    foodType?: string;
    search?: string;
    minRating?: number;
    maxPrice?: number;
    sortBy?: string;
    featured?: boolean;
    availableOnly?: boolean;
  }) => {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          query.append(key, String(val));
        }
      });
    }
    const qs = query.toString();
    return request<{ foods: Food[] }>(`/foods${qs ? `?${qs}` : ''}`);
  },

  getFoodById: (id: string) => request<{ food: Food }>(`/foods/${id}`),

  createFood: (body: Partial<Food>) =>
    request<{ food: Food; message: string }>('/foods', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  updateFood: (id: string, body: Partial<Food>) =>
    request<{ food: Food; message: string }>(`/foods/${id}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    }),

  toggleFoodAvailability: (id: string) =>
    request<{ food: Food; message: string }>(`/foods/${id}/availability`, {
      method: 'PATCH',
    }),

  deleteFood: (id: string) =>
    request<{ message: string }>(`/foods/${id}`, { method: 'DELETE' }),

  // Categories
  getCategories: () => request<{ categories: Category[] }>('/categories'),

  createCategory: (body: { name: string; description?: string; imageUrl?: string; id?: string }) =>
    request<{ category: Category; message: string }>('/categories', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  updateCategory: (id: string, body: Partial<Category>) =>
    request<{ category: Category; message: string }>(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    }),

  deleteCategory: (id: string) =>
    request<{ message: string }>(`/categories/${id}`, { method: 'DELETE' }),

  // Cart
  getCart: () => request<{ cart: Cart }>('/cart'),

  addToCart: (foodId: string, quantity = 1) =>
    request<{ cart: Cart; message: string }>('/cart/items', {
      method: 'POST',
      body: JSON.stringify({ foodId, quantity }),
    }),

  updateCartItemQuantity: (itemId: string, quantity: number) =>
    request<{ cart: Cart }>(`/cart/items/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    }),

  removeCartItem: (itemId: string) =>
    request<{ cart: Cart; message: string }>(`/cart/items/${itemId}`, {
      method: 'DELETE',
    }),

  clearCart: () => request<{ cart: Cart; message: string }>('/cart', { method: 'DELETE' }),

  // Favorites
  getFavorites: () =>
    request<{ favorites: Food[]; favoriteFoodIds: string[] }>('/favorites'),

  toggleFavorite: (foodId: string) =>
    request<{ isFavorite: boolean; message: string }>('/favorites/toggle', {
      method: 'POST',
      body: JSON.stringify({ foodId }),
    }),

  // Coupons
  validateCoupon: (code: string, subtotal: number) =>
    request<{ valid: boolean; coupon: Coupon; discount: number; message: string }>('/coupons/validate', {
      method: 'POST',
      body: JSON.stringify({ code, subtotal }),
    }),

  getActiveCoupons: () => request<{ coupons: Coupon[] }>('/coupons'),

  getAdminCoupons: () => request<{ coupons: Coupon[] }>('/coupons/admin'),

  createCoupon: (body: Partial<Coupon>) =>
    request<{ coupon: Coupon; message: string }>('/coupons/admin', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  toggleCoupon: (id: string) =>
    request<{ coupon: Coupon; message: string }>(`/coupons/admin/${id}/toggle`, {
      method: 'PATCH',
    }),

  deleteCoupon: (id: string) =>
    request<{ message: string }>(`/coupons/admin/${id}`, { method: 'DELETE' }),

  // Orders
  createOrder: (body: {
    addressId?: string;
    deliveryAddressText?: string;
    customerName?: string;
    customerPhone?: string;
    paymentMethod: string;
    couponCode?: string;
  }) =>
    request<{ order: Order; message: string }>('/orders', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  getCustomerOrders: () => request<{ orders: Order[] }>('/orders'),

  getOrderById: (id: string) => request<{ order: Order }>(`/orders/${id}`),

  reorderItems: (orderId: string) =>
    request<{ message: string; success: boolean }>(`/orders/${orderId}/reorder`, {
      method: 'POST',
    }),

  getAdminOrders: (params?: { status?: string; search?: string }) => {
    const qs = new URLSearchParams(params as any).toString();
    return request<{ orders: Order[] }>(`/orders/admin/all${qs ? `?${qs}` : ''}`);
  },

  updateOrderStatus: (id: string, status: string, paymentStatus?: string) =>
    request<{ order: Order; message: string }>(`/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, paymentStatus }),
    }),

  // Reviews
  getFoodReviews: (foodId: string) =>
    request<{ reviews: Review[] }>(`/reviews/food/${foodId}`),

  submitReview: (body: { foodId: string; rating: number; comment?: string; orderId?: string }) =>
    request<{ review: Review; avgRating: number; reviewCount: number; message: string }>('/reviews', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  getAdminReviews: () => request<{ reviews: Review[] }>('/reviews/admin/all'),

  // Admin Dashboard & Customers
  getAdminDashboard: () =>
    request<{
      metrics: {
        totalOrders: number;
        todayOrders: number;
        totalRevenue: number;
        todayRevenue: number;
        totalCustomers: number;
        totalMenuItems: number;
        pendingOrders: number;
      };
      ordersByStatus: Record<string, number>;
      recentOrders: Order[];
      popularItems: Array<{
        foodId: string;
        name: string;
        imageUrl: string;
        foodType: string;
        soldCount: number;
        totalSales: number;
      }>;
    }>('/admin/dashboard'),

  getAdminCustomers: () =>
    request<{
      customers: Array<{
        id: string;
        name: string;
        email: string;
        phone: string;
        orderCount: number;
        totalSpending: number;
        joinedDate: string;
        status: string;
      }>;
    }>('/admin/customers'),
};
