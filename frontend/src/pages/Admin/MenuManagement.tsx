import React, { useEffect, useState } from 'react';
import api from '../../api/client';
import { Navbar } from '../../components/Navbar';
import { Sidebar } from '../../components/Sidebar';
import { Utensils, Plus, Edit2 } from 'lucide-react';
import { FoodImage } from '../../components/FoodImage';

export const MenuManagement: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('80');
  const [prepTime, setPrepTime] = useState('15');
  const [catId, setCatId] = useState<number>(1);
  const [imageUrl, setImageUrl] = useState('');
  const [allergens, setAllergens] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [iRes, cRes] = await Promise.all([
        api.get('/menu/items?available_only=false'),
        api.get('/menu/categories')
      ]);
      setItems(iRes.data);
      setCategories(cRes.data);
      if (cRes.data.length > 0) setCatId(cRes.data[0].id);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name,
        description,
        price: parseFloat(price),
        prep_time_mins: parseInt(prepTime),
        category_id: catId,
        image_url: imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop',
        is_available: true,
        allergens: allergens || null
      };

      if (editingId) {
        await api.put(`/menu/items/${editingId}`, payload);
      } else {
        await api.post('/menu/items', payload);
      }

      setShowModal(false);
      resetForm();
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to save menu item.');
    }
  };

  const startEdit = (item: any) => {
    setEditingId(item.id);
    setName(item.name);
    setDescription(item.description || '');
    setPrice(item.price.toString());
    setPrepTime(item.prep_time_mins.toString());
    setCatId(item.category_id);
    setImageUrl(item.image_url || '');
    setAllergens(item.allergens || '');
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setDescription('');
    setPrice('80');
    setPrepTime('15');
    setImageUrl('');
    setAllergens('');
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
                <Utensils className="w-6 h-6 text-amber-500" /> Canteen Menu Management
              </h1>
              <p className="text-xs text-stone-400 mt-1">Configure food items, prices, prep times, and allergen notices.</p>
            </div>

            <button
              onClick={() => { resetForm(); setShowModal(true); }}
              className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-extrabold text-xs rounded-xl shadow-lg shadow-amber-500/20 transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Add Food Item
            </button>
          </div>

          <div className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden shadow-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-950 border-b border-stone-800 text-stone-400 font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-4">Item Name</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Prep Time</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800/60">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-stone-950/50 transition">
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0">
                          <FoodImage src={item.image_url} alt={item.name} className="w-10 h-10 object-cover" />
                        </div>
                        <div>
                          <span className="font-bold text-white block">{item.name}</span>
                          <span className="text-[10px] text-stone-400 line-clamp-1">{item.description}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-semibold text-stone-300">{item.category_name || 'General'}</td>
                    <td className="p-4 font-extrabold text-amber-400">₹{item.price}</td>
                    <td className="p-4 font-medium text-stone-300">{item.prep_time_mins} mins</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        item.is_available ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-red-950 text-red-400'
                      }`}>
                        {item.is_available ? 'AVAILABLE' : 'OFF MENU'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => startEdit(item)}
                        className="p-1.5 text-stone-400 hover:text-white rounded-lg bg-stone-800 hover:bg-stone-700 transition"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {showModal && (
            <div className="fixed inset-0 bg-stone-950/80 backdrop-blur-sm flex justify-center items-center p-4 z-50">
              <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 w-full max-w-lg shadow-2xl">
                <h3 className="text-lg font-bold text-white mb-4">
                  {editingId ? 'Edit Food Item' : 'Add New Food Item'}
                </h3>

                <form onSubmit={handleSaveItem} className="space-y-4 text-xs">
                  <div>
                    <label className="block text-stone-300 font-semibold mb-1">Item Name</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full p-2.5 bg-stone-950 border border-stone-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-300 font-semibold mb-1">Description</label>
                    <textarea
                      rows={2}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full p-2.5 bg-stone-950 border border-stone-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-stone-300 font-semibold mb-1">Price (₹)</label>
                      <input
                        type="number"
                        step="0.5"
                        required
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="w-full p-2.5 bg-stone-950 border border-stone-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-stone-300 font-semibold mb-1">Prep Time (mins)</label>
                      <input
                        type="number"
                        required
                        value={prepTime}
                        onChange={(e) => setPrepTime(e.target.value)}
                        className="w-full p-2.5 bg-stone-950 border border-stone-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-stone-300 font-semibold mb-1">Category</label>
                    <select
                      value={catId}
                      onChange={(e) => setCatId(parseInt(e.target.value))}
                      className="w-full p-2.5 bg-stone-950 border border-stone-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-stone-300 font-semibold mb-1">Image URL</label>
                    <input
                      type="text"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="https://..."
                      className="w-full p-2.5 bg-stone-950 border border-stone-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-300 font-semibold mb-1">Allergens Notice (Optional)</label>
                    <input
                      type="text"
                      value={allergens}
                      onChange={(e) => setAllergens(e.target.value)}
                      placeholder="e.g. Dairy, Gluten, Nuts"
                      className="w-full p-2.5 bg-stone-950 border border-stone-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="flex justify-end space-x-3 pt-4 border-t border-stone-800">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="px-4 py-2 bg-stone-800 text-stone-300 font-bold rounded-xl"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl"
                    >
                      Save Item
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
