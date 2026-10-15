import React, { useEffect, useState } from 'react';
import api from '../../api/client';
import { Navbar } from '../../components/Navbar';
import { Sidebar } from '../../components/Sidebar';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { TrendingUp, AlertTriangle } from 'lucide-react';

export const TimetableAnalytics: React.FC = () => {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    api.get('/admin/timetable-analytics').then((res) => setData(res.data)).catch(() => {});
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
                <TrendingUp className="w-6 h-6 text-amber-500" /> Student Timetable Demand Analytics
              </h1>
              <p className="text-xs text-stone-400 mt-1">
                Aggregate demand projections derived from student lunch break schedules versus canteen kitchen throughput.
              </p>
            </div>
          </div>

          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 shadow-xl mb-8">
            <h3 className="font-bold text-white text-sm mb-6">Expected Break Demand vs Kitchen Capacity</h3>
            
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#292524" />
                  <XAxis dataKey="time_slot" stroke="#a8a29e" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#a8a29e" tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#1c1917', borderColor: '#44403c', borderRadius: '12px', fontSize: '12px' }} />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Bar dataKey="expected_demand" name="Expected Break Demand" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="kitchen_capacity" name="Kitchen Capacity Limit" fill="#d97706" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.map((point, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-xl border flex justify-between items-center text-xs ${
                  point.is_high_demand
                    ? 'bg-amber-950/40 border-amber-900/80 text-amber-200'
                    : 'bg-stone-900 border-stone-800 text-stone-300'
                }`}
              >
                <div>
                  <span className="font-mono font-bold text-white text-sm block">{point.time_slot}</span>
                  <span className="text-[11px]">Expected Demand: {point.expected_demand} orders</span>
                </div>

                <div className="text-right">
                  <span className="font-bold text-amber-400 block">Cap: {point.kitchen_capacity}</span>
                  {point.is_high_demand && (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-amber-400 mt-1">
                      <AlertTriangle className="w-3 h-3" /> High Peak Period
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

        </main>
      </div>
    </div>
  );
};
