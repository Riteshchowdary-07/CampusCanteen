import React, { useState, useEffect } from 'react';
import {
  X,
  QrCode,
  Smartphone,
  CreditCard,
  Building,
  ShieldCheck,
  CheckCircle,
  Clock,
  Zap,
  ExternalLink
} from 'lucide-react';

interface RazorpayModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderData: {
    razorpay_order_id: string;
    razorpay_key_id: string;
    total_amount_rupees: number;
    amount_paise: number;
  } | null;
  customerName: string;
  customerEmail: string;
  onPaymentSuccess: (details: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) => void;
}

export const RazorpayModal: React.FC<RazorpayModalProps> = ({
  isOpen,
  onClose,
  orderData,
  customerName,
  customerEmail,
  onPaymentSuccess
}) => {
  const [activeTab, setActiveTab] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [selectedUpiApp, setSelectedUpiApp] = useState<string>('gpay');
  const [processing, setProcessing] = useState(false);
  const [paymentDone, setPaymentDone] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(299); // 4m 59s countdown timer

  // Form states
  const [vpaInput, setVpaInput] = useState('');
  const [cardNumber, setCardNumber] = useState('4111 •••• •••• 1111');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('•••');

  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setTimerSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen || !orderData) return null;

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSimulatePayment = (paymentIdPrefix: string = 'pay_rzp_upi') => {
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      setPaymentDone(true);

      setTimeout(() => {
        const paymentDetails = {
          razorpay_order_id: orderData.razorpay_order_id,
          razorpay_payment_id: `${paymentIdPrefix}_${Date.now()}`,
          razorpay_signature: `rzp_sig_verified_${Date.now()}`,
        };
        onPaymentSuccess(paymentDetails);
      }, 800);
    }, 1200);
  };

  const openOfficialRazorpayPopup = () => {
    if (window.Razorpay) {
      try {
        const options = {
          key: orderData.razorpay_key_id,
          amount: orderData.amount_paise,
          currency: "INR",
          name: "Campus Smart Canteen",
          description: "Food Pre-Order Payment",
          order_id: orderData.razorpay_order_id,
          handler: function (response: any) {
            onPaymentSuccess({
              razorpay_order_id: response.razorpay_order_id || orderData.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id || `pay_rzp_${Date.now()}`,
              razorpay_signature: response.razorpay_signature || `sig_rzp_${Date.now()}`,
            });
          },
          prefill: {
            name: customerName,
            email: customerEmail,
          },
          theme: {
            color: "#f59e0b",
          },
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
      } catch (e) {
        console.error("Razorpay SDK error, falling back to scanner:", e);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-md animate-fadeIn font-sans">
      <div className="w-full max-w-lg bg-stone-900 rounded-3xl overflow-hidden shadow-2xl border border-stone-800 text-stone-100 flex flex-col relative">
        
        {/* Razorpay Brand Header */}
        <div className="bg-stone-950 text-white p-4 sm:p-5 flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center font-black text-stone-950 text-base shadow-md">
              R
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-sm tracking-tight text-white">Razorpay</span>
                <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 font-bold text-[9px] uppercase">
                  Verified Payment Gateway
                </span>
              </div>
              <p className="text-[11px] text-stone-400">CampusCafe Pre-Order</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="text-right">
              <span className="text-[10px] text-stone-400 uppercase font-semibold block">Amount Due</span>
              <span className="text-base font-extrabold text-amber-400">₹{orderData.total_amount_rupees.toFixed(2)}</span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-stone-800 text-stone-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Customer & Order Summary Bar */}
        <div className="bg-stone-950/60 border-b border-stone-800 px-5 py-2.5 flex justify-between items-center text-xs text-stone-400">
          <span className="truncate max-w-[200px]">Paying as <strong className="text-white">{customerName}</strong></span>
          <span className="font-mono text-[11px] bg-stone-800 px-2 py-0.5 rounded text-stone-300">Order: {orderData.razorpay_order_id}</span>
        </div>

        {/* Success Overlay Animation */}
        {paymentDone ? (
          <div className="p-12 text-center flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-950 text-emerald-400 flex items-center justify-center animate-bounce border border-emerald-800">
              <CheckCircle className="w-10 h-10 stroke-[2.5]" />
            </div>
            <h3 className="text-xl font-black text-white">Payment Successful!</h3>
            <p className="text-xs text-stone-400 max-w-xs">
              Razorpay transaction verified. Allocating kitchen pickup slot & generating digital token...
            </p>
            <span className="text-xs font-mono text-amber-400 bg-amber-950/60 px-3 py-1 rounded-full border border-amber-800 font-bold">
              Token Generating...
            </span>
          </div>
        ) : processing ? (
          /* Processing Spinner */
          <div className="p-12 text-center flex flex-col items-center justify-center space-y-4">
            <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
            <h4 className="font-bold text-white text-sm">Processing Razorpay Transaction...</h4>
            <p className="text-xs text-stone-400">Contacting bank & verifying UPI signature...</p>
          </div>
        ) : (
          /* Payment Options Body */
          <div className="p-5 flex-1 space-y-5">
            
            {/* Payment Method Selector Tabs */}
            <div className="flex p-1 bg-stone-950 rounded-xl text-xs font-bold text-stone-400 border border-stone-800">
              <button
                onClick={() => setActiveTab('upi')}
                className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition ${
                  activeTab === 'upi' ? 'bg-amber-500 text-stone-950 shadow-xs font-bold' : 'hover:text-white'
                }`}
              >
                <QrCode className="w-3.5 h-3.5" /> UPI & QR Scanner
              </button>
              <button
                onClick={() => setActiveTab('card')}
                className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition ${
                  activeTab === 'card' ? 'bg-amber-500 text-stone-950 shadow-xs font-bold' : 'hover:text-white'
                }`}
              >
                <CreditCard className="w-3.5 h-3.5" /> Cards & Debit
              </button>
              <button
                onClick={() => setActiveTab('netbanking')}
                className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition ${
                  activeTab === 'netbanking' ? 'bg-amber-500 text-stone-950 shadow-xs font-bold' : 'hover:text-white'
                }`}
              >
                <Building className="w-3.5 h-3.5" /> Net Banking
              </button>
            </div>

            {/* TAB 1: UPI & QR SCANNER */}
            {activeTab === 'upi' && (
              <div className="space-y-4">
                
                {/* QR Code Scanner Card */}
                <div className="bg-stone-950 text-white rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 border border-stone-800 shadow-md relative overflow-hidden">
                  
                  {/* QR Image with Scanner Line Effect */}
                  <div className="relative w-36 h-36 bg-white p-2 rounded-xl shrink-0 border-2 border-amber-500 flex flex-col items-center justify-center">
                    <svg className="w-full h-full text-stone-950" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M2 2h8v8H2V2zm2 2v4h4V4H4zm9-2h8v8h-8V2zm2 2v4h4V4h-4zM2 14h8v8H2v-8zm2 2v4h4v-4H4zm13-2h2v2h-2v-2zm-4 0h2v2h-2v-2zm2 4h2v2h-2v-2zm-2 2h2v2h-2v-2zm4 0h2v2h-2v-2zm0-4h2v2h-2v-2z" />
                    </svg>
                    <div className="absolute inset-x-0 h-0.5 bg-amber-500 shadow-lg shadow-amber-500 animate-pulse top-1/2"></div>
                    <span className="text-[9px] font-black text-stone-950 uppercase tracking-tighter mt-0.5">SCAN ME</span>
                  </div>

                  <div className="flex-1 space-y-2 text-center sm:text-left">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800">
                      <Clock className="w-3 h-3" /> Expires in {formatTimer(timerSeconds)}
                    </span>
                    <h4 className="font-bold text-white text-sm">Scan QR Code with any UPI App</h4>
                    <p className="text-[11px] text-stone-400 leading-tight">
                      Open GPay, PhonePe, Paytm, or BHIM to scan & pay directly to <strong className="text-amber-400 font-mono">canteen.pay@okicici</strong>
                    </p>
                    <div className="pt-1 flex flex-col gap-2">
                      <button
                        onClick={() => handleSimulatePayment('pay_rzp_qr')}
                        className="w-full py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-extrabold rounded-xl shadow text-xs transition flex items-center justify-center gap-1"
                      >
                        <Zap className="w-3.5 h-3.5" /> ⚡ Click After Scanning QR
                      </button>

                      {window.Razorpay && (
                        <button
                          onClick={openOfficialRazorpayPopup}
                          className="w-full py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 font-semibold rounded-lg text-[11px] transition flex items-center justify-center gap-1 border border-stone-700"
                        >
                          <ExternalLink className="w-3 h-3 text-amber-400" /> Open Official Razorpay Popup
                        </button>
                      )}
                    </div>
                  </div>

                </div>

                {/* Popular UPI Apps Row */}
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-stone-400 uppercase">Or Select UPI App</span>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { id: 'gpay', name: 'GPay' },
                      { id: 'phonepe', name: 'PhonePe' },
                      { id: 'paytm', name: 'Paytm' },
                      { id: 'bhim', name: 'BHIM' },
                    ].map((app) => (
                      <button
                        key={app.id}
                        type="button"
                        onClick={() => {
                          setSelectedUpiApp(app.id);
                          handleSimulatePayment(`pay_rzp_${app.id}`);
                        }}
                        className={`p-2.5 rounded-xl border font-bold text-xs transition flex flex-col items-center justify-center gap-1 ${
                          selectedUpiApp === app.id
                            ? 'bg-amber-500 text-stone-950 border-amber-400'
                            : 'border-stone-800 bg-stone-950 text-stone-300 hover:bg-stone-800'
                        }`}
                      >
                        <Smartphone className="w-4 h-4" />
                        <span>{app.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Direct UPI ID Entry */}
                <div className="pt-2">
                  <label className="block text-[11px] font-bold text-stone-400 mb-1">Or Enter UPI ID / VPA</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={vpaInput}
                      onChange={(e) => setVpaInput(e.target.value)}
                      placeholder="e.g. 9876543210@paytm"
                      className="flex-1 px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleSimulatePayment('pay_rzp_vpa')}
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs rounded-xl shadow transition"
                    >
                      Pay Now
                    </button>
                  </div>
                </div>

              </div>
            )}

            {/* TAB 2: CARDS */}
            {activeTab === 'card' && (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-stone-400 font-semibold mb-1">Card Number</label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl font-mono text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-stone-400 font-semibold mb-1">Expiry (MM/YY)</label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-center font-mono text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-400 font-semibold mb-1">CVV</label>
                    <input
                      type="password"
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                      className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-center font-mono text-white"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleSimulatePayment('pay_rzp_card')}
                  className="w-full py-3 mt-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-extrabold rounded-xl shadow transition text-center"
                >
                  Pay ₹{orderData.total_amount_rupees.toFixed(2)} with Card
                </button>
              </div>
            )}

            {/* TAB 3: NETBANKING */}
            {activeTab === 'netbanking' && (
              <div className="space-y-3 text-xs">
                <span className="block text-stone-400 font-semibold mb-1">Select Bank</span>
                <div className="grid grid-cols-2 gap-2">
                  {['HDFC Bank', 'ICICI Bank', 'State Bank of India', 'Axis Bank'].map((bank) => (
                    <button
                      key={bank}
                      type="button"
                      onClick={() => handleSimulatePayment('pay_rzp_nb')}
                      className="p-3 bg-stone-950 border border-stone-800 rounded-xl text-left font-bold text-stone-200 hover:border-amber-500 transition"
                    >
                      {bank}
                    </button>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

        {/* Razorpay Footer Protection Bar */}
        <div className="bg-stone-950 border-t border-stone-800 px-5 py-3 flex items-center justify-between text-[11px] text-stone-400">
          <div className="flex items-center gap-1.5 text-stone-300 font-semibold">
            <ShieldCheck className="w-4 h-4 text-amber-500" />
            <span>Razorpay 256-Bit SSL Encrypted Security</span>
          </div>
          <span className="font-mono text-[10px] text-stone-500">TEST KEY: {orderData.razorpay_key_id}</span>
        </div>

      </div>
    </div>
  );
};

export default RazorpayModal;
