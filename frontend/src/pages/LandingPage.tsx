import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/Navbar';
import {
  Shield,
  GraduationCap,
  Briefcase,
  Sparkles,
  Clock,
  Star,
  Plus,
  CheckCircle2
} from 'lucide-react';
import { FoodImage } from '../components/FoodImage';

interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  category_id: number;
  category_name?: string;
  image_url: string;
  prep_time_mins: number;
  allergens?: string;
}

export const LandingPage: React.FC = () => {
  const { addToCart, user } = useAuth();
  const navigate = useNavigate();

  const [categories, setCategories] = useState<any[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedCatId, setSelectedCatId] = useState<number | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [catRes, itemRes] = await Promise.all([
        api.get('/menu/categories'),
        api.get('/menu/items?available_only=true')
      ]);
      setCategories(catRes.data);
      setMenuItems(itemRes.data);
    } catch (err) {
      console.error('Failed to load menu data:', err);
    }
  };

  const handleAddToCart = (item: MenuItem) => {
    addToCart(item);
    if (!user) {
      navigate('/student/login', { state: { redirectToCheckout: true } });
    } else if (user.role === 'STAFF') {
      navigate('/staff/checkout');
    } else {
      navigate('/student/checkout');
    }
  };

  const filteredItems = selectedCatId
    ? menuItems.filter((i) => i.category_id === selectedCatId)
    : menuItems;

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 font-sans selection:bg-amber-500 selection:text-stone-950 flex flex-col">
      
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-10 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-stone-900 border border-amber-500/30 text-amber-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Campus Canteen Pre-Order & Token Scheduling</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-serif font-bold text-white tracking-tight leading-tight">
              Artisanal Coffee & <br />
              <span className="text-amber-500 font-sans italic font-normal">
                Crafted Campus Meals
              </span>
            </h1>

            <p className="text-sm sm:text-base text-stone-300 leading-relaxed max-w-xl font-light">
              Experience zero-wait canteen pre-ordering. Sync your class timetable break hours, reserve pickup slots, and collect warm gourmet meals with digital token verification.
            </p>

            {/* Portal Login Links Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <Link
                to="/student/login"
                className="bg-stone-900 border border-stone-800 hover:border-amber-500/60 p-4 rounded-2xl shadow-xl transition group block text-left"
              >
                <div className="w-9 h-9 rounded-xl bg-amber-950 border border-amber-800 text-amber-400 flex items-center justify-center mb-2 group-hover:scale-110 transition">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <span className="font-bold text-white text-xs block">Student Portal</span>
                <span className="text-[10px] text-amber-400 font-medium mt-0.5 block">Login to Order &rarr;</span>
              </Link>

              <Link
                to="/staff/login"
                className="bg-stone-900 border border-stone-800 hover:border-teal-500/60 p-4 rounded-2xl shadow-xl transition group block text-left"
              >
                <div className="w-9 h-9 rounded-xl bg-teal-950 border border-teal-800 text-teal-400 flex items-center justify-center mb-2 group-hover:scale-110 transition">
                  <Briefcase className="w-4 h-4" />
                </div>
                <span className="font-bold text-white text-xs block">Staff Portal</span>
                <span className="text-[10px] text-teal-400 font-medium mt-0.5 block">Express Counter &rarr;</span>
              </Link>

              <Link
                to="/admin/login"
                className="bg-stone-900 border border-stone-800 hover:border-purple-500/60 p-4 rounded-2xl shadow-xl transition group block text-left"
              >
                <div className="w-9 h-9 rounded-xl bg-purple-950 border border-purple-800 text-purple-400 flex items-center justify-center mb-2 group-hover:scale-110 transition">
                  <Shield className="w-4 h-4" />
                </div>
                <span className="font-bold text-white text-xs block">Admin Portal</span>
                <span className="text-[10px] text-purple-400 font-medium mt-0.5 block">Kitchen Kanban &rarr;</span>
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="bg-stone-900 border border-stone-800 rounded-3xl p-5 shadow-2xl relative overflow-hidden group">
              <div className="relative h-72 sm:h-80 w-full rounded-2xl overflow-hidden mb-4">
                <img
                  src="https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&auto=format&fit=crop&q=60"
                  alt="Cafe Interior"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/20 to-transparent"></div>
                
                <div className="absolute bottom-4 left-4 right-4 p-3 rounded-xl bg-stone-950/80 backdrop-blur border border-stone-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">Live Campus Token</span>
                    <h4 className="font-black text-white text-lg">Token A142</h4>
                  </div>
                  <span className="px-3 py-1 bg-amber-500 text-stone-950 font-black text-xs rounded-lg">
                    Ready 12:20 PM
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-stone-400 pt-1 px-1">
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-amber-400" /> Class Timetable Sync</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-amber-400" /> Razorpay Verified</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Category Selector Filter Bar */}
      <section className="py-4 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2.5 overflow-x-auto pb-3 scrollbar-none">
          <button
            onClick={() => setSelectedCatId(null)}
            className={`px-5 py-2 rounded-full text-xs font-bold shrink-0 transition ${
              selectedCatId === null
                ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/20'
                : 'bg-stone-900 text-stone-300 hover:text-white border border-stone-800'
            }`}
          >
            🍽️ All Categories ({menuItems.length})
          </button>

          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCatId(cat.id)}
              className={`px-5 py-2 rounded-full text-xs font-bold shrink-0 transition ${
                selectedCatId === cat.id
                  ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/20'
                  : 'bg-stone-900 text-stone-300 hover:text-white border border-stone-800'
              }`}
            >
              <span>{cat.name}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Main Food Items Catalog (40+ Items) */}
      <section className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full flex-1">
        
        <div className="flex justify-between items-end mb-6">
          <div>
            <h2 className="text-2xl font-serif font-bold text-white">Full Campus Menu Catalog</h2>
            <p className="text-xs text-stone-400 mt-1">Select items to pre-order for your upcoming class break</p>
          </div>
          <span className="text-xs font-bold text-amber-400">
            {filteredItems.length} items available
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-stone-900 border border-stone-800/80 rounded-3xl overflow-hidden shadow-xl hover:border-amber-500/50 transition duration-300 p-4 flex flex-col justify-between group"
            >
              <div>
                <div className="relative h-44 w-full rounded-2xl overflow-hidden bg-stone-800 mb-3.5">
                  <FoodImage
                    src={item.image_url}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <span className="absolute top-2.5 left-2.5 bg-stone-950/90 backdrop-blur px-2.5 py-0.5 rounded-full text-[10px] font-extrabold text-amber-400 border border-stone-800 z-20">
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

                <h3 className="font-serif font-bold text-white text-base leading-snug">{item.name}</h3>
                <p className="text-xs text-stone-400 mt-1 line-clamp-2 leading-relaxed font-light">{item.description}</p>
              </div>

              <div className="mt-5 pt-3 border-t border-stone-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-semibold text-stone-500 block uppercase">Price</span>
                  <span className="text-base font-extrabold text-white">₹{item.price.toFixed(2)}</span>
                </div>

                <button
                  onClick={() => handleAddToCart(item)}
                  className="w-9 h-9 rounded-full bg-amber-500 hover:bg-amber-400 text-stone-950 flex items-center justify-center font-black shadow-md shadow-amber-500/20 transition hover:scale-105 active:scale-95"
                  title="Add to cart & pre-order"
                >
                  <Plus className="w-5 h-5 stroke-[3]" />
                </button>
              </div>
            </div>
          ))}
        </div>

      </section>

      {/* Footer */}
      <footer className="py-8 bg-stone-950 border-t border-stone-800 text-center text-xs text-stone-500">
        <p>© 2026 CampusBites — Minimalist Luxury Campus Canteen SaaS System.</p>
      </footer>

    </div>
  );
};

export default LandingPage;
