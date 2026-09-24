import React, { useState } from 'react';
import {
  X,
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  Tag,
  ArrowRight,
  Sparkles,
  Check,
} from 'lucide-react';
import { useCart } from '../../context/CartContext.tsx';
import { VegBadge } from '../common/VegBadge.tsx';
import { FoodImage } from '../common/FoodImage.tsx';

interface CartDrawerProps {
  onProceedToCheckout: () => void;
  onExploreMenu: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  onProceedToCheckout,
  onExploreMenu,
}) => {
  const {
    isCartOpen,
    closeCart,
    items,
    subtotal,
    deliveryFee,
    tax,
    discount,
    total,
    appliedCoupon,
    updateQuantity,
    removeFromCart,
    clearCart,
    applyCoupon,
    removeCoupon,
  } = useCart();

  const [couponInput, setCouponInput] = useState('');
  const [isApplying, setIsApplying] = useState(false);

  if (!isCartOpen) return null;

  const handleApplyCoupon = async (codeToApply?: string) => {
    const code = codeToApply || couponInput;
    if (!code.trim()) return;
    setIsApplying(true);
    const success = await applyCoupon(code.trim());
    if (success) {
      setCouponInput('');
    }
    setIsApplying(false);
  };

  const availableCoupons = [
    { code: 'DINEDESK10', desc: '10% OFF above ₹299' },
    { code: 'WELCOME50', desc: 'Flat ₹50 OFF on ₹349' },
    { code: 'FEAST20', desc: '20% OFF above ₹799' },
    { code: 'BIRYANI100', desc: 'Flat ₹100 OFF on ₹599' },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in">
      {/* Backdrop */}
      <div
        onClick={closeCart}
        className="absolute inset-0 bg-stone-950/60 backdrop-blur-xs transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col border-l border-stone-200">
          {/* Drawer Header */}
          <div className="p-5 border-b border-stone-100 flex items-center justify-between bg-stone-50/70">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-stone-900 text-base">Your Food Cart</h3>
                <p className="text-xs text-stone-600">
                  {items.length} {items.length === 1 ? 'item' : 'items'} selected
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {items.length > 0 && (
                <button
                  onClick={clearCart}
                  className="p-1.5 text-stone-600 hover:text-rose-600 text-xs font-semibold rounded-lg hover:bg-stone-100 transition-colors"
                  title="Clear Cart"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={closeCart}
                className="p-2 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors"
                aria-label="Close cart"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Drawer Content */}
          {items.length === 0 ? (
            /* Empty Cart View */
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <div className="w-24 h-24 rounded-3xl bg-amber-50 flex items-center justify-center text-amber-500 mb-4 shadow-inner">
                <ShoppingBag className="w-12 h-12" />
              </div>
              <h4 className="text-lg font-bold text-stone-900 mb-1">Your cart is empty</h4>
              <p className="text-xs text-stone-600 max-w-xs mb-6">
                Looks like you haven't added any delicious food yet. Check out our authentic
                dishes!
              </p>
              <button
                onClick={() => {
                  closeCart();
                  onExploreMenu();
                }}
                className="py-3 px-6 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-amber-600/20 transition-all cursor-pointer"
              >
                Explore Menu
              </button>
            </div>
          ) : (
            /* Cart Items & Summary */
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {/* Free delivery prompt banner */}
              {subtotal < 500 ? (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-900 text-xs font-medium flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    Add <span className="font-bold">₹{500 - subtotal}</span> more for{' '}
                    <span className="font-bold text-emerald-700">FREE delivery</span>!
                  </span>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-medium flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    🎉 Yay! You have unlocked <span className="font-bold">FREE delivery</span>.
                  </span>
                </div>
              )}

              {/* Items List */}
              <div className="space-y-3">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-3 p-3 rounded-2xl border border-stone-100 bg-stone-50/50 hover:bg-white transition-all shadow-2xs"
                  >
                    {/* Thumbnail */}
                    <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0">
                      <FoodImage
                        src={item.food.imageUrl}
                        alt={item.food.name}
                        aspectRatio="square"
                        foodType={item.food.foodType}
                        className="w-full h-full"
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      <div>
                        <div className="flex items-start justify-between gap-1">
                          <h4 className="font-bold text-xs text-stone-900 truncate">
                            {item.food.name}
                          </h4>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-stone-400 hover:text-rose-500 transition-colors p-0.5"
                            aria-label="Remove item"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <VegBadge type={item.food.foodType} showText={false} />
                          <span className="text-[11px] text-stone-600">₹{item.food.price} each</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        {/* Stepper */}
                        <div className="flex items-center border border-stone-200 rounded-lg bg-white overflow-hidden text-xs">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1 hover:bg-stone-100 text-stone-600"
                            aria-label="Decrease"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-6 text-center font-bold text-stone-800 text-xs">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1 hover:bg-stone-100 text-stone-600"
                            aria-label="Increase"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Line Subtotal */}
                        <span className="text-xs font-black text-stone-900">
                          ₹{item.food.price * item.quantity}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Coupon Section */}
              <div className="pt-2">
                <label className="block text-xs font-bold text-stone-700 mb-1.5">
                  Have a Promo Code?
                </label>
                {appliedCoupon ? (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                    <div className="flex items-center gap-1.5">
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span>
                        <span className="font-extrabold">{appliedCoupon.code}</span> applied: Saved ₹
                        {discount}!
                      </span>
                    </div>
                    <button
                      onClick={removeCoupon}
                      className="text-emerald-700 hover:text-emerald-900 text-xs underline font-bold"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Tag className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-3" />
                        <input
                          type="text"
                          value={couponInput}
                          onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                          placeholder="Enter Coupon Code"
                          className="w-full pl-8 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs uppercase font-bold focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                        />
                      </div>
                      <button
                        onClick={() => handleApplyCoupon()}
                        disabled={isApplying || !couponInput.trim()}
                        className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
                      >
                        {isApplying ? '...' : 'Apply'}
                      </button>
                    </div>

                    {/* Quick clickable coupon suggestions */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {availableCoupons.map((c) => (
                        <button
                          key={c.code}
                          type="button"
                          onClick={() => handleApplyCoupon(c.code)}
                          className="px-2 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/80 text-[10px] font-semibold transition-colors flex items-center gap-1"
                        >
                          <Tag className="w-2.5 h-2.5 text-amber-600" />
                          <span>{c.code}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Bill Details */}
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-2 text-xs">
                <h4 className="font-bold text-stone-900 uppercase text-[11px] tracking-wider mb-2">
                  Bill Summary
                </h4>

                <div className="flex justify-between text-stone-600">
                  <span>Item Subtotal</span>
                  <span className="font-semibold text-stone-900">₹{subtotal}</span>
                </div>

                <div className="flex justify-between text-stone-600">
                  <span>Delivery Fee</span>
                  {deliveryFee === 0 ? (
                    <span className="text-emerald-600 font-bold uppercase text-[11px]">FREE</span>
                  ) : (
                    <span className="font-semibold text-stone-900">₹{deliveryFee}</span>
                  )}
                </div>

                <div className="flex justify-between text-stone-600">
                  <span>Restaurant GST (5%) & Packaging</span>
                  <span className="font-semibold text-stone-900">₹{tax}</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Coupon Discount</span>
                    <span>-₹{discount}</span>
                  </div>
                )}

                <div className="pt-2 border-t border-stone-200 flex justify-between items-center text-sm font-black text-stone-900">
                  <span>To Pay</span>
                  <span className="text-base text-amber-600">₹{total}</span>
                </div>
              </div>
            </div>
          )}

          {/* Drawer Footer CTA */}
          {items.length > 0 && (
            <div className="p-4 border-t border-stone-200 bg-white">
              <button
                onClick={() => {
                  closeCart();
                  onProceedToCheckout();
                }}
                className="w-full py-3.5 px-4 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm shadow-lg shadow-amber-600/25 transition-all flex items-center justify-between cursor-pointer"
              >
                <div className="flex flex-col text-left leading-tight">
                  <span className="text-[11px] font-medium text-amber-100">Total payable</span>
                  <span className="text-base font-black">₹{total}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
