import React, { useEffect, useState } from 'react';
import api from '../../api/client';
import { Navbar } from '../../components/Navbar';
import { Sidebar } from '../../components/Sidebar';
import { ShieldCheck } from 'lucide-react';

export const AuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    api.get('/admin/audit-logs').then((res) => setLogs(res.data)).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col font-sans">
      <Navbar />

      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-6 sm:p-8 max-w-7xl">
          
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-amber-500" /> Administrative Audit Trail
              </h1>
              <p className="text-xs text-stone-400 mt-1">Immutable security record of all administrative operations, price modifications, and stock adjustments.</p>
            </div>
          </div>

          <div className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden shadow-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-950 border-b border-stone-800 text-stone-400 font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-4">Timestamp</th>
                  <th className="p-4">Administrator</th>
                  <th className="p-4">Action</th>
                  <th className="p-4">Target Resource</th>
                  <th className="p-4">Details & Value Changes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800/60 font-mono">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-stone-950/50 transition">
                    <td className="p-4 text-stone-400">{new Date(log.timestamp).toLocaleString()}</td>
                    <td className="p-4 font-bold text-white">{log.user_name || 'System'}</td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-800 font-bold">
                        {log.action}
                      </span>
                    </td>
                    <td className="p-4 text-stone-300">{log.resource}</td>
                    <td className="p-4 text-stone-300 font-sans">
                      <div>{log.details}</div>
                      {log.previous_value && log.new_value && (
                        <div className="text-[10px] text-stone-400 mt-1 font-mono">
                          <span className="text-red-400">Old: {log.previous_value}</span> &rarr; <span className="text-emerald-400">New: {log.new_value}</span>
                        </div>
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
