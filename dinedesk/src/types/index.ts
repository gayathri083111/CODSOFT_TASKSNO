export type FoodType = 'VEG' | 'NON_VEG';

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED';

export type PaymentMethod = 'COD' | 'ONLINE_MOCK';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: 'CUSTOMER' | 'ADMIN';
  createdAt: string;
  addresses?: Address[];
}

export interface Address {
  id: string;
  userId: string;
  label: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  phone: string;
  isDefault: boolean;
}

export interface Category {
  id: string;
  name: string;
  description?: string | null;
  imageUrl?: string | null;
  foodCount?: number;
}

export interface Food {
  id: string;
  name: string;
  description: string;
  price: number;
  categoryId: string;
  category?: { id: string; name: string };
  foodType: FoodType;
  imageUrl: string;
  rating: number;
  reviewCount: number;
  preparationTime: string;
  available: boolean;
  featured: boolean;
  createdAt: string;
  reviews?: Review[];
}

export interface CartItem {
  id: string;
  cartId: string;
  foodId: string;
  quantity: number;
  food: Food;
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  updatedAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  minOrderAmount: number;
  maxDiscount?: number | null;
  active: boolean;
  expiresAt?: string | null;
  _count?: { orders: number };
}

export interface OrderItem {
  id: string;
  orderId: string;
  foodId: string;
  foodName: string;
  foodImage: string;
  foodType: FoodType;
  price: number;
  quantity: number;
  subtotal: number;
  food?: Food;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  user?: { id: string; name: string; email: string; phone?: string | null };
  addressId?: string | null;
  deliveryAddressText: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: string;
  subtotal: number;
  deliveryFee: number;
  tax: number;
  discount: number;
  total: number;
  couponCode?: string | null;
  estimatedDeliveryMinutes: number;
  items: OrderItem[];
  reviews?: Review[];
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  userId: string;
  user?: { name: string; email?: string };
  foodId: string;
  food?: { id: string; name: string; imageUrl: string };
  orderId?: string | null;
  rating: number;
  comment?: string | null;
  userName: string;
  createdAt: string;
}
