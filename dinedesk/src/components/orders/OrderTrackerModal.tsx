import React, { useState, useEffect } from 'react';
import {
  X,
  CheckCircle2,
  Clock,
  MapPin,
  ShoppingBag,
  ChefHat,
  Truck,
  PackageCheck,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';
import { Order, OrderStatus } from '../../types/index.ts';
import { api } from '../../services/api.ts';
import { FoodImage } from '../common/FoodImage.tsx';
import { VegBadge } from '../common/VegBadge.tsx';

interface OrderTrackerModalProps {
  order: Order | null;
  onClose: () => void;
  onReorder?: (orderId: string) => void;
}

const STATUS_STEPS: { status: OrderStatus; label: string; icon: any; desc: string }[] = [
  {
    status: 'PENDING',
    label: 'Order Placed',
    icon: ShoppingBag,
    desc: 'Your order has been recorded in our restaurant kitchen queue.',
  },
  {
    status: 'CONFIRMED',
    label: 'Kitchen Confirmed',
    icon: CheckCircle2,
    desc: 'Our head chef has accepted and scheduled your order.',
  },
  {
    status: 'PREPARING',
    label: 'Cooking Fresh',
    icon: ChefHat,
    desc: 'Ingredients are being chopped and dishes freshly prepared on the stove.',
  },
  {
    status: 'OUT_FOR_DELIVERY',
    label: 'Out for Delivery',
    icon: Truck,
    desc: 'Our delivery partner is en route with your insulated thermal food bag.',
  },
  {
    status: 'DELIVERED',
    label: 'Delivered',
    icon: PackageCheck,
    desc: 'Order delivered safely. Enjoy your hot, authentic meal!',
  },
];

export const OrderTrackerModal: React.FC<OrderTrackerModalProps> = ({
  order: initialOrder,
  onClose,
  onReorder,
}) => {
  const [currentOrder, setCurrentOrder] = useState<Order | null>(initialOrder);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    setCurrentOrder(initialOrder);
  }, [initialOrder]);

  // Polling / Refresh order status
  const refreshStatus = async () => {
    if (!currentOrder) return;
    setIsRefreshing(true);
    try {
      const res = await api.getOrderById(currentOrder.id);
      setCurrentOrder(res.order);
    } catch (err) {
      console.error('Failed to poll order status:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  if (!currentOrder) return null;

  const currentStatus = currentOrder.status;
  const isCancelled = currentStatus === 'CANCELLED';

  const getStepIndex = (status: OrderStatus) => {
    switch (status) {
      case 'PENDING':
        return 0;
      case 'CONFIRMED':
        return 1;
      case 'PREPARING':
        return 2;
      case 'OUT_FOR_DELIVERY':
        return 3;
      case 'DELIVERED':
        return 4;
      default:
        return -1;
    }
  };

  const currentStepIdx = getStepIndex(currentStatus);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/65 backdrop-blur-xs animate-in fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-8">
        {/* Tracker Header */}
        <div className="bg-gradient-to-r from-amber-600 to-orange-600 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
            aria-label="Close tracker"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-wrap items-center justify-between gap-3 pr-10">
            <div>
              <span className="px-2.5 py-1 rounded-md bg-white/20 text-xs font-black tracking-wider uppercase">
                Order Tracking
              </span>
              <h2 className="text-2xl font-black mt-2 font-mono tracking-tight">
                {currentOrder.orderNumber}
              </h2>
            </div>

            <button
              onClick={refreshStatus}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-xs font-bold transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Refresh Status</span>
            </button>
          </div>

          {!isCancelled && currentStatus !== 'DELIVERED' && (
            <div className="mt-4 flex items-center gap-2 bg-black/20 backdrop-blur-xs px-3.5 py-2 rounded-xl text-xs">
              <Clock className="w-4 h-4 text-amber-300" />
              <span>
                Estimated Delivery in:{' '}
                <strong className="text-amber-200 text-sm">
                  ~{currentOrder.estimatedDeliveryMinutes} Minutes
                </strong>
              </span>
            </div>
          )}
        </div>

        <div className="p-6 sm:p-8 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Status Progression Timeline */}
          {isCancelled ? (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-center gap-3 text-rose-800">
              <AlertTriangle className="w-6 h-6 text-rose-600 shrink-0" />
              <div>
                <h4 className="font-bold text-sm">This order has been cancelled</h4>
                <p className="text-xs text-rose-600">
                  Please reach out to support or place a new order.
                </p>
              </div>
            </div>
          ) : (
            <div className="py-2">
              <div className="relative">
                {/* Connecting horizontal line for md screens */}
                <div className="hidden sm:block absolute top-5 left-8 right-8 h-1 bg-stone-200 -z-0">
                  <div
                    className="h-full bg-amber-600 transition-all duration-500"
                    style={{
                      width: `${(Math.max(0, currentStepIdx) / (STATUS_STEPS.length - 1)) * 100}%`,
                    }}
                  />
                </div>

                {/* Steps */}
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 relative z-10">
                  {STATUS_STEPS.map((step, idx) => {
                    const isDone = idx <= currentStepIdx;
                    const isCurrent = idx === currentStepIdx;
                    const StepIcon = step.icon;

                    return (
                      <div
                        key={step.status}
                        className={`flex sm:flex-col items-center sm:text-center gap-3 sm:gap-2 p-2 rounded-xl transition-all ${
                          isCurrent
                            ? 'bg-amber-50/80 sm:bg-transparent'
                            : 'opacity-70 hover:opacity-100'
                        }`}
                      >
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition-all shrink-0 ${
                            isCurrent
                              ? 'bg-amber-600 text-white ring-4 ring-amber-100 shadow-md scale-110'
                              : isDone
                              ? 'bg-emerald-600 text-white'
                              : 'bg-stone-200 text-stone-600'
                          }`}
                        >
                          <StepIcon className="w-5 h-5" />
                        </div>
                        <div>
                          <p
                            className={`text-xs font-bold leading-tight ${
                              isCurrent
                                ? 'text-amber-700'
                                : isDone
                                ? 'text-stone-900'
                                : 'text-stone-600'
                            }`}
                          >
                            {step.label}
                          </p>
                          <p className="text-[10px] text-stone-600 sm:hidden mt-0.5">{step.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Delivery Details Card */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 text-xs space-y-1.5">
              <div className="flex items-center gap-1.5 text-stone-700 font-bold uppercase text-[11px] mb-1">
                <MapPin className="w-3.5 h-3.5 text-amber-600" />
                <span>Delivery Destination</span>
              </div>
              <p className="font-semibold text-stone-900">{currentOrder.customerName}</p>
              <p className="text-stone-600 leading-relaxed">
                {currentOrder.deliveryAddressText}
              </p>
              <p className="text-stone-600 pt-1">Phone: {currentOrder.customerPhone}</p>
            </div>

            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 text-xs space-y-1.5">
              <div className="flex items-center gap-1.5 text-stone-700 font-bold uppercase text-[11px] mb-1">
                <ShoppingBag className="w-3.5 h-3.5 text-amber-600" />
                <span>Payment & Order Summary</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-600">Payment:</span>
                <span className="font-bold text-stone-900">
                  {currentOrder.paymentMethod === 'COD' ? 'Cash on Delivery' : 'Online Paid'} (
                  {currentOrder.paymentStatus})
                </span>
              </div>
              {currentOrder.couponCode && (
                <div className="flex justify-between text-emerald-700">
                  <span>Coupon Applied:</span>
                  <span className="font-bold">{currentOrder.couponCode}</span>
                </div>
              )}
              <div className="flex justify-between pt-1 border-t border-stone-200">
                <span className="font-bold text-stone-800">Total Amount:</span>
                <span className="text-base font-black text-amber-600">₹{currentOrder.total}</span>
              </div>
            </div>
          </div>

          {/* Ordered Food Items List with Thumbnails */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700 mb-3">
              Dishes in this Order ({currentOrder.items.length})
            </h4>
            <div className="space-y-2.5">
              {currentOrder.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-2xl border border-stone-200 bg-white"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0">
                      <FoodImage
                        src={item.foodImage}
                        alt={item.foodName}
                        aspectRatio="square"
                        foodType={item.foodType}
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <VegBadge type={item.foodType} showText={false} />
                        <h5 className="font-bold text-xs text-stone-900">{item.foodName}</h5>
                      </div>
                      <p className="text-[11px] text-stone-600">
                        ₹{item.price} × {item.quantity}
                      </p>
                    </div>
                  </div>
                  <span className="font-bold text-xs text-stone-900">₹{item.subtotal}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tracker Footer */}
        <div className="p-4 border-t border-stone-200 bg-stone-50 flex items-center justify-between">
          <p className="text-xs text-stone-600">
            Ordered on {new Date(currentOrder.createdAt).toLocaleDateString()} at{' '}
            {new Date(currentOrder.createdAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>

          <div className="flex items-center gap-2">
            {onReorder && (
              <button
                onClick={() => onReorder(currentOrder.id)}
                className="px-4 py-2 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-bold transition-colors cursor-pointer"
              >
                Reorder Items
              </button>
            )}
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
