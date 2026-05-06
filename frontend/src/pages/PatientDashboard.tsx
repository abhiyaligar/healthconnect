import { useState, useEffect } from 'react';
import {
  Calendar, Clock, User, FileText, CheckCircle,
  AlertCircle, ArrowRight, Activity, Bell, ChevronRight, CheckCircle2
} from 'lucide-react';
import api from '../api';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Link } from 'react-router-dom';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Appointment {
  id: string;
  queue_token: string;
  status: string;
  priority_score: number;
  created_at: string;
  slot: {
    start_time: string;
    end_time: string;
    doctor: {
      full_name: string;
      specialty: string;
    };
  };
}

export default function PatientDashboard() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const res = await api.get('/appointments/me');
        setAppointments(res.data);
      } catch (err) {
        console.error('Failed to fetch appointments');
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, []);

  const upcoming = appointments
    .filter(a => a.status === 'CONFIRMED' || a.status === 'IN_PROGRESS')
    .sort((a, b) => new Date(a.slot.start_time).getTime() - new Date(b.slot.start_time).getTime())[0];

  const past = appointments
    .filter(a => a.status === 'COMPLETED')
    .sort((a, b) => new Date(b.slot.start_time).getTime() - new Date(a.slot.start_time).getTime());

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-navy-900 tracking-tight">Patient Dashboard</h1>
          <p className="text-navy-500 mt-1">Manage your health and upcoming consultations.</p>
        </div>
        <Link
          to="/book"
          className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-primary-200"
        >
          <Calendar size={18} />
          Book New Appointment
        </Link>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Main Column */}
        <div className="col-span-12 lg:col-span-8 space-y-6">

          {/* Upcoming Appointment Card */}
          <div className="bg-white rounded-[24px] p-8 border border-navy-100 shadow-skyline relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-50 rounded-full -mr-16 -mt-16 transition-all group-hover:scale-110" />

            <h3 className="text-xs font-bold text-navy-400 uppercase tracking-widest mb-6 relative">Your Next Consultation</h3>

            {loading ? (
              <div className="py-8 text-center text-navy-400">Loading your schedule...</div>
            ) : upcoming ? (
              <div className="flex flex-col md:flex-row md:items-center gap-8 relative">
                <div className="w-20 h-20 rounded-2xl bg-primary-100 flex items-center justify-center shrink-0">
                  <Calendar size={32} className="text-primary-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="px-2 py-0.5 bg-status-open/10 text-status-open text-[10px] font-black uppercase rounded">
                      {upcoming.status}
                    </span>
                    <span className="text-navy-300 text-xs">Token: {upcoming.queue_token}</span>
                  </div>
                  <h2 className="text-2xl font-bold text-navy-900">
                    {new Date(upcoming.slot.start_time).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                  </h2>
                  <p className="text-lg text-navy-600 font-medium">
                    {new Date(upcoming.slot.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })} with {upcoming.slot.doctor?.full_name || 'Assigned Physician'}
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  <Link
                    to={`/appointment/${upcoming.id}`}
                    className="px-6 py-2.5 bg-navy-900 text-white rounded-lg text-sm font-bold hover:bg-navy-800 transition-all text-center"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center">
                <p className="text-navy-400 font-medium mb-4">No upcoming appointments scheduled.</p>
                <Link to="/book" className="text-primary-600 font-bold hover:underline">Schedule one now →</Link>
              </div>
            )}
          </div>

          {/* Past Appointments List */}
          <div className="bg-white rounded-[24px] border border-navy-100 shadow-skyline overflow-hidden">
            <div className="p-6 border-b border-navy-50 flex items-center justify-between">
              <h3 className="text-sm font-bold text-navy-800 uppercase tracking-wider">Appointment History</h3>
              <span className="text-xs text-navy-400 font-medium">{past.length} visits total</span>
            </div>
            <div className="divide-y divide-navy-50">
              {past.length === 0 ? (
                <div className="p-12 text-center text-navy-400">No past medical visits found.</div>
              ) : (
                past.map((apt) => (
                  <Link
                    to={`/appointment/${apt.id}`}
                    className="p-6 flex items-center justify-between hover:bg-navy-50/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-navy-100 flex items-center justify-center text-navy-500">
                        <CheckCircle2 size={18} />
                      </div>
                      <div>
                        <p className="font-bold text-navy-900">{apt.slot.doctor?.full_name || 'Assigned Physician'}</p>
                        <p className="text-xs text-navy-400">{new Date(apt.slot.start_time).toLocaleDateString()} · {apt.slot.doctor?.specialty || 'General'}</p>
                      </div>
                    </div>
                    <ChevronRight size={20} className="text-navy-300" />
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Column */}
        <div className="col-span-12 lg:col-span-4 space-y-6">

          {/* Health Stats */}
          <div className="bg-navy-900 rounded-[24px] p-8 text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-20">
              <Activity size={48} />
            </div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary-400 mb-6">Patient Health Score</h3>
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-5xl font-black tracking-tighter">92</span>
              <span className="text-primary-400 font-bold">/100</span>
            </div>
            <p className="text-navy-300 text-sm leading-relaxed">
              Your health metrics are optimal. Continue your current lifestyle and don't miss your next checkup.
            </p>
            <div className="mt-8 pt-6 border-t border-navy-800 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-navy-400 uppercase">Wait Time</span>
                <span className="font-bold text-primary-400 flex items-center gap-1.5 mt-1">
                  <Clock size={14} /> 12 min
                </span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-bold text-navy-400 uppercase">Alerts</span>
                <span className="font-bold text-status-warning flex items-center gap-1.5 mt-1">
                  <Bell size={14} /> 0 Active
                </span>
              </div>
            </div>
          </div>

          {/* Quick Support */}
          <div className="bg-surface rounded-[24px] p-8 border border-navy-100 shadow-skyline">
            <h3 className="text-sm font-bold text-navy-800 uppercase tracking-wider mb-6">Need Assistance?</h3>
            <div className="space-y-4">
              <div className="p-4 bg-navy-50 rounded-2xl border border-navy-100">
                <p className="text-xs font-bold text-navy-900 mb-1">24/7 Helpline</p>
                <p className="text-lg font-black text-primary-700 tracking-tight">180012341234</p>
              </div>
              <p className="text-xs text-navy-400 leading-relaxed">
                If you have an emergency, please visit the nearest hospital immediately.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
