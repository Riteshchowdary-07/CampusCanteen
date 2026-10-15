import React, { useEffect, useState } from 'react';
import api from '../../api/client';
import { Navbar } from '../../components/Navbar';
import { Sidebar } from '../../components/Sidebar';
import { BarChart3 } from 'lucide-react';

export const AdminReports: React.FC = () => {
  const [report, setReport] = useState<any>(null);

  useEffect(() => {
    api.get('/admin/reports/sales').then((res) => setReport(res.data)).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col font-sans">
      <Navbar />

      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-6 sm:p-8 max-w-7xl">
          
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                <BarChart3 className="w-6 h-6 text-amber-500" /> Executive Sales & Operations Reports
              </h1>
              <p className="text-xs text-stone-400 mt-1">Comprehensive breakdown of revenue, top ordered menu items, and kitchen metrics.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-stone-900 border border-stone-800 p-6 rounded-2xl">
              <span className="text-xs font-semibold text-stone-400 uppercase">Total Completed Orders</span>
              <span className="text-3xl font-black text-white block mt-2">{report?.total_orders || 0}</span>
            </div>
            <div className="bg-stone-900 border border-stone-800 p-6 rounded-2xl">
              <span className="text-xs font-semibold text-stone-400 uppercase">Total Canteen Revenue</span>
              <span className="text-3xl font-black text-amber-400 block mt-2">₹{report?.total_revenue || '0.00'}</span>
            </div>
            <div className="bg-stone-900 border border-stone-800 p-6 rounded-2xl">
              <span className="text-xs font-semibold text-stone-400 uppercase">Average Order Value</span>
              <span className="text-3xl font-black text-amber-400 block mt-2">₹{report?.average_order_value || '0.00'}</span>
            </div>
          </div>

          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 shadow-xl">
            <h3 className="font-bold text-white text-base mb-4">Itemized Sales Breakdown</h3>
            
            <div className="space-y-3">
              {report?.items_breakdown && Object.entries(report.items_breakdown).map(([name, stats]: [string, any]) => (
                <div key={name} className="p-4 bg-stone-950 border border-stone-800 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-white text-sm block">{name}</span>
                    <span className="text-stone-400">Total Quantity Sold: {stats.quantity} plates</span>
                  </div>
                  <span className="font-black text-amber-400 text-sm">₹{stats.revenue}</span>
                </div>
              ))}
            </div>
          </div>

        </main>
      </div>
    </div>
  );
};
