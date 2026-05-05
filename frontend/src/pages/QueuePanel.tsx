import React, { useState, useEffect } from 'react';
import {
  PhoneCall, UserX, ArrowUpCircle, Clock, Users, Stethoscope,
  UserPlus, CheckCircle2, Activity, Wifi, X, MapPin
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import api from '../api';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Appointment {
  id: string;
  patient_id: string;
  status: 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  queue_token: string;
  priority_score: number;
  slot?: {
    doctor_id: string;
    doctor?: { full_name: string };
  }
}

export default function QueuePanel() {
  const [queue, setQueue] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [walkin, setWalkin] = useState({ patient_id: '', slot_id: '' });

  const fetchData = async () => {
    try {
      const [apptsRes, docsRes] = await Promise.all([
        api.get('/appointments/all'),
        api.get('/doctors/')
      ]);
      setQueue(apptsRes.data);
      setDoctors(docsRes.data);
    } catch (err) {
      console.error('Failed to fetch queue data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, []);

  const handleCall = async (id: string) => {
    try {
      await api.patch(`/appointments/${id}/call`);
      fetchData();
    } catch (err) { alert('Action failed'); }
  };

  const handleNoShow = async (id: string) => {
    try {
      await api.patch(`/appointments/${id}/no-show`);
      fetchData();
    } catch (err) { alert('Action failed'); }
  };

  const handleBump = async (id: string) => {
    try {
      await api.patch(`/appointments/${id}/bump`);
      fetchData();
    } catch (err) { alert('Action failed'); }
  };

  const waiting = queue.filter(a => a.status === 'CONFIRMED').length;
  const consulting = queue.filter(a => a.status === 'IN_PROGRESS').length;

  if (loading) return <div className="p-10 text-center">Loading Live Queue...</div>;

  return (
    <div className="max-w-7xl mx-auto pb-12 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-navy-900 tracking-tight">Live Queue</h1>
          <p className="text-navy-500 mt-1">Manage patient flow in real-time</p>
        </div>
        <div className="flex items-center gap-2 bg-status-open/10 text-status-open px-4 py-2 rounded-xl text-sm font-bold">
          <Wifi size={16} className="animate-pulse" /> Live
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-surface rounded-2xl shadow-skyline border border-navy-100 overflow-hidden">
            <div className="grid grid-cols-[80px_1fr_auto_auto] gap-4 px-5 py-3 bg-navy-50 border-b border-navy-100 text-xs font-semibold text-navy-400 uppercase">
              <span>Token</span>
              <span>Patient & Doctor</span>
              <span className="text-right">Status</span>
              <span className="text-right pr-4">Actions</span>
            </div>

            {queue.length === 0 ? (
              <div className="py-20 text-center text-navy-400">Queue is currently empty.</div>
            ) : queue.map((appt, idx) => (
              <div key={appt.id} className={cn(
                "grid grid-cols-[80px_1fr_auto_auto] gap-4 items-center px-5 py-4 border-b border-navy-100 last:border-0",
                appt.status === 'IN_PROGRESS' && "bg-primary-50/50"
              )}>
                <div className="font-bold text-primary-600">{appt.queue_token}</div>
                <div>
                  <p className="font-semibold text-navy-900">ID: {appt.patient_id.split('-')[0]}</p>
                  <p className="text-xs text-navy-400">Score: {appt.priority_score}</p>
                </div>
                <div>
                  <span className={cn(
                    "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase",
                    appt.status === 'IN_PROGRESS' ? "bg-status-open/10 text-status-open" : "bg-navy-100 text-navy-500"
                  )}>
                    {appt.status}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleCall(appt.id)} className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg" title="Call"><PhoneCall size={18} /></button>
                  <button onClick={() => handleBump(appt.id)} className="p-2 text-status-warning hover:bg-status-warning/10 rounded-lg" title="Bump"><ArrowUpCircle size={18} /></button>
                  <button onClick={() => handleNoShow(appt.id)} className="p-2 text-status-error hover:bg-status-error/10 rounded-lg" title="No-Show"><UserX size={18} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-5">
          <div className="bg-surface rounded-2xl shadow-skyline border border-navy-100 p-5 space-y-4">
            <h2 className="font-bold text-navy-900">Queue Summary</h2>
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="bg-navy-50 rounded-xl p-4">
                <Users size={20} className="mx-auto mb-1 text-primary-600" />
                <p className="text-2xl font-bold text-navy-900">{waiting}</p>
                <p className="text-xs text-navy-400 uppercase font-bold">Waiting</p>
              </div>
              <div className="bg-navy-50 rounded-xl p-4">
                <Stethoscope size={20} className="mx-auto mb-1 text-status-open" />
                <p className="text-2xl font-bold text-navy-900">{consulting}</p>
                <p className="text-xs text-navy-400 uppercase font-bold">In-Room</p>
              </div>
            </div>
          </div>

          <div className="bg-surface rounded-2xl shadow-skyline border border-navy-100 p-5">
            <h2 className="font-bold text-navy-900 mb-4">Doctor Availability</h2>
            <div className="space-y-3">
              {doctors.map(d => (
                <div key={d.id} className="flex items-center justify-between">
                  <span className="text-sm font-semibold">{d.full_name}</span>
                  <span className="w-3 h-3 rounded-full bg-status-open"></span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
