import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { Navbar } from '../../components/Navbar';
import { Sidebar } from '../../components/Sidebar';
import { TokenCard } from '../../components/TokenCard';
import { Utensils, Ticket, ArrowRight } from 'lucide-react';

export const StaffDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeOrder, setActiveOrder] = useState<any>(null);
  const [menuItems, setMenuItems] = useState<any[]>([]);

  useEffect(() => {
    api.get('/orders').then((res) => {
      const active = res.data.find((o: any) => o.status !== 'COMPLETED' && o.status !== 'CANCELLED');
      setActiveOrder(active || (res.data[0] || null));
    }).catch(() => {});

    api.get('/menu/items').then((res) => setMenuItems(res.data.slice(0, 3))).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col font-sans">
      <Navbar />

      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-6 sm:p-8 max-w-6xl">
          
          <div className="flex flex-wrap justify-between items-center mb-8 gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Welcome, {user?.full_name}! 👋
              </h1>
              <p className="text-xs text-stone-400 mt-1">Staff Express Food Pre-Order & Pickup Portal</p>
            </div>

            <Link
              to="/staff/menu"
              className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-extrabold text-xs rounded-xl shadow-lg shadow-amber-500/20 transition flex items-center gap-2"
            >
              <Utensils className="w-4 h-4" /> Express Food Order
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            <div className="lg:col-span-2 space-y-6">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Ticket className="w-4 h-4 text-amber-400" /> Active Staff Token
              </h3>

              {activeOrder ? (
                <TokenCard order={activeOrder} />
              ) : (
                <div className="bg-stone-900 border border-stone-800 rounded-2xl p-8 text-center">
                  <Utensils className="w-10 h-10 text-stone-600 mx-auto mb-3" />
                  <h4 className="font-bold text-white text-sm">No Active Orders</h4>
                  <p className="text-xs text-stone-400 mt-1 max-w-sm mx-auto">
                    Place an express meal order for your next break window.
                  </p>
                  <Link
                    to="/staff/menu"
                    className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs rounded-xl transition"
                  >
                    Express Menu <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 shadow-xl">
                <h3 className="font-bold text-white text-sm mb-4">Express Menu Picks</h3>
                <div className="space-y-3">
                  {menuItems.map((item) => (
                    <div key={item.id} className="p-3 bg-stone-950 border border-stone-800 rounded-xl flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-white block">{item.name}</span>
                        <span className="text-stone-400 text-[10px]">Prep: {item.prep_time_mins} mins</span>
                      </div>
                      <span className="font-extrabold text-amber-400">₹{item.price}</span>
                    </div>
                  ))}
                </div>
                <Link
                  to="/staff/menu"
                  className="mt-4 w-full py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-xs rounded-xl transition block text-center"
                >
                  Order Food
                </Link>
              </div>
            </div>

          </div>

        </main>
      </div>
    </div>
  );
};
