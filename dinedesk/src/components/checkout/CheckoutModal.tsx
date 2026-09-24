import React, { useState, useEffect } from 'react';
import {
  X,
  MapPin,
  Plus,
  Phone,
  CreditCard,
  Banknote,
  CheckCircle2,
  ShieldCheck,
  Building,
  Home as HomeIcon,
} from 'lucide-react';
import { useCart } from '../../context/CartContext.tsx';
import { useAuth } from '../../context/AuthContext.tsx';
import { useToast } from '../../context/ToastContext.tsx';
import { api } from '../../services/api.ts';
import { Address, Order } from '../../types/index.ts';
import { FoodImage } from '../common/FoodImage.tsx';
import { VegBadge } from '../common/VegBadge.tsx';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderSuccess: (order: Order) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  onOrderSuccess,
}) => {
  const { user } = useAuth();
  const { items, subtotal, deliveryFee, tax, discount, total, appliedCoupon, refreshCart } = useCart();
  const { showToast } = useToast();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);

  // New address form state
  const [newLabel, setNewLabel] = useState('Home');
  const [newStreet, setNewStreet] = useState('');
  const [newCity, setNewCity] = useState('Hyderabad');
  const [newState, setNewState] = useState('Telangana');
  const [newPostalCode, setNewPostalCode] = useState('500081');
  const [contactPhone, setContactPhone] = useState(user?.phone || '+91 91234 56789');

  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'ONLINE_MOCK'>('COD');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      api
        .getAddresses()
        .then((res) => {
          setAddresses(res.addresses);
          const defaultAddr = res.addresses.find((a) => a.isDefault) || res.addresses[0];
          if (defaultAddr) {
            setSelectedAddressId(defaultAddr.id);
            setContactPhone(defaultAddr.phone || user.phone || '');
          } else {
            setIsAddingNewAddress(true);
          }
        })
        .catch(() => {});
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleCreateAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStreet.trim()) {
      showToast('Please enter your street address', 'error');
      return;
    }

    try {
      const res = await api.addAddress({
        label: newLabel,
        street: newStreet,
        city: newCity,
        state: newState,
        postalCode: newPostalCode,
        phone: contactPhone,
        isDefault: addresses.length === 0,
      });

      setAddresses((prev) => [res.address, ...prev]);
      setSelectedAddressId(res.address.id);
      setIsAddingNewAddress(false);
      showToast('Address saved successfully!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to save address', 'error');
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId && !isAddingNewAddress) {
      showToast('Please select a delivery address', 'error');
      return;
    }

    if (!contactPhone.trim()) {
      showToast('Please provide a contact phone number', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      let finalAddressText = '';
      const selected = addresses.find((a) => a.id === selectedAddressId);
      if (selected) {
        finalAddressText = `${selected.label}: ${selected.street}, ${selected.city}, ${selected.state} - ${selected.postalCode} (Ph: ${contactPhone})`;
      } else {
        finalAddressText = `${newStreet}, ${newCity}, ${newState} - ${newPostalCode} (Ph: ${contactPhone})`;
      }

      const res = await api.createOrder({
        addressId: selectedAddressId || undefined,
        deliveryAddressText: finalAddressText,
        customerName: user?.name,
        customerPhone: contactPhone,
        paymentMethod,
        couponCode: appliedCoupon?.code,
      });

      showToast('Order confirmed! Tracking live preparation...', 'success');
      await refreshCart();
      onClose();
      onOrderSuccess(res.order);
    } catch (err: any) {
      showToast(err.message || 'Failed to place order', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs animate-in fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-8">
        {/* Modal Header */}
        <div className="p-6 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-stone-900 font-serif">Checkout & Delivery</h2>
            <p className="text-xs text-stone-600">
              Confirm your delivery address and choose payment method.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-stone-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 sm:p-8 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Section 1: Delivery Address */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-amber-600" />
                <span>Delivery Address</span>
              </h3>
              {!isAddingNewAddress && (
                <button
                  onClick={() => setIsAddingNewAddress(true)}
                  className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add New Address</span>
                </button>
              )}
            </div>

            {/* Address List */}
            {!isAddingNewAddress && addresses.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {addresses.map((addr) => {
                  const isSelected = selectedAddressId === addr.id;
                  return (
                    <div
                      key={addr.id}
                      onClick={() => setSelectedAddressId(addr.id)}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-amber-500 bg-amber-50/50 shadow-xs'
                          : 'border-stone-200 hover:border-stone-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5">
                          {addr.label === 'Home' ? (
                            <HomeIcon className="w-4 h-4 text-amber-600" />
                          ) : (
                            <Building className="w-4 h-4 text-amber-600" />
                          )}
                          <span className="font-bold text-xs text-stone-900">{addr.label}</span>
                        </div>
                        {isSelected && (
                          <CheckCircle2 className="w-4 h-4 text-amber-600 fill-amber-100" />
                        )}
                      </div>
                      <p className="text-xs text-stone-600 line-clamp-2">{addr.street}</p>
                      <p className="text-[11px] text-stone-600 mt-1">
                        {addr.city}, {addr.state} - {addr.postalCode}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}

            {/* New Address Form */}
            {isAddingNewAddress && (
              <form
                onSubmit={handleCreateAddress}
                className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3"
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold text-stone-800">Add New Address</span>
                  {addresses.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setIsAddingNewAddress(false)}
                      className="text-xs text-stone-600 hover:text-stone-800 underline"
                    >
                      Cancel
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {['Home', 'Office', 'Other'].map((lbl) => (
                    <button
                      key={lbl}
                      type="button"
                      onClick={() => setNewLabel(lbl)}
                      className={`py-1.5 text-xs font-semibold rounded-lg border ${
                        newLabel === lbl
                          ? 'bg-amber-600 text-white border-amber-600'
                          : 'bg-white text-stone-700 border-stone-300'
                      }`}
                    >
                      {lbl}
                    </button>
                  ))}
                </div>

                <div>
                  <input
                    type="text"
                    required
                    placeholder="House/Flat No., Building, Street Name"
                    value={newStreet}
                    onChange={(e) => setNewStreet(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    required
                    placeholder="City"
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    className="px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs"
                  />
                  <input
                    type="text"
                    required
                    placeholder="State"
                    value={newState}
                    onChange={(e) => setNewState(e.target.value)}
                    className="px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Pincode"
                    value={newPostalCode}
                    onChange={(e) => setNewPostalCode(e.target.value)}
                    className="px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs"
                  />
                </div>

                <button
                  type="submit"
                  className="py-2 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  Save Address
                </button>
              </form>
            )}
          </div>

          {/* Section 2: Contact Phone */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5 flex items-center gap-1.5">
              <Phone className="w-4 h-4 text-amber-600" />
              <span>Contact Phone for Delivery Updates</span>
            </label>
            <input
              type="tel"
              required
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              placeholder="+91 98765 43210"
              className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Section 3: Payment Method */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700 mb-3 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              <span>Payment Options</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Cash on Delivery */}
              <div
                onClick={() => setPaymentMethod('COD')}
                className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                  paymentMethod === 'COD'
                    ? 'border-amber-500 bg-amber-50/50 shadow-xs'
                    : 'border-stone-200 bg-white hover:border-stone-300'
                }`}
              >
                <Banknote className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-xs text-stone-900">Cash on Delivery</h4>
                    {paymentMethod === 'COD' && (
                      <CheckCircle2 className="w-4 h-4 text-amber-600 fill-amber-100" />
                    )}
                  </div>
                  <p className="text-[11px] text-stone-600 mt-0.5">
                    Pay in cash or scan QR upon physical delivery at your door.
                  </p>
                </div>
              </div>

              {/* Online Mock Payment */}
              <div
                onClick={() => setPaymentMethod('ONLINE_MOCK')}
                className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                  paymentMethod === 'ONLINE_MOCK'
                    ? 'border-amber-500 bg-amber-50/50 shadow-xs'
                    : 'border-stone-200 bg-white hover:border-stone-300'
                }`}
              >
                <CreditCard className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
                <div>
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-xs text-stone-900">Instant Online Simulation</h4>
                    {paymentMethod === 'ONLINE_MOCK' && (
                      <CheckCircle2 className="w-4 h-4 text-amber-600 fill-amber-100" />
                    )}
                  </div>
                  <p className="text-[11px] text-stone-600 mt-0.5">
                    Instant UPI / Card simulated approval for live demo order testing.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Items in Order */}
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700 mb-3">
              Order Items ({items.length})
            </h4>
            <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
              {items.map((it) => (
                <div key={it.id} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 truncate pr-2">
                    <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0">
                      <FoodImage
                        src={it.food.imageUrl}
                        alt={it.food.name}
                        aspectRatio="square"
                        foodType={it.food.foodType}
                      />
                    </div>
                    <VegBadge type={it.food.foodType} showText={false} />
                    <span className="text-stone-800 font-medium truncate">{it.food.name}</span>
                    <span className="text-stone-600">x{it.quantity}</span>
                  </div>
                  <span className="font-bold text-stone-900 shrink-0">
                    ₹{it.food.price * it.quantity}
                  </span>
                </div>
              ))}
            </div>

            {/* Price summary line */}
            <div className="mt-3 pt-3 border-t border-stone-200 flex items-center justify-between text-xs">
              <span className="text-stone-600">Grand Total Payable:</span>
              <span className="text-base font-black text-amber-600">₹{total}</span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-5 border-t border-stone-200 bg-white flex items-center justify-between">
          <div>
            <p className="text-[11px] text-stone-600 font-medium">Payment method:</p>
            <p className="text-xs font-bold text-stone-900">
              {paymentMethod === 'COD' ? 'Cash on Delivery (COD)' : 'Instant Online Payment'}
            </p>
          </div>

          <button
            onClick={handlePlaceOrder}
            disabled={isSubmitting}
            className="px-8 py-3.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm shadow-lg shadow-amber-600/25 transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <span>Place Order • ₹{total}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
