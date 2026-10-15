import React from 'react';
import { Ticket, Clock, CheckCircle, Flame, AlertCircle, QrCode } from 'lucide-react';

interface TokenCardProps {
  order: any;
  onCancel?: (orderId: number) => void;
}

export const TokenCard: React.FC<TokenCardProps> = ({ order, onCancel }) => {
  if (!order) return null;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PLACED':
      case 'CONFIRMED':
        return (
          <span className="flex items-center gap-1 px-3 py-1 text-xs font-bold rounded-full bg-amber-950/80 text-amber-300 border border-amber-800/80">
            <Clock className="w-3.5 h-3.5" /> Confirmed
          </span>
        );
      case 'PREPARING':
        return (
          <span className="flex items-center gap-1 px-3 py-1 text-xs font-bold rounded-full bg-orange-950/80 text-orange-300 border border-orange-800 animate-pulse">
            <Flame className="w-3.5 h-3.5 text-orange-400" /> Preparing in Kitchen
          </span>
        );
      case 'READY':
        return (
          <span className="flex items-center gap-1 px-3 py-1 text-xs font-bold rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-800 shadow-lg shadow-emerald-900/50">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> Ready for Pickup!
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="flex items-center gap-1 px-3 py-1 text-xs font-bold rounded-full bg-stone-800 text-stone-400 border border-stone-700">
            <CheckCircle className="w-3.5 h-3.5" /> Completed
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="flex items-center gap-1 px-3 py-1 text-xs font-bold rounded-full bg-red-950/80 text-red-400 border border-red-800">
            <AlertCircle className="w-3.5 h-3.5" /> Cancelled
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 shadow-xl relative overflow-hidden group hover:border-amber-500/40 transition">
      
      {/* Decorative gradient top bar */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600"></div>

      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-bold tracking-wider text-stone-400 uppercase">Digital Pickup Token</span>
          <div className="text-4xl font-extrabold text-white tracking-tight flex items-center gap-2 mt-1">
            <Ticket className="w-8 h-8 text-amber-400" />
            <span className="text-amber-400 font-mono">{order.token_number || 'A100'}</span>
          </div>
          <p className="text-xs text-stone-400 mt-1">Order #{order.order_number}</p>
        </div>

        <div>{getStatusBadge(order.status)}</div>
      </div>

      {/* Pickup Slot Box */}
      <div className="mt-5 p-4 bg-stone-950/80 rounded-xl border border-stone-800 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-lg bg-stone-900 border border-stone-800 text-amber-400">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-[11px] font-semibold text-stone-400 uppercase">Scheduled Pickup Window</span>
            <span className="text-sm font-bold text-white">{order.pickup_slot_time || '12:20 PM - 12:30 PM'}</span>
          </div>
        </div>

        {/* QR Code Mock */}
        <div className="flex flex-col items-center justify-center p-2 bg-white rounded-lg shadow">
          <QrCode className="w-10 h-10 text-stone-900" />
          <span className="text-[9px] font-mono font-bold text-stone-700 mt-0.5">SCAN COUNTER</span>
        </div>
      </div>

      {/* Order Items */}
      <div className="mt-4 pt-4 border-t border-stone-800/80">
        <span className="text-xs font-semibold text-stone-400 block mb-2">Order Items ({order.items?.length || 0})</span>
        <ul className="space-y-1 text-sm">
          {order.items?.map((item: any) => (
            <li key={item.id} className="flex justify-between text-stone-300 text-xs">
              <span>{item.quantity}x {item.menu_item_name}</span>
              <span className="font-medium text-stone-400">₹{item.subtotal}</span>
            </li>
          ))}
        </ul>

        <div className="mt-3 pt-2 border-t border-stone-800 flex justify-between items-center text-xs">
          <span className="font-semibold text-stone-400">Total Paid (incl. tax)</span>
          <span className="font-extrabold text-sm text-amber-400">₹{order.total_amount}</span>
        </div>
      </div>

      {/* Cancel button if applicable */}
      {onCancel && (order.status === 'PLACED' || order.status === 'CONFIRMED') && (
        <button
          onClick={() => onCancel(order.id)}
          className="mt-4 w-full py-2 bg-red-950/50 hover:bg-red-900/60 border border-red-800/60 text-red-300 font-semibold text-xs rounded-xl transition flex items-center justify-center gap-1.5"
        >
          Cancel Order & Release Slot
        </button>
      )}

    </div>
  );
};
