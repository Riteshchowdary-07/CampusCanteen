import React, { useEffect, useState } from 'react';
import api from '../../api/client';
import { Navbar } from '../../components/Navbar';
import { Sidebar } from '../../components/Sidebar';
import { ChefHat, Flame, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

export const KitchenKanban: React.FC = () => {
  const [queue, setQueue] = useState<any[]>([]);

  useEffect(() => {
    fetchQueue();
    const interval = setInterval(fetchQueue, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchQueue = async () => {
    try {
      const res = await api.get('/kitchen/queue');
      setQueue(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateStatus = async (orderId: number, newStatus: string) => {
    try {
      await api.put(`/orders/${orderId}/status?new_status=${newStatus}`);
      fetchQueue();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to update order status.');
    }
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col font-sans">
      <Navbar />

      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-6 sm:p-8 max-w-7xl overflow-x-auto">
          
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                <ChefHat className="w-6 h-6 text-amber-500" /> Kitchen Queue & Capacity Kanban
              </h1>
              <p className="text-xs text-stone-400 mt-1">Real-time order workflow management grouped by pickup time slot window.</p>
            </div>

            <button
              onClick={fetchQueue}
              className="px-3.5 py-1.5 bg-stone-900 border border-stone-800 hover:bg-stone-800 text-xs font-bold text-stone-300 rounded-xl transition flex items-center gap-1.5"
            >
              <Clock className="w-3.5 h-3.5 text-amber-400" /> Refresh Queue
            </button>
          </div>

          <div className="flex space-x-6 pb-6 overflow-x-auto">
            {queue.map((slotGroup) => {
              const isFull = slotGroup.reserved_capacity >= slotGroup.max_capacity;
              const isOverloaded = slotGroup.reserved_capacity > slotGroup.max_capacity;

              return (
                <div
                  key={slotGroup.slot_id}
                  className="w-80 shrink-0 bg-stone-900 border border-stone-800 rounded-2xl p-4 flex flex-col justify-between shadow-xl"
                >
                  
                  <div className="pb-3 border-b border-stone-800/80 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-white text-base">{slotGroup.slot_time}</span>
                      
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                        isOverloaded
                          ? 'bg-red-950 text-red-400 border border-red-800 animate-pulse'
                          : isFull
                          ? 'bg-amber-950 text-amber-400 border border-amber-800'
                          : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      }`}>
                        {slotGroup.reserved_capacity} / {slotGroup.max_capacity} orders
                      </span>
                    </div>

                    {isOverloaded && (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-red-400 mt-2">
                        <AlertTriangle className="w-3 h-3" /> ⚠ OVER CAPACITY
                      </span>
                    )}
                  </div>

                  <div className="space-y-3 flex-1 min-h-[300px]">
                    {slotGroup.orders?.length === 0 ? (
                      <div className="text-center text-stone-600 text-xs pt-12">No orders for this slot window.</div>
                    ) : (
                      slotGroup.orders.map((order: any) => (
                        <div
                          key={order.id}
                          className={`p-4 rounded-xl border text-xs shadow-lg transition ${
                            order.status === 'PREPARING'
                              ? 'bg-amber-950/40 border-amber-800/60'
                              : order.status === 'READY'
                              ? 'bg-emerald-950/40 border-emerald-800/60'
                              : 'bg-stone-950 border-stone-800'
                          }`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <span className="font-mono font-extrabold text-amber-400 text-sm">#{order.token_number}</span>
                              <span className="text-[10px] text-stone-400 block mt-0.5">{order.user_name}</span>
                            </div>

                            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-stone-900 text-stone-300 border border-stone-800">
                              {order.status}
                            </span>
                          </div>

                          <ul className="space-y-1 my-3 text-[11px] text-stone-300 border-y border-stone-800/60 py-2">
                            {order.items?.map((item: any) => (
                              <li key={item.id} className="flex justify-between font-medium">
                                <span>{item.quantity}x {item.menu_item_name}</span>
                              </li>
                            ))}
                          </ul>

                          {order.notes && (
                            <p className="text-[10px] text-amber-300/80 italic mb-3">Note: "{order.notes}"</p>
                          )}

                          <div className="flex gap-2">
                            {order.status === 'PLACED' || order.status === 'CONFIRMED' ? (
                              <button
                                onClick={() => handleUpdateStatus(order.id, 'PREPARING')}
                                className="flex-1 py-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-[11px] rounded-lg transition flex items-center justify-center gap-1"
                              >
                                <Flame className="w-3.5 h-3.5" /> Start Preparing
                              </button>
                            ) : order.status === 'PREPARING' ? (
                              <button
                                onClick={() => handleUpdateStatus(order.id, 'READY')}
                                className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] rounded-lg transition flex items-center justify-center gap-1"
                              >
                                <CheckCircle className="w-3.5 h-3.5" /> Mark Ready!
                              </button>
                            ) : order.status === 'READY' ? (
                              <button
                                onClick={() => handleUpdateStatus(order.id, 'COMPLETED')}
                                className="flex-1 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-[11px] rounded-lg transition flex items-center justify-center gap-1"
                              >
                                Complete Pickup
                              </button>
                            ) : null}
                          </div>

                        </div>
                      ))
                    )}
                  </div>

                </div>
              );
            })}
          </div>

        </main>
      </div>
    </div>
  );
};
