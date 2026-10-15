import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { Navbar } from '../../components/Navbar';
import { Sidebar } from '../../components/Sidebar';
import { Utensils, Search, Clock, Plus, ShoppingBag, AlertTriangle, Star } from 'lucide-react';
import { FoodImage } from '../../components/FoodImage';

interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  category_id: number;
  image_url: string;
  prep_time_mins: number;
  allergens?: string;
}

export const StudentMenu: React.FC = () => {
  const { addToCart, cart, user } = useAuth();
  const [categories, setCategories] = useState<any[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [selectedCat, setSelectedCat] = useState<number | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchMenu();
  }, [selectedCat, search]);

  const fetchMenu = async () => {
    try {
      const catRes = await api.get('/menu/categories');
      setCategories(catRes.data);

      let url = '/menu/items?available_only=true';
      if (selectedCat) url += `&category_id=${selectedCat}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;

      const itemRes = await api.get(url);
      setItems(itemRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleAddToCart = (item: MenuItem) => {
    addToCart(item);
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col font-sans">
      <Navbar onSearch={setSearch} />

      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-6 sm:p-8 max-w-7xl">
          
          <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
                <Utensils className="w-6 h-6 text-amber-500" /> Canteen Menu
              </h1>
              <p className="text-xs text-stone-400 mt-1">Pre-order food with automated timetable slot scheduling</p>
            </div>

            <Link
              to={user?.role === 'STAFF' ? '/staff/checkout' : '/student/checkout'}
              className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-extrabold text-xs rounded-full shadow-lg shadow-amber-500/20 transition flex items-center gap-2"
            >
              <ShoppingBag className="w-4 h-4" /> View Cart ({totalCartCount} items)
            </Link>
          </div>

          {/* Search & Category Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8 bg-stone-900 border border-stone-800 p-4 rounded-2xl">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="w-4 h-4 text-stone-500 absolute left-3.5 top-2.5" />
              <input
                type="text"
                placeholder="Search food by name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-stone-950 border border-stone-800 rounded-full text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCat(null)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${
                  selectedCat === null ? 'bg-amber-500 text-stone-950 shadow-xs font-bold' : 'bg-stone-950 text-stone-400 hover:text-white border border-stone-800'
                }`}
              >
                All
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCat(c.id)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${
                    selectedCat === c.id ? 'bg-amber-500 text-stone-950 shadow-xs font-bold' : 'bg-stone-950 text-stone-400 hover:text-white border border-stone-800'
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          {/* Food Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden shadow-xl hover:border-amber-500/50 transition duration-200 flex flex-col justify-between group p-3.5 relative"
              >
                <div>
                  <div className="relative h-44 w-full rounded-xl overflow-hidden bg-stone-950 mb-3">
                    <FoodImage
                      src={item.image_url}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                    <span className="absolute top-2.5 left-2.5 bg-stone-950/90 backdrop-blur px-2 py-0.5 rounded-full text-[10px] font-bold text-amber-400 border border-stone-800 z-20">
                      ₹{item.price.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-semibold text-stone-400 mb-1">
                    <span className="flex items-center gap-1 text-amber-400 font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> 4.8
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-stone-500" /> {item.prep_time_mins} min prep
                    </span>
                  </div>

                  <h3 className="font-bold text-white text-base leading-snug">{item.name}</h3>
                  <p className="text-xs text-stone-400 mt-1 line-clamp-2 leading-relaxed">{item.description}</p>

                  {item.allergens && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded-md mt-2 border border-amber-900/60">
                      <AlertTriangle className="w-3 h-3 text-amber-400" /> Contains: {item.allergens}
                    </span>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-stone-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-semibold text-stone-500 block uppercase">Price</span>
                    <span className="text-base font-extrabold text-amber-400">₹{item.price.toFixed(2)}</span>
                  </div>

                  <button
                    onClick={() => handleAddToCart(item)}
                    className="w-9 h-9 rounded-full bg-amber-500 hover:bg-amber-400 text-stone-950 flex items-center justify-center font-bold shadow-lg shadow-amber-500/30 transition hover:scale-105 active:scale-95"
                    title="Add to cart"
                  >
                    <Plus className="w-5 h-5 stroke-[2.5]" />
                  </button>
                </div>
              </div>
            ))}
          </div>

        </main>
      </div>
    </div>
  );
};

export default StudentMenu;
