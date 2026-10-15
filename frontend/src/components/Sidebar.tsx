import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Utensils,
  Calendar,
  Clock,
  Ticket,
  FileText,
  User,
  ChefHat,
  Package,
  BarChart3,
  Users,
  ShieldCheck,
  TrendingUp
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { user } = useAuth();
  if (!user) return null;

  const role = user.role;

  const studentLinks = [
    { to: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/student/menu', label: 'Food Menu', icon: Utensils },
    { to: '/student/timetable', label: 'My Timetable', icon: Calendar },
    { to: '/student/orders', label: 'My Orders & Tokens', icon: Ticket },
    { to: '/student/invoices', label: 'Invoices & Receipts', icon: FileText },
    { to: '/student/profile', label: 'My Profile', icon: User },
  ];

  const staffLinks = [
    { to: '/staff/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/staff/menu', label: 'Express Menu', icon: Utensils },
    { to: '/staff/orders', label: 'My Orders & Tokens', icon: Ticket },
    { to: '/staff/invoices', label: 'Invoices', icon: FileText },
    { to: '/staff/profile', label: 'My Profile', icon: User },
  ];

  const adminLinks = [
    { to: '/admin/dashboard', label: 'Overview Dashboard', icon: LayoutDashboard },
    { to: '/admin/kitchen', label: 'Kitchen Queue (Kanban)', icon: ChefHat },
    { to: '/admin/menu', label: 'Menu & Recipes', icon: Utensils },
    { to: '/admin/inventory', label: 'Stock & Low-Stock Alerts', icon: Package },
    { to: '/admin/pickup-slots', label: 'Kitchen Capacity Slots', icon: Clock },
    { to: '/admin/timetable-analytics', label: 'Timetable Demand Chart', icon: TrendingUp },
    { to: '/admin/reports', label: 'Sales & Waste Reports', icon: BarChart3 },
    { to: '/admin/users', label: 'User Management', icon: Users },
    { to: '/admin/audit-logs', label: 'Security Audit Logs', icon: ShieldCheck },
  ];

  const links = role === 'CANTEEN_ADMIN' ? adminLinks : role === 'STAFF' ? staffLinks : studentLinks;

  return (
    <aside className="w-64 bg-stone-950 border-r border-stone-800/80 shrink-0 min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between">
      <div>
        <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-amber-500/80">
          {role === 'CANTEEN_ADMIN' ? 'Admin Control Center' : role === 'STAFF' ? 'Staff Portal' : 'Student Hub'}
        </div>
        <nav className="mt-2 space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition ${
                    isActive
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30 shadow-md shadow-amber-950/20 font-bold'
                      : 'text-stone-400 hover:text-stone-100 hover:bg-stone-900/80'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{link.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="p-3 bg-stone-900/80 rounded-xl border border-stone-800/80 text-xs text-stone-400">
        <div className="flex items-center justify-between text-[11px] font-medium text-stone-400 mb-1">
          <span>System Status</span>
          <span className="flex items-center gap-1 text-emerald-400 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Online
          </span>
        </div>
        <p className="text-[10px] text-stone-500">CampusCafe v2.0.0 Active</p>
      </div>
    </aside>
  );
};

export default Sidebar;
