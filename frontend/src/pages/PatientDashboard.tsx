import { useState, useEffect } from 'react';
import {
  Calendar, Clock, User, FileText, CheckCircle,
  AlertCircle, ArrowRight, Activity, Bell, ChevronRight, CheckCircle2
} from 'lucide-react';
import api from '../api';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Link } from 'react-router-dom';
import { toISTTime, toISTDate, toISTShortDate } from '../utils/time';

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
        setAppointments(res.data.items || res.data);
      } catch (err) {
        console.error('Failed to fetch appointments');
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, []);

  // IST today date string for comparison
  const todayStr = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }); // YYYY-MM-DD

  const confirmedAppointments = appointments
    .filter(a => a.status === 'CONFIRMED' || a.status === 'IN_PROGRESS')
    .sort((a, b) => new Date(a.slot.start_time).getTime() - new Date(b.slot.start_time).getTime());

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

          {/* Upcoming Consultations — next 10, grouped by date */}
          <div className="bg-white rounded-[24px] border border-navy-100 shadow-skyline overflow-hidden">
            {/* Header */}
            <div className="px-8 py-6 border-b border-navy-50 flex items-center justify-between bg-gradient-to-r from-primary-50/60 to-white">
              <div>
                <h3 className="text-xs font-bold text-navy-400 uppercase tracking-widest mb-0.5">Your Upcoming Consultations</h3>
                <p className="text-[10px] text-navy-300 font-medium">Next {Math.min(confirmedAppointments.length, 10)} scheduled · IST</p>
              </div>
              <Link
                to="/book"
                className="flex items-center gap-1.5 text-[11px] font-bold text-primary-600 hover:text-primary-700 bg-primary-50 px-3 py-1.5 rounded-lg border border-primary-100 transition-colors"
              >
                <Calendar size={12} /> Book New
              </Link>
            </div>

            {loading ? (
              <div className="py-16 text-center text-navy-400 text-sm">Loading your schedule...</div>
            ) : confirmedAppointments.length === 0 ? (
              <div className="py-16 text-center">
                <div className="w-16 h-16 bg-navy-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar size={28} className="text-navy-300" />
                </div>
                <p className="text-navy-400 font-medium mb-3">No upcoming appointments scheduled.</p>
                <Link to="/book" className="text-primary-600 font-bold text-sm hover:underline">Schedule one now →</Link>
              </div>
            ) : (() => {
              // Group next 10 by IST date
              const next10 = confirmedAppointments.slice(0, 10);
              const tomorrowStr = new Date(Date.now() + 86400000).toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });

              // Build date-grouped structure
              const grouped: Record<string, typeof next10> = {};
              next10.forEach(a => {
                const dateKey = new Date(a.slot.start_time).toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
                if (!grouped[dateKey]) grouped[dateKey] = [];
                grouped[dateKey].push(a);
              });

              return (
                <div className="divide-y divide-navy-50">
                  {Object.entries(grouped).map(([dateKey, appts]) => {
                    const isGroupToday = dateKey === todayStr;
                    const isGroupTomorrow = dateKey === tomorrowStr;
                    const dateLabel = isGroupToday ? 'Today' : isGroupTomorrow ? 'Tomorrow' : toISTDate(appts[0].slot.start_time);

                    return (
                      <div key={dateKey}>
                        {/* Date separator */}
                        <div className={cn(
                          'px-8 py-3 flex items-center gap-3',
                          isGroupToday
                            ? 'bg-status-open/5 border-b border-status-open/10'
                            : 'bg-navy-50/60 border-b border-navy-100/60'
                        )}>
                          <div className={cn(
                            'w-2 h-2 rounded-full',
                            isGroupToday ? 'bg-status-open' : 'bg-navy-300'
                          )} />
                          <span className={cn(
                            'text-[11px] font-black uppercase tracking-widest',
                            isGroupToday ? 'text-status-open' : 'text-navy-500'
                          )}>
                            {dateLabel}
                          </span>
                          {isGroupToday && (
                            <span className="text-[9px] font-bold text-status-open bg-status-open/10 px-2 py-0.5 rounded-full animate-pulse">
                              Live
                            </span>
                          )}
                          <span className="ml-auto text-[10px] font-medium text-navy-400">
                            {appts.length} appointment{appts.length > 1 ? 's' : ''}
                          </span>
                        </div>

                        {/* Appointments for this date */}
                        {appts.map((apt, idx) => {
                          const aptIsToday = isGroupToday;
                          return (
                            <Link
                              key={apt.id}
                              to={`/appointment/${apt.id}`}
                              className="flex items-center gap-4 px-8 py-4 hover:bg-navy-50/40 transition-colors group/row"
                            >
                              {/* Time block */}
                              <div className={cn(
                                'w-16 text-center shrink-0 py-2 rounded-xl',
                                aptIsToday ? 'bg-status-open/10' : 'bg-primary-50'
                              )}>
                                <p className={cn(
                                  'text-sm font-black leading-none',
                                  aptIsToday ? 'text-status-open' : 'text-primary-700'
                                )}>
                                  {toISTTime(apt.slot.start_time).split(' ')[0]}
                                </p>
                                <p className={cn(
                                  'text-[9px] font-bold mt-0.5',
                                  aptIsToday ? 'text-status-open/70' : 'text-primary-400'
                                )}>
                                  {toISTTime(apt.slot.start_time).split(' ')[1]}
                                </p>
                              </div>

                              {/* Doctor info */}
                              <div className="flex-1 min-w-0">
                                <p className="font-bold text-navy-900 text-sm truncate">
                                  {apt.slot.doctor?.full_name || 'Assigned Physician'}
                                </p>
                                <p className="text-xs text-navy-400 mt-0.5">
                                  {apt.slot.doctor?.specialty || 'General'} · Token {apt.queue_token}
                                </p>
                              </div>

                              {/* Status badge */}
                              <div className="flex items-center gap-3 shrink-0">
                                <span className={cn(
                                  'px-2 py-0.5 text-[9px] font-black uppercase rounded-md',
                                  apt.status === 'IN_PROGRESS'
                                    ? 'bg-status-warning/10 text-status-warning'
                                    : 'bg-status-open/10 text-status-open'
                                )}>
                                  {apt.status === 'IN_PROGRESS' ? 'In Progress' : apt.status}
                                </span>
                                <ChevronRight size={16} className="text-navy-200 group-hover/row:text-navy-500 transition-colors" />
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    );
                  })}

                  {confirmedAppointments.length > 10 && (
                    <div className="px-8 py-4 text-center">
                      <p className="text-xs text-navy-400 font-medium">
                        +{confirmedAppointments.length - 10} more appointments not shown
                      </p>
                    </div>
                  )}
                </div>
              );
            })()}
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
                        <p className="text-xs text-navy-400">{toISTShortDate(apt.slot.start_time)} · {apt.slot.doctor?.specialty || 'General'}</p>
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
