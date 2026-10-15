import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import { Navbar } from '../../components/Navbar';
import { Sidebar } from '../../components/Sidebar';
import {
  Shield,
  DollarSign,
  Package,
  Flame,
  Clock,
  AlertTriangle,
  ChefHat,
  ArrowRight
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [overview, setOverview] = useState<any>(null);
  const [lowStockItems, setLowStockItems] = useState<any[]>([]);

  useEffect(() => {
    api.get('/admin/dashboard/overview').then((res) => setOverview(res.data)).catch(() => {});
    api.get('/inventory?low_stock_only=true').then((res) => setLowStockItems(res.data)).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col font-sans">
      <Navbar />

      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-6 sm:p-8 max-w-7xl">
          
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
                <Shield className="w-7 h-7 text-amber-500" /> Canteen Operational Command Center
              </h1>
              <p className="text-xs text-stone-400 mt-1">Real-time kitchen capacity, inventory reservations, and smart timetable demand metrics</p>
            </div>

            <Link
              to="/admin/kitchen"
              className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-extrabold text-xs rounded-xl shadow-lg shadow-amber-500/20 transition flex items-center gap-2"
            >
              <ChefHat className="w-4 h-4" /> Open Kitchen Queue Kanban
            </Link>
          </div>

          {/* OVERVIEW STATS CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            
            <div className="bg-stone-900 border border-stone-800 p-6 rounded-2xl shadow-xl">
              <div className="flex justify-between items-center text-stone-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Today's Orders</span>
                <Clock className="w-5 h-5 text-amber-400" />
              </div>
              <span className="text-3xl font-black text-white">{overview?.today_orders_count || 0}</span>
              <p className="text-[11px] text-stone-400 mt-1">Pending: {overview?.pending_orders || 0} | Prep: {overview?.preparing_orders || 0}</p>
            </div>

            <div className="bg-stone-900 border border-stone-800 p-6 rounded-2xl shadow-xl">
              <div className="flex justify-between items-center text-stone-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Today's Revenue</span>
                <DollarSign className="w-5 h-5 text-amber-400" />
              </div>
              <span className="text-3xl font-black text-amber-400">₹{overview?.today_revenue || '0.00'}</span>
              <p className="text-[11px] text-stone-400 mt-1">Includes 5% tax reservation</p>
            </div>

            <div className="bg-stone-900 border border-stone-800 p-6 rounded-2xl shadow-xl">
              <div className="flex justify-between items-center text-stone-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Kitchen Utilization</span>
                <Flame className="w-5 h-5 text-amber-400" />
              </div>
              <span className="text-3xl font-black text-amber-400">{overview?.kitchen_utilization_pct || 0}%</span>
              
              {/* Progress bar */}
              <div className="w-full bg-stone-950 rounded-full h-2 mt-3 overflow-hidden border border-stone-800">
                <div
                  className="bg-gradient-to-r from-amber-500 to-orange-500 h-full rounded-full transition-all"
                  style={{ width: `${overview?.kitchen_utilization_pct || 0}%` }}
                ></div>
              </div>
            </div>

            <div className="bg-stone-900 border border-stone-800 p-6 rounded-2xl shadow-xl">
              <div className="flex justify-between items-center text-stone-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Low Stock Items</span>
                <Package className="w-5 h-5 text-red-400" />
              </div>
              <span className="text-3xl font-black text-red-400">{overview?.low_stock_count || 0}</span>
              <p className="text-[11px] text-stone-400 mt-1">Requires immediate restocking</p>
            </div>

          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Low-Stock Alert List */}
            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 shadow-xl lg:col-span-2">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-400" /> Low Stock Inventory Alerts
                </h3>
                <Link to="/admin/inventory" className="text-xs text-amber-400 hover:underline">Manage Stock &rarr;</Link>
              </div>

              {lowStockItems.length === 0 ? (
                <div className="p-6 bg-stone-950 rounded-xl border border-stone-800 text-center text-xs text-stone-400">
                  ✓ All ingredient inventory levels are above minimum safety threshold.
                </div>
              ) : (
                <div className="space-y-3">
                  {lowStockItems.map((item) => (
                    <div key={item.id} className="p-4 bg-red-950/40 border border-red-900/60 rounded-xl flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
                        <div>
                          <span className="font-bold text-white text-sm block">{item.name}</span>
                          <span className="text-stone-400">Category: {item.category}</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="font-mono font-bold text-red-400 text-sm block">
                          Current: {item.quantity} {item.unit}
                        </span>
                        <span className="text-[10px] text-stone-400">Minimum: {item.min_threshold} {item.unit}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Admin Actions */}
            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 shadow-xl space-y-4">
              <h3 className="font-bold text-white text-base">Quick Operations</h3>

              <Link
                to="/admin/kitchen"
                className="p-4 bg-stone-950 hover:bg-stone-900/80 border border-stone-800 rounded-xl block transition group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs">Kitchen Queue (Kanban)</span>
                  <ArrowRight className="w-4 h-4 text-amber-400 group-hover:translate-x-1 transition" />
                </div>
                <p className="text-[11px] text-stone-400 mt-1">Manage food preparation workflow per slot window.</p>
              </Link>

              <Link
                to="/admin/timetable-analytics"
                className="p-4 bg-stone-950 hover:bg-stone-900/80 border border-stone-800 rounded-xl block transition group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs">Timetable Demand Analytics</span>
                  <ArrowRight className="w-4 h-4 text-amber-400 group-hover:translate-x-1 transition" />
                </div>
                <p className="text-[11px] text-stone-400 mt-1">Visualize peak break demand vs kitchen capacity.</p>
              </Link>

              <Link
                to="/admin/pickup-slots"
                className="p-4 bg-stone-950 hover:bg-stone-900/80 border border-stone-800 rounded-xl block transition group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs">Kitchen Slot Capacity</span>
                  <ArrowRight className="w-4 h-4 text-amber-400 group-hover:translate-x-1 transition" />
                </div>
                <p className="text-[11px] text-stone-400 mt-1">Configure max orders allowed per 10-min slot.</p>
              </Link>
            </div>

          </div>

        </main>
      </div>
    </div>
  );
};
