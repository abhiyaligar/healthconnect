import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Plus, Trash2, Send, CheckCircle2, User, ChevronRight, AlertCircle } from 'lucide-react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Availability {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
}

interface Doctor {
  custom_id: string;
  full_name: string;
  specialty: string;
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function ScheduleManager() {
  const { role, id: userId } = useAuth();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('');
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [loading, setLoading] = useState(false);
  const [launching, setLaunching] = useState(false);
  const [launchDate, setLaunchDate] = useState(new Date().toISOString().split('T')[0]);
  const [newSlot, setNewSlot] = useState({ day: 0, start: '09:00', end: '13:00' });
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  useEffect(() => {
    if (role === 'receptionist') {
      fetchDoctors();
    } else if (role === 'doctor') {
      fetchMyProfile();
    }
  }, [role]);

  const fetchDoctors = async () => {
    try {
      const res = await api.get('/doctors/');
      setDoctors(res.data);
      if (res.data.length > 0) {
        setSelectedDoctorId(res.data[0].custom_id);
      }
    } catch (err) {
      console.error('Failed to fetch doctors');
    }
  };

  const fetchMyProfile = async () => {
    try {
      const res = await api.get('/doctors/me');
      if (res.data && res.data.custom_id) {
        setSelectedDoctorId(res.data.custom_id);
      }
    } catch (err) {
      console.error('Failed to fetch my profile:', err);
    }
  };

  useEffect(() => {
    if (selectedDoctorId) {
      fetchAvailabilities(selectedDoctorId);
    }
  }, [selectedDoctorId]);

  const fetchAvailabilities = async (docId: string) => {
    try {
      setLoading(true);
      const res = await api.get(`/schedules/availability?doctor_id=${docId}`);
      setAvailabilities(res.data);
    } catch (err) {
      console.error('Failed to fetch availabilities');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTemplate = async () => {
    if (!selectedDoctorId) {
      setMessage({ type: 'error', text: 'No doctor selected' });
      return;
    }
    try {
      await api.post('/schedules/availability', {
        doctor_id: selectedDoctorId,
        day_of_week: newSlot.day,
        start_time: newSlot.start,
        end_time: newSlot.end
      });
      fetchAvailabilities(selectedDoctorId);
      setMessage({ type: 'success', text: 'Template added successfully' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to add template' });
    }
  };

  const handleDeleteAvailability = async (id: string) => {
    try {
      await api.delete(`/schedules/availability/${id}`);
      fetchAvailabilities(selectedDoctorId);
      setMessage({ type: 'success', text: 'Template removed' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to remove template' });
    }
  };

  const handleLaunch = async () => {
    if (!selectedDoctorId) {
      setMessage({ type: 'error', text: 'No doctor selected' });
      return;
    }
    try {
      setLaunching(true);
      const res = await api.post('/schedules/launch', {
        doctor_id: selectedDoctorId,
        date: launchDate
      });
      setMessage({ type: 'success', text: res.data.message });
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || 'Launch failed due to a system error. Please try again.';
      setMessage({ type: 'error', text: errorMsg });
    } finally {
      setLaunching(false);
    }
  };

  const handleBulkLaunch = async () => {
    if (!selectedDoctorId) {
      setMessage({ type: 'error', text: 'No doctor selected' });
      return;
    }
    try {
      setLaunching(true);
      const res = await api.post(`/schedules/launch/bulk?doctor_id=${selectedDoctorId}&days=7`);
      setMessage({ type: 'success', text: res.data.message });
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || 'Bulk launch failed. Check your internet connection or server status.';
      setMessage({ type: 'error', text: errorMsg });
    } finally {
      setLaunching(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-navy-900 tracking-tight">Schedule Manager</h1>
          <p className="text-navy-500 mt-1">Define weekly availability and launch daily slots.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Availability Setup */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-surface rounded-2xl shadow-skyline border border-navy-100 p-8">
            <h2 className="text-xl font-bold text-navy-900 mb-6 flex items-center gap-2">
              <Clock className="text-primary-600" /> Weekly Recurring Templates
            </h2>

            {role === 'receptionist' && (
              <div className="mb-8 p-4 bg-navy-50 rounded-xl border border-navy-100">
                <label className="block text-sm font-bold text-navy-700 mb-2">Select Doctor to Manage</label>
                <select 
                  value={selectedDoctorId}
                  onChange={(e) => setSelectedDoctorId(e.target.value)}
                  className="w-full p-2.5 bg-white border border-navy-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500/20"
                >
                  <option value="">Select a doctor...</option>
                  {doctors.map(doc => (
                    <option key={doc.custom_id} value={doc.custom_id}>{doc.full_name} ({doc.specialty})</option>
                  ))}
                </select>
                {doctors.length === 0 && <p className="text-[10px] text-status-error mt-1 font-bold">No doctors found in system.</p>}
              </div>
            )}

            <div className="space-y-4">
              <div className="grid grid-cols-7 gap-2">
                {DAYS.map((day, idx) => (
                  <div key={day} className="space-y-2">
                    <p className="text-[10px] uppercase font-bold text-navy-400 text-center">{day.slice(0, 3)}</p>
                    <div className="min-h-[150px] bg-navy-50/50 rounded-lg border border-dashed border-navy-200 p-2 space-y-2">
                      {availabilities.filter(a => a.day_of_week === idx).map(avail => (
                        <div key={avail.id} className="text-[10px] bg-white p-1.5 rounded border border-navy-100 shadow-sm flex justify-between items-center group">
                          <span>{avail.start_time.slice(0, 5)} - {avail.end_time.slice(0, 5)}</span>
                          <button 
                            onClick={() => handleDeleteAvailability(avail.id)}
                            className="text-navy-300 hover:text-status-error opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 size={10} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 p-6 bg-primary-50 rounded-2xl border border-primary-100">
                <h3 className="font-bold text-primary-900 mb-4 text-sm">Add New Availability Block</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                  <div>
                    <label className="block text-[10px] font-bold text-primary-700 uppercase mb-1">Day</label>
                    <select 
                      value={newSlot.day}
                      onChange={e => setNewSlot(s => ({...s, day: parseInt(e.target.value)}))}
                      className="w-full p-2 bg-white border border-primary-200 rounded-lg text-sm"
                    >
                      {DAYS.map((day, idx) => <option key={day} value={idx}>{day}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-primary-700 uppercase mb-1">Start</label>
                    <input 
                      type="time" 
                      value={newSlot.start}
                      onChange={e => setNewSlot(s => ({...s, start: e.target.value}))}
                      className="w-full p-2 bg-white border border-primary-200 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-primary-700 uppercase mb-1">End</label>
                    <input 
                      type="time" 
                      value={newSlot.end}
                      onChange={e => setNewSlot(s => ({...s, end: e.target.value}))}
                      className="w-full p-2 bg-white border border-primary-200 rounded-lg text-sm"
                    />
                  </div>
                  <button 
                    onClick={handleAddTemplate}
                    className="flex items-center justify-center gap-2 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-bold text-sm transition-all"
                  >
                    <Plus size={16} /> Add Block
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Launch Column */}
        <div className="space-y-6">
          <div className="bg-surface rounded-2xl shadow-skyline border border-navy-100 p-8">
            <h2 className="text-xl font-bold text-navy-900 mb-6 flex items-center gap-2">
              <Send className="text-primary-600" /> Launch Schedule
            </h2>
            <p className="text-sm text-navy-500 mb-6">
              Select a date to generate actual bookable slots based on the templates defined on the left.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-navy-700 mb-2">Target Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 text-navy-400" size={18} />
                  <input 
                    type="date" 
                    value={launchDate}
                    onChange={e => setLaunchDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-navy-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500/20"
                  />
                </div>
              </div>

              <button 
                onClick={handleLaunch}
                disabled={launching || !selectedDoctorId}
                className="w-full py-4 bg-navy-900 hover:bg-black text-white rounded-xl font-bold shadow-lg transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {launching ? 'Generating Slots...' : <><Send size={18} /> Launch for this Date</>}
              </button>

              <button 
                onClick={handleBulkLaunch}
                disabled={launching || !selectedDoctorId}
                className="w-full py-3 border-2 border-primary-600 text-primary-600 hover:bg-primary-50 rounded-xl font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Zap size={16} /> Launch Next 7 Days
              </button>

              {message && (
                <div className={cn(
                  "p-4 rounded-xl flex items-start gap-3 text-sm animate-in fade-in slide-in-from-top-2",
                  message.type === 'success' ? "bg-status-open/10 text-status-open border border-status-open/20" : "bg-status-error/10 text-status-error border border-status-error/20"
                )}>
                  {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                  <p>{message.text}</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-navy-50 rounded-2xl p-6 border border-navy-100">
            <h4 className="font-bold text-navy-900 text-sm mb-2 flex items-center gap-2">
              <AlertCircle size={16} className="text-primary-600" /> Pro Tip
            </h4>
            <p className="text-xs text-navy-500 leading-relaxed">
              Launching a schedule will skip slots that already exist, so it's safe to run multiple times if you add new template blocks later.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
