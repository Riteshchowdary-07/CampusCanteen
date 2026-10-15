import React, { useEffect, useState } from 'react';
import api from '../../api/client';
import { Navbar } from '../../components/Navbar';
import { Sidebar } from '../../components/Sidebar';
import { Calendar, Plus, Trash2, Save, CheckCircle, Clock } from 'lucide-react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

export const StudentTimetable: React.FC = () => {
  const [timetable, setTimetable] = useState<any>(null);
  const [entries, setEntries] = useState<any[]>([]);
  const [selectedDay, setSelectedDay] = useState<number>(0);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [startTime, setStartTime] = useState('12:00');
  const [endTime, setEndTime] = useState('12:45');
  const [entryType, setEntryType] = useState('BREAK');

  useEffect(() => {
    fetchTimetable();
  }, []);

  const fetchTimetable = async () => {
    try {
      const res = await api.get('/timetable');
      setTimetable(res.data);
      setEntries(res.data.entries || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddEntry = () => {
    if (!title) return;
    const newEntry = {
      day_of_week: selectedDay,
      start_time: startTime,
      end_time: endTime,
      title: title,
      entry_type: entryType
    };
    setEntries([...entries, newEntry]);
    setTitle('');
  };

  const handleDeleteEntry = (idx: number) => {
    setEntries(entries.filter((_, i) => i !== idx));
  };

  const handleSave = async () => {
    setSaving(true);
    setMsg(null);
    try {
      const payload = {
        title: timetable?.title || 'Weekly Class Schedule',
        entries: entries.map((e) => ({
          day_of_week: e.day_of_week,
          start_time: e.start_time,
          end_time: e.end_time,
          title: e.title,
          entry_type: e.entry_type
        }))
      };
      const res = await api.post('/timetable', payload);
      setTimetable(res.data);
      setEntries(res.data.entries || []);
      setMsg('Timetable schedule updated successfully!');
    } catch (err) {
      setMsg('Failed to save timetable.');
    } finally {
      setSaving(false);
    }
  };

  const currentDayEntries = entries.filter((e) => e.day_of_week === selectedDay);

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col font-sans">
      <Navbar />

      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-6 sm:p-8 max-w-5xl">
          
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                <Calendar className="w-6 h-6 text-amber-500" /> Manage Timetable Schedule
              </h1>
              <p className="text-xs text-stone-400 mt-1">
                Configure class and break periods. The Smart Scheduler engine uses these windows to recommend pickup slots.
              </p>
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 transition flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Schedule'}
            </button>
          </div>

          {msg && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" /> {msg}
            </div>
          )}

          <div className="flex space-x-2 border-b border-stone-800 pb-3 mb-6">
            {DAYS.map((dayName, idx) => (
              <button
                key={dayName}
                onClick={() => setSelectedDay(idx)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                  selectedDay === idx
                    ? 'bg-amber-500 text-stone-950 shadow-lg shadow-amber-500/20'
                    : 'bg-stone-900 text-stone-400 hover:text-stone-200 border border-stone-800'
                }`}
              >
                {dayName}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            <div className="md:col-span-2 space-y-4">
              <h3 className="font-bold text-white text-sm">Schedule for {DAYS[selectedDay]}</h3>

              {currentDayEntries.length === 0 ? (
                <div className="p-8 bg-stone-900 border border-stone-800 rounded-2xl text-center text-stone-400 text-xs shadow-xl">
                  No classes or breaks added for {DAYS[selectedDay]}. Add one using the form.
                </div>
              ) : (
                <div className="space-y-2">
                  {currentDayEntries.map((item, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-xl border flex items-center justify-between text-xs transition ${
                        item.entry_type === 'BREAK' || item.entry_type === 'FREE'
                          ? 'bg-amber-950/40 border-amber-900/60 text-amber-200'
                          : 'bg-stone-900 border-stone-800 text-stone-200'
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        <span className="font-mono font-bold text-stone-400 w-28 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-stone-500" /> {item.start_time} - {item.end_time}
                        </span>
                        <div>
                          <span className="font-bold text-white block">{item.title}</span>
                          <span className={`inline-block text-[10px] font-bold uppercase px-1.5 py-0.5 rounded mt-0.5 ${
                            item.entry_type === 'BREAK' ? 'bg-amber-900/80 text-amber-300' : 'bg-stone-800 text-stone-300'
                          }`}>
                            {item.entry_type}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteEntry(entries.indexOf(item))}
                        className="p-1.5 text-stone-400 hover:text-red-400 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 h-fit space-y-4 shadow-xl">
              <h3 className="font-bold text-white text-sm">Add New Window</h3>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">Title / Course Name</label>
                <input
                  type="text"
                  placeholder="e.g. Lunch Break or Machine Learning"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">Start Time</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">End Time</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">Entry Type</label>
                <select
                  value={entryType}
                  onChange={(e) => setEntryType(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="BREAK">BREAK (Free for Pickup)</option>
                  <option value="CLASS">CLASS (Busy / Unavailable)</option>
                  <option value="FREE">FREE PERIOD (Free for Pickup)</option>
                </select>
              </div>

              <button
                type="button"
                onClick={handleAddEntry}
                className="w-full py-2.5 bg-stone-800 hover:bg-stone-700 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4 text-amber-400" /> Add Window to {DAYS[selectedDay]}
              </button>

            </div>

          </div>

        </main>
      </div>
    </div>
  );
};
