import React, { useEffect, useState } from 'react';
import api from '../../api/client';
import { Navbar } from '../../components/Navbar';
import { Sidebar } from '../../components/Sidebar';
import { Clock, Edit2 } from 'lucide-react';

export const PickupSlotManagement: React.FC = () => {
  const [slots, setSlots] = useState<any[]>([]);
  const [editingSlot, setEditingSlot] = useState<any>(null);
  const [maxCap, setMaxCap] = useState('10');

  useEffect(() => {
    fetchSlots();
  }, []);

  const fetchSlots = async () => {
    try {
      const res = await api.get('/pickup-slots');
      setSlots(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateCapacity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSlot) return;

    try {
      await api.put(`/pickup-slots/${editingSlot.id}/capacity?max_capacity=${parseInt(maxCap)}`);
      setEditingSlot(null);
      fetchSlots();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to update capacity.');
    }
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col font-sans">
      <Navbar />

      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-6 sm:p-8 max-w-7xl">
          
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                <Clock className="w-6 h-6 text-amber-500" /> Kitchen Pickup Capacity Management
              </h1>
              <p className="text-xs text-stone-400 mt-1">Configure maximum order limits per 10-minute slot window to prevent kitchen congestion.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {slots.map((slot) => (
              <div key={slot.id} className="p-4 bg-stone-900 border border-stone-800 rounded-2xl shadow-lg flex flex-col justify-between">
                <div>
                  <span className="font-mono font-bold text-white text-base block">{slot.start_time} - {slot.end_time}</span>
                  <div className="mt-3 flex justify-between items-center text-xs">
                    <span className="text-stone-400">Reserved:</span>
                    <span className="font-extrabold text-amber-400">{slot.reserved_capacity} orders</span>
                  </div>
                  <div className="flex justify-between items-center text-xs mt-1">
                    <span className="text-stone-400">Max Capacity Limit:</span>
                    <span className="font-extrabold text-white">{slot.max_capacity} orders</span>
                  </div>
                </div>

                <button
                  onClick={() => { setEditingSlot(slot); setMaxCap(slot.max_capacity.toString()); }}
                  className="mt-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1"
                >
                  <Edit2 className="w-3.5 h-3.5" /> Adjust Capacity Limit
                </button>
              </div>
            ))}
          </div>

          {editingSlot && (
            <div className="fixed inset-0 bg-stone-950/80 backdrop-blur-sm flex justify-center items-center p-4 z-50">
              <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 w-full max-w-md shadow-2xl">
                <h3 className="text-base font-bold text-white mb-2">Adjust Slot Capacity</h3>
                <p className="text-xs text-stone-400 mb-4">Slot: {editingSlot.start_time} - {editingSlot.end_time}</p>

                <form onSubmit={handleUpdateCapacity} className="space-y-4 text-xs">
                  <div>
                    <label className="block text-stone-300 font-semibold mb-1">Max Orders Allowed</label>
                    <input
                      type="number"
                      required
                      value={maxCap}
                      onChange={(e) => setMaxCap(e.target.value)}
                      className="w-full p-2.5 bg-stone-950 border border-stone-800 rounded-xl text-white font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="flex justify-end space-x-3 pt-3 border-t border-stone-800">
                    <button
                      type="button"
                      onClick={() => setEditingSlot(null)}
                      className="px-4 py-2 bg-stone-800 text-stone-300 font-bold rounded-xl"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl"
                    >
                      Save Capacity
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
};
