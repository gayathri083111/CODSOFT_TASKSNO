import React, { useState, useEffect } from 'react';
import {
  Clock,
  ShoppingBag,
  RotateCcw,
  Star,
  ChevronRight,
  Truck,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Eye,
} from 'lucide-react';
import { Order, OrderItem } from '../../types/index.ts';
import { api } from '../../services/api.ts';
import { useAuth } from '../../context/AuthContext.tsx';
import { useCart } from '../../context/CartContext.tsx';
import { useToast } from '../../context/ToastContext.tsx';
import { VegBadge } from '../common/VegBadge.tsx';
import { FoodImage } from '../common/FoodImage.tsx';
import { OrderTrackerModal } from './OrderTrackerModal.tsx';
import { ReviewModal } from './ReviewModal.tsx';

interface OrderHistoryViewProps {
  onNavigateMenu: () => void;
}

export const OrderHistoryView: React.FC<OrderHistoryViewProps> = ({ onNavigateMenu }) => {
  const { user, openAuthModal } = useAuth();
  const { openCart, refreshCart } = useCart();
  const { showToast } = useToast();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Tracking modal state
  const [selectedOrderForTracking, setSelectedOrderForTracking] = useState<Order | null>(null);

  // Review modal state
  const [selectedItemForReview, setSelectedItemForReview] = useState<OrderItem | null>(null);
  const [selectedOrderIdForReview, setSelectedOrderIdForReview] = useState<string | undefined>();

  const loadOrders = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const res = await api.getCustomerOrders();
      setOrders(res.orders);
    } catch (err: any) {
      showToast(err.message || 'Failed to fetch orders', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="w-20 h-20 bg-amber-50 rounded-3xl flex items-center justify-center text-amber-600 mx-auto mb-4">
          <Clock className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-black text-stone-900 font-serif mb-2">
          Track & Review Past Orders
        </h2>
        <p className="text-stone-600 text-sm max-w-md mx-auto mb-6">
          Please log in to your account to view your past orders, real-time live order progress, and
          leave chef ratings.
        </p>
        <button
          onClick={() => openAuthModal('login')}
          className="py-3 px-8 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-amber-600/20 cursor-pointer"
        >
          Sign In
        </button>
      </div>
    );
  }

  const handleReorder = async (orderId: string) => {
    try {
      const res = await api.reorderItems(orderId);
      showToast(res.message, 'success');
      await refreshCart();
      openCart();
    } catch (err: any) {
      showToast(err.message || 'Failed to reorder items', 'error');
    }
  };

  const filteredOrders = orders.filter((order) => {
    if (statusFilter === 'ALL') return true;
    if (statusFilter === 'ACTIVE') {
      return ['PENDING', 'CONFIRMED', 'PREPARING', 'OUT_FOR_DELIVERY'].includes(order.status);
    }
    if (statusFilter === 'COMPLETED') return order.status === 'DELIVERED';
    if (statusFilter === 'CANCELLED') return order.status === 'CANCELLED';
    return true;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Delivered
          </span>
        );
      case 'PREPARING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold animate-pulse">
            <Clock className="w-3.5 h-3.5" />
            Preparing Food
          </span>
        );
      case 'OUT_FOR_DELIVERY':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold animate-pulse">
            <Truck className="w-3.5 h-3.5" />
            Out for Delivery
          </span>
        );
      case 'CONFIRMED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-bold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Confirmed
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold">
            <XCircle className="w-3.5 h-3.5" />
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-stone-100 text-stone-700 text-xs font-bold">
            <AlertCircle className="w-3.5 h-3.5" />
            Placed
          </span>
        );
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-200">
        <div>
          <h1 className="text-3xl font-black text-stone-900 font-serif tracking-tight">
            My Food Orders
          </h1>
          <p className="text-xs text-stone-600 mt-1">
            Track real-time cooking progress, view invoices, reorder favorites, and rate delivered
            dishes.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-1.5 bg-stone-100 p-1 rounded-xl">
          {[
            { id: 'ALL', label: 'All Orders' },
            { id: 'ACTIVE', label: 'Active / Cooking' },
            { id: 'COMPLETED', label: 'Delivered' },
            { id: 'CANCELLED', label: 'Cancelled' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                statusFilter === tab.id
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="py-20 text-center text-xs text-stone-600 font-semibold animate-pulse">
          Loading your order history...
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-3">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h3 className="font-bold text-stone-900 text-base mb-1">No orders found</h3>
          <p className="text-xs text-stone-600 max-w-sm mx-auto mb-5">
            You haven't placed any orders in this category yet. Explore our freshly cooked royal
            menu dishes!
          </p>
          <button
            onClick={onNavigateMenu}
            className="py-2.5 px-6 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-colors cursor-pointer"
          >
            Explore Menu
          </button>
        </div>
      ) : (
        <div className="space-y-6 pt-6">
          {filteredOrders.map((order) => {
            const isDelivered = order.status === 'DELIVERED';
            const isActive = ['PENDING', 'CONFIRMED', 'PREPARING', 'OUT_FOR_DELIVERY'].includes(
              order.status
            );

            return (
              <div
                key={order.id}
                className="bg-white rounded-3xl border border-stone-200/90 shadow-xs hover:shadow-md transition-shadow overflow-hidden"
              >
                {/* Order Top Bar */}
                <div className="p-5 bg-stone-50/70 border-b border-stone-200 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <div>
                      <span className="text-[10px] text-stone-600 uppercase font-bold tracking-wider block">
                        Order ID
                      </span>
                      <span className="font-mono font-bold text-stone-900 text-sm">
                        {order.orderNumber}
                      </span>
                    </div>

                    <div className="h-6 w-px bg-stone-300 hidden sm:block" />

                    <div>
                      <span className="text-[10px] text-stone-600 uppercase font-bold tracking-wider block">
                        Date Placed
                      </span>
                      <span className="text-xs font-semibold text-stone-700">
                        {new Date(order.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}{' '}
                        at{' '}
                        {new Date(order.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {getStatusBadge(order.status)}

                    {/* Action button: Track order */}
                    <button
                      onClick={() => setSelectedOrderForTracking(order)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
                        isActive
                          ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-xs'
                          : 'bg-stone-200 hover:bg-stone-300 text-stone-800'
                      }`}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>{isActive ? 'Track Live' : 'View Summary'}</span>
                    </button>
                  </div>
                </div>

                {/* Items in this Order */}
                <div className="p-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-3 rounded-2xl bg-stone-50/60 border border-stone-100"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0">
                            <FoodImage
                              src={item.foodImage}
                              alt={item.foodName}
                              aspectRatio="square"
                              foodType={item.foodType}
                            />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <VegBadge type={item.foodType} showText={false} />
                              <h4 className="font-bold text-xs text-stone-900 truncate">
                                {item.foodName}
                              </h4>
                            </div>
                            <p className="text-[11px] text-stone-600 mt-0.5">
                              Qty: {item.quantity} • ₹{item.price} each
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-1.5 shrink-0 ml-2">
                          <span className="font-bold text-xs text-stone-900">₹{item.subtotal}</span>

                          {/* Rate Dish button if delivered */}
                          {isDelivered && (
                            <button
                              onClick={() => {
                                setSelectedItemForReview(item);
                                setSelectedOrderIdForReview(order.id);
                              }}
                              className="px-2 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                            >
                              <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                              <span>Rate Dish</span>
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Order Footer summary row */}
                  <div className="mt-5 pt-4 border-t border-stone-100 flex flex-wrap items-center justify-between gap-3">
                    <div className="text-xs text-stone-600">
                      <span>Delivery To: </span>
                      <strong className="text-stone-800 font-semibold truncate max-w-xs inline-block align-bottom">
                        {order.deliveryAddressText.split(':')[1] || order.deliveryAddressText}
                      </strong>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className="text-[10px] text-stone-600 uppercase font-semibold block">
                          Total Paid
                        </span>
                        <span className="text-base font-black text-stone-900">₹{order.total}</span>
                      </div>

                      {/* Reorder Button */}
                      <button
                        onClick={() => handleReorder(order.id)}
                        className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Reorder</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tracking Modal */}
      {selectedOrderForTracking && (
        <OrderTrackerModal
          order={selectedOrderForTracking}
          onClose={() => setSelectedOrderForTracking(null)}
          onReorder={handleReorder}
        />
      )}

      {/* Review Modal */}
      {selectedItemForReview && (
        <ReviewModal
          item={selectedItemForReview}
          orderId={selectedOrderIdForReview}
          onClose={() => {
            setSelectedItemForReview(null);
            setSelectedOrderIdForReview(undefined);
          }}
          onReviewSubmitted={loadOrders}
        />
      )}
    </div>
  );
};
