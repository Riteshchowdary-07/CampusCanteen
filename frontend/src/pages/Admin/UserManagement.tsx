import React, { useEffect, useState } from 'react';
import api from '../../api/client';
import { Navbar } from '../../components/Navbar';
import { Sidebar } from '../../components/Sidebar';
import { Users, UserX, UserCheck } from 'lucide-react';

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleStatus = async (userId: number, currentStatus: string) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      await api.put(`/admin/users/${userId}/status?new_status=${newStatus}`);
      fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to update user status.');
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
                <Users className="w-6 h-6 text-amber-500" /> User & Role Management
              </h1>
              <p className="text-xs text-stone-400 mt-1">Provision roles and enforce account suspension policy.</p>
            </div>
          </div>

          <div className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden shadow-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-950 border-b border-stone-800 text-stone-400 font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-4">Full Name & Email</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Account Status</th>
                  <th className="p-4">Joined Date</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800/60">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-stone-950/50 transition">
                    <td className="p-4">
                      <span className="font-bold text-white text-sm block">{u.full_name}</span>
                      <span className="text-stone-400">{u.email}</span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded text-[10px] font-extrabold uppercase ${
                        u.role === 'CANTEEN_ADMIN' ? 'bg-amber-950/80 text-amber-300 border border-amber-800' :
                        u.role === 'STAFF' ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800' :
                        'bg-stone-800 text-stone-300 border border-stone-700'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        u.status === 'ACTIVE' ? 'bg-emerald-950 text-emerald-300' : 'bg-red-950 text-red-400'
                      }`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="p-4 text-stone-400">{new Date(u.created_at).toLocaleDateString()}</td>
                    <td className="p-4 text-right">
                      {u.role !== 'CANTEEN_ADMIN' && (
                        <button
                          onClick={() => handleToggleStatus(u.id, u.status)}
                          className={`px-3 py-1.5 rounded-lg font-bold transition text-[11px] flex items-center gap-1 ml-auto ${
                            u.status === 'ACTIVE'
                              ? 'bg-red-950 hover:bg-red-900 border border-red-800 text-red-300'
                              : 'bg-emerald-950 hover:bg-emerald-900 border border-emerald-800 text-emerald-300'
                          }`}
                        >
                          {u.status === 'ACTIVE' ? (
                            <> <UserX className="w-3.5 h-3.5" /> Suspend Account </>
                          ) : (
                            <> <UserCheck className="w-3.5 h-3.5" /> Activate Account </>
                          )}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </main>
      </div>
    </div>
  );
};
