import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { Navbar } from '../../components/Navbar';
import { Sidebar } from '../../components/Sidebar';
import { TokenCard } from '../../components/TokenCard';
import { Utensils, Ticket, Clock, ArrowRight, Sparkles, Plus, Star } from 'lucide-react';
import { FoodImage } from '../../components/FoodImage';

export const StudentDashboard: React.FC = () => {
  const { user, addToCart } = useAuth();
  const [activeOrder, setActiveOrder] = useState<any>(null);
  const [menuItems, setMenuItems] = useState<any[]>([]);

  useEffect(() => {
    api.get('/orders').then((res) => {
      const active = res.data.find((o: any) => o.status !== 'COMPLETED' && o.status !== 'CANCELLED');
      setActiveOrder(active || (res.data[0] || null));
    }).catch(() => {});

    api.get('/menu/items').then((res) => setMenuItems(res.data.slice(0, 4))).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col font-sans">
      <Navbar />
      
      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-6 sm:p-8 max-w-7xl">
          
          <div className="flex flex-wrap justify-between items-center mb-8 gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Good Morning, {user?.full_name?.split(' ')[0]}! 👋
              </h1>
              <p className="text-xs text-stone-400 mt-1">Smart Canteen Pre-Order & Timetable-Aware Pickup Portal</p>
            </div>

            <Link
              to="/student/menu"
              className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-extrabold text-xs rounded-xl shadow-lg shadow-amber-500/20 transition flex items-center gap-2"
            >
              <Utensils className="w-4 h-4" /> Browse Full Menu
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            <div className="lg:col-span-2 space-y-8">
              
              {/* Active Token Card / Banner */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-white text-base flex items-center gap-2">
                    <Ticket className="w-4 h-4 text-amber-400" /> Today's Active Token
                  </h3>
                  <Link to="/student/orders" className="text-xs text-amber-400 hover:underline font-semibold">
                    View All Orders &rarr;
                  </Link>
                </div>

                {activeOrder ? (
                  <TokenCard order={activeOrder} />
                ) : (
                  <div className="bg-stone-900 border border-stone-800 rounded-2xl p-8 text-center shadow-xl">
                    <Utensils className="w-10 h-10 text-stone-600 mx-auto mb-3" />
                    <h4 className="font-bold text-white text-sm">No Active Pickup Orders</h4>
                    <p className="text-xs text-stone-400 mt-1 max-w-sm mx-auto">
                      You don't have any food orders currently preparing. Pre-order food in advance for your upcoming class break.
                    </p>
                    <Link
                      to="/student/menu"
                      className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs rounded-xl transition"
                    >
                      Browse Menu <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                )}
              </div>

              {/* Recommended Menu Grid */}
              <div>
                <h3 className="font-bold text-white text-base mb-4 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" /> Recommended Specials
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {menuItems.map((item) => (
                    <div
                      key={item.id}
                      className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden shadow-xl hover:border-amber-500/50 transition p-3.5 flex flex-col justify-between group"
                    >
                      <div>
                        <div className="relative h-36 w-full rounded-xl overflow-hidden bg-stone-950 mb-3">
                          <FoodImage src={item.image_url} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition" />
                          <span className="absolute top-2.5 left-2.5 bg-stone-950/90 backdrop-blur px-2 py-0.5 rounded-full text-[10px] font-bold text-amber-400 border border-amber-500/30 z-20">
                            ₹{item.price.toFixed(2)}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-[11px] font-semibold text-stone-400 mb-1">
                          <span className="flex items-center gap-1 text-amber-400 font-bold">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> 4.8
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-stone-400" /> {item.prep_time_mins} min prep
                          </span>
                        </div>

                        <h4 className="font-bold text-white text-sm">{item.name}</h4>
                        <p className="text-xs text-stone-400 mt-0.5 line-clamp-1">{item.description}</p>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-stone-800 flex items-center justify-between">
                        <span className="text-sm font-extrabold text-amber-400">₹{item.price.toFixed(2)}</span>
                        <button
                          onClick={() => addToCart(item)}
                          className="w-8 h-8 rounded-full bg-amber-500 hover:bg-amber-400 text-stone-950 flex items-center justify-center font-bold transition"
                          title="Add to cart"
                        >
                          <Plus className="w-4 h-4 stroke-[2.5]" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Timetable Schedule Summary Sidebar Box */}
            <div className="space-y-6">
              
              <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-white text-sm flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-400" /> Next Break Window
                  </h3>
                  <Link to="/student/timetable" className="text-[11px] font-bold text-amber-400 hover:underline">
                    Edit Schedule
                  </Link>
                </div>

                <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-900/60 text-amber-200 mb-4">
                  <span className="block text-[10px] font-bold tracking-wider uppercase text-amber-400">Today's Lunch Break</span>
                  <span className="text-lg font-black text-white mt-0.5 block">12:00 PM – 12:45 PM</span>
                  <p className="text-[11px] text-amber-300/80 mt-1">✓ Pickup slots automatically aligned within this window.</p>
                </div>

                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-stone-400 uppercase">Today's Schedule</span>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between p-2.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-300">
                      <span>10:00 - 12:00</span>
                      <span className="font-semibold text-stone-400">Data Structures</span>
                    </div>
                    <div className="flex justify-between p-2.5 rounded-xl bg-amber-950/60 border border-amber-800 text-amber-300 font-bold">
                      <span>12:00 - 12:45</span>
                      <span>Lunch Break (Free)</span>
                    </div>
                    <div className="flex justify-between p-2.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-300">
                      <span>12:45 - 14:00</span>
                      <span className="font-semibold text-stone-400">Machine Learning</span>
                    </div>
                  </div>
                </div>

              </div>

              <div className="p-4 rounded-xl bg-stone-900 border border-stone-800 text-xs text-stone-400 shadow-xl">
                <span className="font-bold text-amber-400 block mb-1">💡 Smart Canteen Tip</span>
                Order 20 minutes before your break starts to ensure kitchen capacity reservation and 0-minute pickup waiting.
              </div>

            </div>

          </div>

        </main>
      </div>
    </div>
  );
};
