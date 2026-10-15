import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Navbar } from '../../components/Navbar';
import { Sidebar } from '../../components/Sidebar';
import { User, Mail, Shield, BookOpen, Building } from 'lucide-react';

export const StudentProfile: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col font-sans">
      <Navbar />

      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-6 sm:p-8 max-w-4xl">
          
          <h1 className="text-2xl font-black text-white tracking-tight mb-2 flex items-center gap-2">
            <User className="w-6 h-6 text-amber-400" /> Account & Profile
          </h1>
          <p className="text-xs text-stone-400 mb-8">Manage institutional profile details and permissions.</p>

          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-8 shadow-xl space-y-6">
            
            <div className="flex items-center space-x-4 pb-6 border-b border-stone-800">
              <div className="w-16 h-16 rounded-2xl bg-amber-950/80 text-amber-400 font-black text-2xl flex items-center justify-center border border-amber-800">
                {user?.full_name?.[0]}
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">{user?.full_name}</h3>
                <span className="inline-block px-2.5 py-0.5 rounded text-xs font-bold bg-amber-950 text-amber-300 border border-amber-800 mt-1 uppercase">
                  Role: {user?.role}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
              <div className="p-4 bg-stone-950 rounded-xl border border-stone-800">
                <span className="text-stone-500 font-semibold block mb-1">Email Address</span>
                <span className="font-bold text-white flex items-center gap-2">
                  <Mail className="w-4 h-4 text-amber-400" /> {user?.email}
                </span>
              </div>

              <div className="p-4 bg-stone-950 rounded-xl border border-stone-800">
                <span className="text-stone-500 font-semibold block mb-1">Student ID</span>
                <span className="font-bold text-white flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-amber-400" /> CS2026-089
                </span>
              </div>

              <div className="p-4 bg-stone-950 rounded-xl border border-stone-800">
                <span className="text-stone-500 font-semibold block mb-1">Department</span>
                <span className="font-bold text-white flex items-center gap-2">
                  <Building className="w-4 h-4 text-emerald-400" /> Computer Science
                </span>
              </div>

              <div className="p-4 bg-stone-950 rounded-xl border border-stone-800">
                <span className="text-stone-500 font-semibold block mb-1">Account Status</span>
                <span className="font-bold text-emerald-400 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-400" /> ACTIVE
                </span>
              </div>
            </div>

          </div>

        </main>
      </div>
    </div>
  );
};
