import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { UserCheck, Lock, Mail, Eye, EyeOff, AlertCircle, GraduationCap, Briefcase, Shield } from 'lucide-react';

export const StaffLogin: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('staff@example.com');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await api.post('/auth/login', { email, password });
      const data = res.data;

      if (data.role !== 'STAFF') {
        setError(`Access denied. Account has role '${data.role}'. Please use the ${data.role} Portal.`);
        setLoading(false);
        return;
      }

      login(data.access_token, {
        id: data.user_id,
        email: data.email,
        full_name: data.full_name,
        role: data.role,
        status: 'ACTIVE'
      });

      navigate('/staff/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Invalid credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col justify-center items-center px-4 relative overflow-hidden font-sans">
      
      <div className="w-full max-w-md bg-stone-900 border border-stone-800 rounded-3xl p-8 shadow-2xl relative z-10">
        
        {/* Portal Switching Tabs */}
        <div className="flex justify-between p-1 bg-stone-950 border border-stone-800 rounded-2xl mb-8 text-xs font-bold">
          <Link
            to="/student/login"
            className="flex-1 py-2 rounded-xl text-center text-stone-400 hover:text-white flex items-center justify-center gap-1.5 transition"
          >
            <GraduationCap className="w-3.5 h-3.5" /> Student
          </Link>
          <Link
            to="/staff/login"
            className="flex-1 py-2 rounded-xl text-center bg-amber-500 text-stone-950 flex items-center justify-center gap-1.5 shadow-sm font-bold"
          >
            <Briefcase className="w-3.5 h-3.5" /> Staff
          </Link>
          <Link
            to="/admin/login"
            className="flex-1 py-2 rounded-xl text-center text-stone-400 hover:text-white flex items-center justify-center gap-1.5 transition"
          >
            <Shield className="w-3.5 h-3.5" /> Admin
          </Link>
        </div>

        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-stone-950 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto mb-3 shadow-lg">
            <UserCheck className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">Staff Portal Login</h2>
          <p className="text-xs text-stone-400 mt-1">Express food ordering for faculty & staff</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-950/80 border border-red-800 text-red-300 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-300 mb-1">Staff ID / Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-stone-500 absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500 transition"
                placeholder="staff@example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-300 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-stone-500 absolute left-3.5 top-3.5" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500 transition"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-stone-500 hover:text-stone-300"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold rounded-xl shadow-lg shadow-amber-500/20 transition text-sm disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Login as Staff'}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-stone-800/80 text-center">
          <p className="text-[11px] text-stone-500 mb-2">Demo Credentials Auto-filled</p>
          <button
            type="button"
            onClick={handleSubmit}
            className="w-full py-2 bg-stone-950 hover:bg-stone-800 border border-stone-800 text-stone-300 rounded-xl text-xs font-bold transition"
          >
            ⚡ One-Click Staff Login
          </button>
        </div>

      </div>
    </div>
  );
};

export default StaffLogin;
