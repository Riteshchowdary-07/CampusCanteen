import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, type UserRole } from '../context/AuthContext';
import { ShoppingBag, LogOut, Search, GraduationCap, Briefcase, ShieldCheck } from 'lucide-react';

interface NavbarProps {
  onSearch?: (query: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onSearch }) => {
  const { user, logout, cart } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    if (onSearch) onSearch(e.target.value);
  };

  const navigateToPortal = (role: UserRole) => {
    if (role === 'STAFF') {
      navigate('/staff/login');
    } else if (role === 'CANTEEN_ADMIN') {
      navigate('/admin/login');
    } else {
      navigate('/student/login');
    }
  };

  const handleCartClick = () => {
    if (!user) {
      navigate('/student/login', { state: { redirectToCheckout: true } });
      return;
    }
    if (user.role === 'STAFF') {
      navigate('/staff/checkout');
    } else {
      navigate('/student/checkout');
    }
  };

  return (
    <header className="bg-stone-950/90 backdrop-blur-md border-b border-stone-800/80 sticky top-0 z-50 text-stone-100 font-sans shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2.5 shrink-0 group">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-600 to-amber-500 border border-amber-400/40 flex items-center justify-center text-stone-950 font-black shadow-md shadow-amber-600/20 group-hover:scale-105 transition-transform">
              <span className="text-sm tracking-tighter">C</span>
            </div>
            <span className="font-serif font-bold text-lg text-white tracking-wide">
              Campus<span className="text-amber-500 font-sans font-light">Cafe</span>
            </span>
          </Link>

          {/* Search Bar */}
          <div className="flex-1 max-w-md hidden md:block">
            <div className="relative">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-2.5" />
              <input
                type="text"
                placeholder="Search menu, coffee, meals..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full pl-10 pr-4 py-2 bg-stone-900 border border-stone-800 rounded-full text-xs text-stone-100 placeholder-stone-400 focus:outline-none focus:border-amber-500 transition"
              />
            </div>
          </div>

          {/* Right Section: PORTAL SWITCHER + CART BUTTON + USER MENU */}
          <div className="flex items-center space-x-3">
            
            {/* PORTAL SWITCHER BUTTONS */}
            <div className="flex items-center bg-stone-900 border border-stone-800 rounded-full p-1 text-xs">
              <button
                onClick={() => navigateToPortal('STUDENT')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-medium transition ${
                  user?.role === 'STUDENT'
                    ? 'bg-amber-600 text-white font-bold shadow-xs'
                    : 'text-stone-300 hover:text-white hover:bg-stone-800'
                }`}
                title="Go to Student Portal Login"
              >
                <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden lg:inline text-[11px]">Student</span>
              </button>

              <button
                onClick={() => navigateToPortal('STAFF')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-medium transition ${
                  user?.role === 'STAFF'
                    ? 'bg-teal-600 text-white font-bold shadow-xs'
                    : 'text-stone-300 hover:text-white hover:bg-stone-800'
                }`}
                title="Go to Staff Portal Login"
              >
                <Briefcase className="w-3.5 h-3.5 text-teal-400" />
                <span className="hidden lg:inline text-[11px]">Staff</span>
              </button>

              <button
                onClick={() => navigateToPortal('CANTEEN_ADMIN')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-medium transition ${
                  user?.role === 'CANTEEN_ADMIN'
                    ? 'bg-purple-600 text-white font-bold shadow-xs'
                    : 'text-stone-300 hover:text-white hover:bg-stone-800'
                }`}
                title="Go to Admin Portal Login"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                <span className="hidden lg:inline text-[11px]">Admin</span>
              </button>
            </div>

            {/* CART SYMBOL - Directly navigates to checkout on click */}
            {user?.role !== 'CANTEEN_ADMIN' && (
              <button
                onClick={handleCartClick}
                className="relative p-2 text-stone-200 hover:text-white bg-stone-900 border border-stone-800 hover:border-amber-500/60 rounded-full transition shadow-xs group"
                title="Click to view Cart & Checkout"
              >
                <ShoppingBag className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                {totalCartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-amber-500 text-stone-950 font-black text-[10px] w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                    {totalCartCount}
                  </span>
                )}
              </button>
            )}

            {/* User Info / Logout */}
            {user ? (
              <div className="flex items-center space-x-2 border-l border-stone-800 pl-3">
                <div className="w-8 h-8 rounded-full bg-stone-800 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold text-xs">
                  {user.full_name[0]}
                </div>
                <button
                  onClick={logout}
                  className="p-1.5 text-stone-400 hover:text-red-400 rounded-full transition"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                to="/student/login"
                className="px-4 py-1.5 text-xs font-bold rounded-full bg-amber-600 hover:bg-amber-500 text-white transition shadow-sm"
              >
                Sign In
              </Link>
            )}

          </div>

        </div>
      </div>
    </header>
  );
};

export default Navbar;
