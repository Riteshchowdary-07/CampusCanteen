import React, { useEffect, useState } from 'react';
import api from '../../api/client';
import { Navbar } from '../../components/Navbar';
import { Sidebar } from '../../components/Sidebar';
import { TokenCard } from '../../components/TokenCard';
import { Ticket, History, Clock } from 'lucide-react';

export const StudentOrders: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders');
      setOrders(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCancelOrder = async (orderId: number) => {
    if (!window.confirm('Are you sure you want to cancel this order? Stock and pickup capacity will be released.')) return;
    try {
      await api.post(`/orders/${orderId}/cancel`);
      fetchOrders();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to cancel order.');
    }
  };

  const activeOrders = orders.filter((o) => o.status !== 'COMPLETED' && o.status !== 'CANCELLED');
  const pastOrders = orders.filter((o) => o.status === 'COMPLETED' || o.status === 'CANCELLED');

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col font-sans">
      <Navbar />

      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-6 sm:p-8 max-w-5xl">
          
          <h1 className="text-2xl font-black text-white tracking-tight mb-2 flex items-center gap-2">
            <Ticket className="w-6 h-6 text-amber-400" /> My Orders & Digital Tokens
          </h1>
          <p className="text-xs text-stone-400 mb-8">Track active food pickup tokens and view order history.</p>

          <div className="mb-10">
            <h3 className="font-bold text-white text-base mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" /> Active Pickup Tokens ({activeOrders.length})
            </h3>

            {activeOrders.length === 0 ? (
              <div className="p-8 bg-stone-900 border border-stone-800 rounded-2xl text-center text-xs text-stone-400 shadow-xl">
                No active orders at this moment.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {activeOrders.map((order) => (
                  <TokenCard key={order.id} order={order} onCancel={handleCancelOrder} />
                ))}
              </div>
            )}
          </div>

          <div>
            <h3 className="font-bold text-white text-base mb-4 flex items-center gap-2">
              <History className="w-4 h-4 text-stone-400" /> Order History ({pastOrders.length})
            </h3>

            <div className="space-y-3">
              {pastOrders.map((order) => (
                <div key={order.id} className="p-4 bg-stone-900 border border-stone-800 rounded-xl flex items-center justify-between text-xs shadow-md">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-extrabold text-white">Order #{order.order_number}</span>
                      <span className="font-mono text-amber-400 font-bold">[{order.token_number}]</span>
                    </div>
                    <p className="text-stone-400 mt-1">
                      {new Date(order.created_at).toLocaleDateString()} • Pickup: {order.pickup_slot_time}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="font-extrabold text-white block">₹{order.total_amount}</span>
                    <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded mt-1 uppercase ${
                      order.status === 'COMPLETED' ? 'bg-emerald-950 text-emerald-300' : 'bg-red-950 text-red-400'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </main>
      </div>
    </div>
  );
};
