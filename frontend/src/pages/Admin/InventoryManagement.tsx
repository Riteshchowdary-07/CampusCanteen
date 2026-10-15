import React, { useEffect, useState } from 'react';
import api from '../../api/client';
import { Navbar } from '../../components/Navbar';
import { Sidebar } from '../../components/Sidebar';
import { Package, AlertTriangle, RefreshCw } from 'lucide-react';

export const InventoryManagement: React.FC = () => {
  const [inventory, setInventory] = useState<any[]>([]);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [newQty, setNewQty] = useState('');

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const res = await api.get('/inventory');
      setInventory(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    try {
      await api.put(`/inventory/${editingItem.id}?quantity=${parseFloat(newQty)}`);
      setEditingItem(null);
      fetchInventory();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to update stock.');
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
                <Package className="w-6 h-6 text-amber-500" /> Recipe & Ingredient Stock Management
              </h1>
              <p className="text-xs text-stone-400 mt-1">Track raw ingredient inventory, set safety thresholds, and receive low-stock alerts.</p>
            </div>

            <button
              onClick={fetchInventory}
              className="px-3.5 py-1.5 bg-stone-900 border border-stone-800 text-stone-300 font-bold text-xs rounded-xl flex items-center gap-1.5 hover:bg-stone-800 transition"
            >
              <RefreshCw className="w-3.5 h-3.5 text-amber-400" /> Refresh Stock
            </button>
          </div>

          <div className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden shadow-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-950 border-b border-stone-800 text-stone-400 font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-4">Ingredient Name</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Current Stock</th>
                  <th className="p-4">Min Safety Threshold</th>
                  <th className="p-4">Stock Health</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800/60">
                {inventory.map((item) => (
                  <tr
                    key={item.id}
                    className={`transition ${item.is_low_stock ? 'bg-red-950/20 hover:bg-red-950/30' : 'hover:bg-stone-950/50'}`}
                  >
                    <td className="p-4 font-bold text-white text-sm">{item.name}</td>
                    <td className="p-4 text-stone-300">{item.category || 'General'}</td>
                    <td className="p-4 font-mono font-bold text-white">
                      {item.quantity} {item.unit}
                    </td>
                    <td className="p-4 font-mono text-stone-400">
                      {item.min_threshold} {item.unit}
                    </td>
                    <td className="p-4">
                      {item.is_low_stock ? (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-red-400 px-2 py-0.5 rounded bg-red-950 border border-red-800 animate-pulse w-fit">
                          <AlertTriangle className="w-3 h-3" /> LOW STOCK ALERT
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-emerald-400 px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800 w-fit block">
                          HEALTHY
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => { setEditingItem(item); setNewQty(item.quantity.toString()); }}
                        className="px-3 py-1 bg-amber-950/60 hover:bg-amber-900/80 border border-amber-800/80 text-amber-300 font-bold rounded-lg transition text-[11px]"
                      >
                        Adjust Stock
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Adjust Stock Modal */}
          {editingItem && (
            <div className="fixed inset-0 bg-stone-950/80 backdrop-blur-sm flex justify-center items-center p-4 z-50">
              <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 w-full max-w-md shadow-2xl">
                <h3 className="text-base font-bold text-white mb-2">Adjust Stock: {editingItem.name}</h3>
                <p className="text-xs text-stone-400 mb-4">Update raw ingredient quantity. System will log an inventory movement audit entry.</p>

                <form onSubmit={handleUpdateStock} className="space-y-4 text-xs">
                  <div>
                    <label className="block text-stone-300 font-semibold mb-1">New Quantity ({editingItem.unit})</label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      value={newQty}
                      onChange={(e) => setNewQty(e.target.value)}
                      className="w-full p-2.5 bg-stone-950 border border-stone-800 rounded-xl text-white font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="flex justify-end space-x-3 pt-3 border-t border-stone-800">
                    <button
                      type="button"
                      onClick={() => setEditingItem(null)}
                      className="px-4 py-2 bg-stone-800 text-stone-300 font-bold rounded-xl"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl"
                    >
                      Update Stock
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
