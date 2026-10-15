import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { Navbar } from '../../components/Navbar';
import { Sidebar } from '../../components/Sidebar';
import { RazorpayModal } from '../../components/RazorpayModal';
import {
  ShoppingBag,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Trash2,
  CreditCard,
  ShieldCheck,
  QrCode
} from 'lucide-react';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export const StudentCheckout: React.FC = () => {
  const navigate = useNavigate();
  const { cart, removeFromCart, updateCartQuantity, clearCart, cartTotal, user } = useAuth();
  
  const [recommendations, setRecommendations] = useState<any>(null);
  const [selectedSlotId, setSelectedSlotId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [ordering, setOrdering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'RAZORPAY' | 'CASH'>('RAZORPAY');

  const [showRzpModal, setShowRzpModal] = useState(false);
  const [activeRzpOrder, setActiveRzpOrder] = useState<any>(null);

  const [allSlots, setAllSlots] = useState<any[]>([]);

  useEffect(() => {
    if (cart.length > 0) {
      fetchRecommendations();
    }
  }, [cart]);

  const fetchRecommendations = async () => {
    setLoading(true);
    setError(null);
    try {
      const itemIds = cart.map((c) => c.menuItem.id);
      const [recRes, slotsRes] = await Promise.allSettled([
        api.post('/pickup-slots/recommend', { item_ids: itemIds }),
        api.get('/pickup-slots')
      ]);

      let availableSlots: any[] = [];
      if (slotsRes.status === 'fulfilled' && Array.isArray(slotsRes.value.data)) {
        availableSlots = slotsRes.value.data.filter((s: any) => s.is_active && !s.is_full);
        setAllSlots(availableSlots);
      }

      if (recRes.status === 'fulfilled' && recRes.value.data) {
        setRecommendations(recRes.value.data);
        if (recRes.value.data.recommended_slot) {
          setSelectedSlotId(recRes.value.data.recommended_slot.slot_id);
        } else if (availableSlots.length > 0) {
          setSelectedSlotId(availableSlots[0].id);
        }
      } else if (availableSlots.length > 0) {
        setSelectedSlotId(availableSlots[0].id);
      }
    } catch (err: any) {
      console.warn('Slot recommendation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInitiatePayment = async () => {
    if (!selectedSlotId) {
      setError('Please select a pickup slot to continue.');
      return;
    }

    setOrdering(true);
    setError(null);

    try {
      const itemsPayload = cart.map((c) => ({
        menu_item_id: c.menuItem.id,
        quantity: c.quantity,
      }));

      if (paymentMethod === 'RAZORPAY') {
        const rzpRes = await api.post('/orders/razorpay-order', {
          pickup_slot_id: selectedSlotId,
          items: itemsPayload,
          notes: notes,
        });

        const rzpData = rzpRes.data;
        setActiveRzpOrder(rzpData);

        // Launch humanized Razorpay & QR Scanner modal
        setShowRzpModal(true);
      } else {
        const res = await api.post('/orders', {
          pickup_slot_id: selectedSlotId,
          items: itemsPayload,
          notes: notes,
          payment_method: 'CASH_COUNTER'
        });
        clearCart();
        navigate('/student/orders', { state: { newOrder: res.data } });
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to initiate payment.');
    } finally {
      setOrdering(false);
    }
  };

  const completePaymentVerification = async (paymentDetails: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) => {
    try {
      const verifyRes = await api.post('/orders/verify-razorpay-payment', {
        razorpay_order_id: paymentDetails.razorpay_order_id,
        razorpay_payment_id: paymentDetails.razorpay_payment_id,
        razorpay_signature: paymentDetails.razorpay_signature,
        pickup_slot_id: selectedSlotId,
        items: cart.map((c) => ({
          menu_item_id: c.menuItem.id,
          quantity: c.quantity,
        })),
        notes: notes,
      });

      clearCart();
      setShowRzpModal(false);
      navigate('/student/orders', { state: { newOrder: verifyRes.data } });
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Razorpay payment verification failed.');
    }
  };

  const tax = roundVal(cartTotal * 0.05);
  const grandTotal = roundVal(cartTotal + tax);

  function roundVal(val: number) {
    return Math.round(val * 100) / 100;
  }

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col font-sans">
      <Navbar />

      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-6 sm:p-8 max-w-5xl">
          
          <h1 className="text-2xl font-serif font-bold text-white tracking-tight mb-2 flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-amber-400" /> Checkout & Pickup Scheduling
          </h1>
          <p className="text-xs text-stone-400 mb-8 font-light">
            Smart timetable scheduling evaluates class break windows, kitchen workload, and recipe inventory.
          </p>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-950/80 border border-red-800 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" /> {error}
            </div>
          )}

          {cart.length === 0 ? (
            <div className="p-12 bg-stone-900 border border-stone-800 rounded-3xl text-center shadow-xl">
              <ShoppingBag className="w-12 h-12 text-stone-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-white">Your Cart is Empty</h3>
              <p className="text-xs text-stone-400 mt-1">Please select items from the menu before checking out.</p>
              <button
                onClick={() => navigate('/student/menu')}
                className="mt-4 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-extrabold text-xs rounded-full transition shadow-md"
              >
                Browse Cafe Menu
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              <div className="lg:col-span-2 space-y-8">
                
                {/* Cart Items Summary */}
                <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 shadow-xl">
                  <h3 className="font-serif font-bold text-white text-base mb-4">Cart Summary</h3>
                  <div className="space-y-3">
                    {cart.map((c) => (
                      <div key={c.menuItem.id} className="flex items-center justify-between p-3 rounded-2xl bg-stone-950 border border-stone-800 text-xs">
                        <div>
                          <span className="font-bold text-white block">{c.menuItem.name}</span>
                          <span className="text-stone-400">₹{c.menuItem.price} each</span>
                        </div>

                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-1.5 bg-stone-900 border border-stone-800 rounded-xl px-2 py-1">
                            <button
                              onClick={() => updateCartQuantity(c.menuItem.id, c.quantity - 1)}
                              className="text-stone-400 hover:text-white px-1 font-bold"
                            >
                              -
                            </button>
                            <span className="font-bold text-white px-1">{c.quantity}</span>
                            <button
                              onClick={() => updateCartQuantity(c.menuItem.id, c.quantity + 1)}
                              className="text-stone-400 hover:text-white px-1 font-bold"
                            >
                              +
                            </button>
                          </div>

                          <span className="font-bold text-amber-400 w-14 text-right">₹{roundVal(c.menuItem.price * c.quantity)}</span>

                          <button
                            onClick={() => removeFromCart(c.menuItem.id)}
                            className="text-stone-500 hover:text-red-400 p-1 transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommended Pickup Slot */}
                <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 shadow-xl">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-serif font-bold text-white text-base flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-amber-400" /> Optimal Pickup Window
                    </h3>
                    <span className="text-xs text-stone-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-stone-500" /> Prep Required: {recommendations?.prep_time_required_mins || 15} mins
                    </span>
                  </div>

                  {loading ? (
                    <div className="p-8 text-center text-xs text-stone-400 animate-pulse">
                      Evaluating student availability + food prep time + kitchen workload + ingredient stock...
                    </div>
                  ) : recommendations?.recommended_slot ? (
                    <div className="space-y-4">
                      
                      <div
                        onClick={() => setSelectedSlotId(recommendations.recommended_slot.slot_id)}
                        className={`p-5 rounded-2xl border cursor-pointer transition ${
                          selectedSlotId === recommendations.recommended_slot.slot_id
                            ? 'bg-amber-950/60 border-amber-500 ring-2 ring-amber-500/40 shadow-xl'
                            : 'bg-stone-950 border-stone-800 hover:border-amber-500/50'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="inline-block px-2.5 py-0.5 rounded-full bg-amber-500 text-stone-950 font-black text-[10px] uppercase mb-2">
                              Schedule Aligned
                            </span>
                            <h4 className="text-xl font-extrabold text-white">
                              {recommendations.recommended_slot.start_time} – {recommendations.recommended_slot.end_time}
                            </h4>
                          </div>
                          <CheckCircle2 className={`w-6 h-6 ${selectedSlotId === recommendations.recommended_slot.slot_id ? 'text-amber-400' : 'text-stone-600'}`} />
                        </div>

                        <p className="text-xs text-amber-200/90 mt-3 leading-relaxed">
                          {recommendations.recommended_slot.reason}
                        </p>
                      </div>

                      {recommendations.alternative_slots?.length > 0 && (
                        <div>
                          <span className="text-xs font-semibold text-stone-400 block mb-2">Alternative Feasible Slots</span>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {recommendations.alternative_slots.slice(0, 6).map((alt: any) => (
                              <button
                                key={alt.slot_id}
                                type="button"
                                onClick={() => setSelectedSlotId(alt.slot_id)}
                                className={`p-3 rounded-xl border text-left text-xs transition ${
                                  selectedSlotId === alt.slot_id
                                    ? 'bg-amber-950/80 border-amber-500 text-white font-bold'
                                    : 'bg-stone-950 border-stone-800 text-stone-300 hover:bg-stone-900'
                                }`}
                              >
                                <span className="block font-bold text-white">{alt.start_time} - {alt.end_time}</span>
                                <span className="text-[10px] text-stone-400">{alt.available_capacity} slots left</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                    </div>
                  ) : allSlots.length > 0 ? (
                    <div>
                      <span className="text-xs font-semibold text-stone-300 block mb-2">Available Daily Pickup Windows</span>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {allSlots.slice(0, 8).map((slot: any) => (
                          <button
                            key={slot.id}
                            type="button"
                            onClick={() => setSelectedSlotId(slot.id)}
                            className={`p-3 rounded-xl border text-left text-xs transition ${
                              selectedSlotId === slot.id
                                ? 'bg-amber-950/80 border-amber-500 text-white font-bold ring-1 ring-amber-500'
                                : 'bg-stone-950 border-stone-800 text-stone-300 hover:bg-stone-900'
                            }`}
                          >
                            <span className="block font-bold text-white">{slot.start_time} - {slot.end_time}</span>
                            <span className="text-[10px] text-amber-400">{slot.available_capacity} slots available</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 text-xs text-amber-300">
                      Standard Express Pickup (15 min window from payment)
                    </div>
                  )}

                </div>

              </div>

              {/* Sidebar Payment Box */}
              <div className="space-y-6">
                <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 shadow-xl sticky top-24">
                  
                  <h3 className="font-serif font-bold text-white text-base mb-3 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-amber-400" /> Payment Options
                  </h3>

                  {/* Payment Method Selector (WITHOUT "RECOMMENDED" text tag as requested) */}
                  <div className="space-y-2 mb-4">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('RAZORPAY')}
                      className={`w-full p-3 rounded-xl border text-left flex items-center justify-between text-xs transition ${
                        paymentMethod === 'RAZORPAY'
                          ? 'bg-amber-950/80 border-amber-500 text-white font-bold'
                          : 'bg-stone-950 border-stone-800 text-stone-400'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <QrCode className="w-4 h-4 text-amber-400" />
                        <span>Razorpay & UPI QR Scanner</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('CASH')}
                      className={`w-full p-3 rounded-xl border text-left flex items-center justify-between text-xs transition ${
                        paymentMethod === 'CASH'
                          ? 'bg-amber-950/80 border-amber-500 text-white font-bold'
                          : 'bg-stone-950 border-stone-800 text-stone-400'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-stone-500"></span>
                        <span>Pay at Counter</span>
                      </div>
                    </button>
                  </div>

                  <div className="space-y-2 text-xs text-stone-300 pb-4 border-b border-stone-800">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span className="font-semibold text-white">₹{cartTotal}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>GST / Tax (5%)</span>
                      <span className="font-semibold text-white">₹{tax}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center py-4 border-b border-stone-800">
                    <span className="font-bold text-white text-sm">Grand Total</span>
                    <span className="font-black text-xl text-amber-400">₹{grandTotal}</span>
                  </div>

                  <div className="my-4">
                    <label className="block text-xs font-semibold text-stone-300 mb-1">Special Cooking Notes (Optional)</label>
                    <textarea
                      rows={2}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="e.g. Extra sauce, packaging required..."
                      className="w-full p-2.5 bg-stone-950 border border-stone-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <button
                    onClick={handleInitiatePayment}
                    disabled={ordering || !selectedSlotId}
                    className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-black rounded-full shadow-lg shadow-amber-500/20 transition flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                  >
                    {ordering ? 'Initializing Razorpay Gateway...' : 'Pay with Razorpay & Reserve Slot'}
                  </button>

                  <p className="text-[10px] text-slate-500 text-center mt-3 flex items-center justify-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-400" /> Razorpay 256-Bit Sandbox Security
                  </p>
                </div>
              </div>

            </div>
          )}

          {/* Humanized Razorpay & QR Scanner Checkout Modal */}
          <RazorpayModal
            isOpen={showRzpModal}
            onClose={() => setShowRzpModal(false)}
            orderData={activeRzpOrder}
            customerName={user?.full_name || 'Student Customer'}
            customerEmail={user?.email || 'student@example.com'}
            onPaymentSuccess={completePaymentVerification}
          />

        </main>
      </div>
    </div>
  );
};

export default StudentCheckout;
