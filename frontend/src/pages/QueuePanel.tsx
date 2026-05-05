import React, { useState } from 'react';
import {
  PhoneCall, UserX, ArrowUpCircle, Clock, Users, Stethoscope,
  UserPlus, CheckCircle2, Activity, Wifi, ChevronDown, ChevronUp, X, MapPin, Zap
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ─── Types ────────────────────────────────────────────────────────────────────
type Priority = 'P1' | 'P2' | 'P3';
type QStatus = 'waiting' | 'called' | 'consulting';

interface QueueEntry {
  id: string;
  position: number;
  token: string;
  name: string;
  priority: Priority;
  status: QStatus;
  waitMin: number;       // elapsed
  predictedMin: number;  // remaining until seen
  doctor: string;
  isRescheduled?: boolean;
}

// ─── Mock Data ─────────────────────────────────────────────────────────────────
const initialQueue: QueueEntry[] = [
  { id: 'q1', position: 1, token: 'T-01', name: 'Robert Johnson', priority: 'P1', status: 'consulting', waitMin: 0,  predictedMin: 0,  doctor: 'Dr. Sarah Smith', isRescheduled: false },
  { id: 'q2', position: 2, token: 'T-02', name: 'Emily Davis',    priority: 'P2', status: 'called',     waitMin: 5,  predictedMin: 8,  doctor: 'Dr. David Lee',  isRescheduled: true  },
  { id: 'q3', position: 3, token: 'T-03', name: 'Michael Brown',  priority: 'P3', status: 'waiting',    waitMin: 18, predictedMin: 22, doctor: 'Dr. Sarah Smith', isRescheduled: false },
  { id: 'q4', position: 4, token: 'T-04', name: 'Jessica Wilson', priority: 'P3', status: 'waiting',    waitMin: 24, predictedMin: 35, doctor: 'Dr. Emily Brown', isRescheduled: true  },
  { id: 'q5', position: 5, token: 'T-05', name: 'James Martinez', priority: 'P2', status: 'waiting',    waitMin: 30, predictedMin: 41, doctor: 'Dr. David Lee',  isRescheduled: false },
  { id: 'q6', position: 6, token: 'T-06', name: 'Linda Anderson', priority: 'P3', status: 'waiting',    waitMin: 38, predictedMin: 54, doctor: 'Dr. Sarah Smith', isRescheduled: false },
];

const doctors = [
  { name: 'Dr. Sarah Smith', specialty: 'Cardiology',    status: 'active'    },
  { name: 'Dr. David Lee',   specialty: 'Neurology',     status: 'active'    },
  { name: 'Dr. Emily Brown', specialty: 'Orthopedics',   status: 'break'     },
  { name: 'Dr. R. Davis',    specialty: 'Ophthalmology', status: 'overloaded' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const priorityStyle: Record<Priority, string> = {
  P1: 'bg-status-error/10 text-status-error border-status-error/30',
  P2: 'bg-status-warning/10 text-status-warning border-status-warning/30',
  P3: 'bg-navy-100 text-navy-500 border-navy-200',
};
const priorityLabel: Record<Priority, string> = {
  P1: 'Emergency', P2: 'Elevated', P3: 'Routine',
};
const bumpMap: Record<Priority, Priority> = { P1: 'P1', P2: 'P1', P3: 'P2' };

const doctorStatusStyle: Record<string, string> = {
  active:     'bg-status-open/10 text-status-open',
  break:      'bg-navy-100 text-navy-500',
  overloaded: 'bg-status-error/10 text-status-error',
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function QueuePanel() {
  const [queue, setQueue] = useState<QueueEntry[]>(initialQueue);
  const [removing, setRemoving] = useState<string | null>(null);
  const [walkin, setWalkin] = useState({ name: '', phone: '', priority: 'P3' as Priority });
  const [selectedPatient, setSelectedPatient] = useState<QueueEntry | null>(null);
  const [showTimeline, setShowTimeline] = useState(true);

  const callNext = (id: string) => {
    setQueue((q: QueueEntry[]) =>
      q.map((e: QueueEntry) => e.id === id ? { ...e, status: 'consulting' as QStatus } : e)
    );
  };

  const markNoShow = (id: string) => {
    setRemoving(id);
    setTimeout(() => {
      setQueue((q: QueueEntry[]) => q.filter((e: QueueEntry) => e.id !== id).map((e: QueueEntry, i: number) => ({ ...e, position: i + 1 })));
      setRemoving(null);
    }, 400);
  };

  const bumpPriority = (id: string) => {
    setQueue((q: QueueEntry[]) =>
      q.map((e: QueueEntry) => e.id === id ? { ...e, priority: bumpMap[e.priority] } : e)
    );
  };

  const addWalkin = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!walkin.name.trim()) return;
    const next = queue.length + 1;
    const newEntry: QueueEntry = {
      id: `q${Date.now()}`,
      position: next,
      token: `T-${String(next).padStart(2, '0')}`,
      name: walkin.name,
      priority: walkin.priority,
      status: 'waiting',
      waitMin: 0,
      predictedMin: next * 9,
      doctor: 'Dr. Sarah Smith',
      isRescheduled: false,
    };
    setQueue((q: QueueEntry[]) => [...q, newEntry]);
    setWalkin({ name: '', phone: '', priority: 'P3' as Priority });
  };

  const waiting    = queue.filter((e: QueueEntry) => e.status === 'waiting').length;
  const consulting = queue.filter((e: QueueEntry) => e.status === 'consulting').length;
  const avgWait    = queue.length > 0
    ? Math.round(queue.filter((e: QueueEntry) => e.status === 'waiting').reduce((s: number, e: QueueEntry) => s + e.waitMin, 0) / (waiting || 1))
    : 0;

  return (
    <div className="max-w-7xl mx-auto pb-12 space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-navy-900 tracking-tight">Live Queue</h1>
          <p className="text-navy-500 mt-1">Manage patient flow in real-time · Today's shift</p>
        </div>
        <div className="flex items-center gap-2 bg-status-open/10 text-status-open px-4 py-2 rounded-xl text-sm font-bold">
          <Wifi size={16} className="animate-pulse" />
          Live
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Left: Queue List ── */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-surface rounded-2xl shadow-skyline border border-navy-100 overflow-hidden">
            {/* Column headers */}
            <div className="hidden sm:grid grid-cols-[48px_1fr_auto_auto] gap-4 px-5 py-3 bg-navy-50 border-b border-navy-100 text-xs font-semibold text-navy-400 uppercase tracking-wide">
              <span>#</span>
              <span>Patient</span>
              <span className="text-right">Status</span>
              <span className="text-right pr-1">Actions</span>
            </div>

            {queue.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-navy-400">
                <CheckCircle2 size={40} className="mb-3 text-status-open" />
                <p className="font-semibold text-navy-700">Queue is empty</p>
                <p className="text-sm">All patients have been seen.</p>
              </div>
            )}

            {queue.map((entry: QueueEntry) => {
              const isConsulting = entry.status === 'consulting';
              const isCalled     = entry.status === 'called';
              const isRemoving   = removing === entry.id;

              return (
                <div
                  key={entry.id}
                  onClick={() => setSelectedPatient(entry)}
                  style={{ maxHeight: isRemoving ? 0 : 120, opacity: isRemoving ? 0 : 1, overflow: 'hidden', transition: 'max-height 0.35s ease, opacity 0.35s ease' }}
                  className={cn(
                    'grid grid-cols-[48px_1fr] sm:grid-cols-[48px_1fr_auto_auto] gap-4 items-center px-5 py-4 border-b border-navy-100 last:border-0 transition-colors cursor-pointer',
                    isConsulting && 'bg-primary-50/60 border-l-4 border-l-primary-500',
                    isCalled     && 'bg-navy-50',
                    !isConsulting && !isCalled && 'hover:bg-navy-50/50'
                  )}
                >
                  {/* Position */}
                  <div className="flex flex-col items-center">
                    <span className="text-lg font-bold text-navy-900">#{entry.position}</span>
                    <span className="text-xs text-navy-400">{entry.token}</span>
                  </div>

                  {/* Patient info */}
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-navy-900">{entry.name}</span>
                      {entry.isRescheduled && (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-status-warning bg-status-warning/10 border border-status-warning/20 px-1.5 py-0.5 rounded-full">
                          ↺ Rescheduled
                        </span>
                      )}
                      <span className={cn('px-2 py-0.5 rounded-md text-xs font-bold border', priorityStyle[entry.priority as Priority])}>
                        {entry.priority} · {priorityLabel[entry.priority as Priority]}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-navy-400">
                      <span className="flex items-center gap-1"><Stethoscope size={12} />{entry.doctor}</span>
                      {entry.status === 'waiting' && (
                        <span className="flex items-center gap-1 font-medium text-primary-500">
                          <Clock size={12} />~{entry.predictedMin}m until seen
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Status pill */}
                  <div className="col-span-2 sm:col-span-1 mt-2 sm:mt-0 flex sm:block">
                    {isConsulting && (
                      <span className="flex items-center gap-1.5 text-xs font-bold text-primary-600 bg-primary-100 px-2.5 py-1 rounded-full">
                        <Activity size={12} className="animate-pulse" /> Consulting
                      </span>
                    )}
                    {isCalled && (
                      <span className="flex items-center gap-1.5 text-xs font-bold text-status-warning bg-status-warning/10 px-2.5 py-1 rounded-full">
                        <PhoneCall size={12} /> Called
                      </span>
                    )}
                    {entry.status === 'waiting' && (
                      <span className="flex items-center gap-1.5 text-xs font-medium text-navy-500 bg-navy-100 px-2.5 py-1 rounded-full">
                        <Clock size={12} /> Waiting
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="col-span-2 sm:col-span-1 flex items-center gap-1">
                    <button
                      title="Call Next"
                      onClick={(e) => { e.stopPropagation(); callNext(entry.id); }}
                      disabled={isConsulting}
                      className="p-2 rounded-lg text-primary-500 hover:bg-primary-50 hover:text-primary-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <PhoneCall size={16} />
                    </button>
                    <button
                      title="Bump Priority"
                      onClick={(e) => { e.stopPropagation(); bumpPriority(entry.id); }}
                      disabled={entry.priority === 'P1'}
                      className="p-2 rounded-lg text-status-warning hover:bg-status-warning/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <ArrowUpCircle size={16} />
                    </button>
                    <button
                      title="Mark No-show"
                      onClick={(e) => { e.stopPropagation(); markNoShow(entry.id); }}
                      className="p-2 rounded-lg text-status-error hover:bg-status-error/10 transition-colors"
                    >
                      <UserX size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── 6.3 Doctor Timeline (Gantt) ── */}
          <div className="bg-surface rounded-2xl shadow-skyline border border-navy-100 overflow-hidden">
            <button 
              onClick={() => setShowTimeline(!showTimeline)}
              className="w-full flex items-center justify-between px-6 py-4 border-b border-navy-100 hover:bg-navy-50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Activity size={18} className="text-primary-600" />
                <h2 className="font-bold text-navy-900 text-lg">Doctor Timeline (Today)</h2>
              </div>
              {showTimeline ? <ChevronUp size={20} className="text-navy-400" /> : <ChevronDown size={20} className="text-navy-400" />}
            </button>
            
            {showTimeline && (
              <div className="p-6 overflow-x-auto">
                <div className="min-w-[800px]">
                  {/* Timeline Ruler */}
                  <div className="flex border-b border-navy-100 pb-2 mb-4">
                    <div className="w-48 shrink-0 text-xs font-bold text-navy-400 uppercase tracking-widest">Resource</div>
                    <div className="flex-1 flex justify-between px-4 text-[10px] font-bold text-navy-400">
                      <span>08 AM</span><span>09 AM</span><span>10 AM</span><span>11 AM</span><span>12 PM</span><span>01 PM</span><span>02 PM</span><span>03 PM</span><span>04 PM</span><span>05 PM</span><span>06 PM</span>
                    </div>
                  </div>
                  
                  {/* Doctor Rows */}
                  <div className="space-y-6 relative">
                    {/* Current Time Line */}
                    <div className="absolute top-0 bottom-0 left-[45%] w-px border-l-2 border-dashed border-primary-500 z-10">
                      <span className="absolute -top-1 -left-1 w-2 h-2 rounded-full bg-primary-500" />
                    </div>

                    {doctors.map(d => (
                      <div key={d.name} className="flex items-center">
                        <div className="w-48 shrink-0">
                          <p className="text-sm font-bold text-navy-900">{d.name}</p>
                          <p className="text-[10px] text-navy-400 uppercase tracking-wider">{d.specialty}</p>
                        </div>
                        <div className="flex-1 h-10 bg-navy-50 rounded-xl relative overflow-hidden flex items-center px-4">
                          {/* Mock Appointment Blocks */}
                          <div className="absolute left-[10%] w-[15%] h-6 bg-primary-200 border border-primary-300 rounded-lg shadow-sm" />
                          <div className="absolute left-[30%] w-[12%] h-6 bg-primary-200 border border-primary-300 rounded-lg shadow-sm" />
                          <div className="absolute left-[45%] w-[18%] h-6 bg-status-warning/30 border border-status-warning/40 rounded-lg shadow-sm flex items-center justify-center">
                             <Zap size={10} className="text-status-warning mr-1" />
                             <span className="text-[8px] font-bold text-status-warning">OVERBOOKED</span>
                          </div>
                          <div className="absolute left-[65%] w-[10%] h-6 bg-primary-200 border border-primary-300 rounded-lg shadow-sm" />
                          
                          {/* Fatigue Overlay */}
                          <div className="absolute bottom-0 left-0 h-1 bg-primary-500" style={{ width: d.status === 'overloaded' ? '90%' : '40%' }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-6 flex items-center gap-4 text-[10px] font-bold text-navy-400 border-t border-navy-50 pt-4">
                  <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-primary-200 border border-primary-300 rounded" /> Scheduled</div>
                  <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-status-warning/30 border border-status-warning/40 rounded" /> Overbooked</div>
                  <div className="flex items-center gap-1.5"><div className="w-12 h-0.5 bg-primary-500 rounded" /> Workload Fatigue</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Right: Stats + Walk-in ── */}
        <div className="space-y-5">

          {/* Quick stats */}
          <div className="bg-surface rounded-2xl shadow-skyline border border-navy-100 p-5 space-y-4">
            <h2 className="font-bold text-navy-900">Queue Summary</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
              {[
                { label: 'In Queue', value: waiting,    icon: Users,       color: 'text-primary-600'    },
                { label: 'Consulting', value: consulting, icon: Stethoscope, color: 'text-status-open'   },
                { label: 'Avg Wait',  value: `${avgWait}m`, icon: Clock,    color: 'text-status-warning' },
              ].map(s => (
                <div key={s.label} className="bg-navy-50 rounded-xl p-3">
                  <s.icon size={18} className={cn('mx-auto mb-1', s.color)} />
                  <p className="text-xl font-bold text-navy-900">{s.value}</p>
                  <p className="text-xs text-navy-400">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── 6.5 Queue Depth Forecast ── */}
          <div className="bg-surface rounded-2xl shadow-skyline border border-navy-100 p-5">
            <h2 className="font-bold text-navy-900 mb-4 text-sm">Queue Forecast — Next 2 Hours</h2>
            <div className="space-y-4">
              {[
                { time: '12:00', count: 18, color: 'bg-primary-500' },
                { time: '12:30', count: 26, color: 'bg-status-error' },
                { time: '01:00', count: 21, color: 'bg-status-warning' },
                { time: '01:30', count: 12, color: 'bg-primary-500' },
              ].map(f => (
                <div key={f.time} className="space-y-1.5">
                  <div className="flex justify-between text-[10px] font-bold text-navy-400 uppercase tracking-wider">
                    <span>{f.time}</span>
                    <span>{f.count} patients {f.count > 22 && '⚠'}</span>
                  </div>
                  <div className="h-4 bg-navy-50 rounded-full overflow-hidden flex relative">
                    <div className={cn("h-full transition-all duration-1000", f.color)} style={{ width: `${(f.count/30)*100}%` }} />
                    {/* Capacity Threshold Line */}
                    <div className="absolute left-[75%] top-0 bottom-0 w-px border-l border-dashed border-navy-300" />
                  </div>
                </div>
              ))}
              <p className="text-[10px] text-navy-400 font-medium italic mt-2 text-center">Dashed line indicates optimal capacity threshold (22)</p>
            </div>
          </div>

          {/* Doctor availability */}
          <div className="bg-surface rounded-2xl shadow-skyline border border-navy-100 p-5">
            <h2 className="font-bold text-navy-900 mb-4">Doctor Status</h2>
            <div className="space-y-2.5">
              {doctors.map(d => (
                <div key={d.name} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-navy-900">{d.name}</p>
                    <p className="text-xs text-navy-400">{d.specialty}</p>
                  </div>
                  <span className={cn('text-xs font-bold px-2.5 py-1 rounded-full capitalize', doctorStatusStyle[d.status])}>
                    {d.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Walk-in form */}
          <div className="bg-surface rounded-2xl shadow-skyline border border-navy-100 p-5">
            <h2 className="font-bold text-navy-900 mb-4 flex items-center gap-2">
              <UserPlus size={18} className="text-primary-500" /> Walk-in Registration
            </h2>
            <form onSubmit={addWalkin} className="space-y-3">
              <input
                type="text"
                placeholder="Patient name"
                value={walkin.name}
                onChange={e => setWalkin((w: any) => ({ ...w, name: e.target.value }))}
                required
                className="w-full px-3 py-2 border border-navy-200 rounded-lg text-sm text-navy-900 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition"
              />
              <input
                type="tel"
                placeholder="Phone number"
                value={walkin.phone}
                onChange={e => setWalkin((w: any) => ({ ...w, phone: e.target.value }))}
                className="w-full px-3 py-2 border border-navy-200 rounded-lg text-sm text-navy-900 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition"
              />
              <select
                value={walkin.priority}
                onChange={e => setWalkin((w: any) => ({ ...w, priority: e.target.value as Priority }))}
                className="w-full px-3 py-2 border border-navy-200 rounded-lg text-sm text-navy-900 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition bg-white"
              >
                <option value="P1">P1 — Emergency</option>
                <option value="P2">P2 — Elevated</option>
                <option value="P3">P3 — Routine</option>
              </select>
              <button
                type="submit"
                className="w-full py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors shadow-sm text-sm"
              >
                Add to Queue
              </button>
            </form>
          </div>
        </div>

      </div>

      {/* ── 6.4 Patient Journey Side Panel ── */}
      {selectedPatient && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-navy-900/40 backdrop-blur-sm transition-opacity" onClick={() => setSelectedPatient(null)} />
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-[slide-left_0.3s_ease-out]">
            {/* Panel Header */}
            <div className="p-8 border-b border-navy-100">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-primary-100 flex items-center justify-center text-primary-700 font-black text-xl">
                    {selectedPatient.token}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-navy-900">{selectedPatient.name}</h2>
                    <span className={cn('px-2 py-0.5 rounded-md text-[10px] font-bold border uppercase', priorityStyle[selectedPatient.priority as Priority])}>
                      {selectedPatient.priority} · {priorityLabel[selectedPatient.priority as Priority]}
                    </span>
                  </div>
                </div>
                <button onClick={() => setSelectedPatient(null)} className="p-2 hover:bg-navy-50 rounded-xl text-navy-400 transition-colors">
                  <X size={24} />
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-navy-50 p-3 rounded-xl">
                  <p className="text-[10px] font-bold text-navy-400 uppercase mb-1">Wait Time</p>
                  <p className="text-xl font-black text-navy-900">~{selectedPatient.predictedMin}m</p>
                </div>
                <div className="bg-navy-50 p-3 rounded-xl">
                  <p className="text-[10px] font-bold text-navy-400 uppercase mb-1">Priority Score</p>
                  <p className="text-xl font-black text-primary-600">3.2</p>
                </div>
              </div>
            </div>

            {/* Journey Timeline */}
            <div className="flex-1 overflow-auto p-8">
              <h3 className="text-sm font-bold text-navy-900 uppercase tracking-widest mb-6">Patient Journey</h3>
              <div className="relative space-y-8">
                {/* Vertical Line */}
                <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-navy-100" />
                
                {/* Steps */}
                <div className="relative pl-12">
                  <div className="absolute left-2.5 top-1.5 w-3.5 h-3.5 rounded-full bg-status-open border-4 border-white ring-1 ring-status-open" />
                  <p className="text-xs font-bold text-navy-400 uppercase mb-1">Originally Booked</p>
                  <p className="text-sm font-bold text-navy-900">Today · 10:30 AM</p>
                  <p className="text-xs text-navy-500 mt-1 flex items-center gap-1"><Stethoscope size={12} /> {selectedPatient.doctor}</p>
                </div>

                {selectedPatient.isRescheduled && (
                  <div className="relative pl-12">
                    <div className="absolute left-2.5 top-1.5 w-3.5 h-3.5 rounded-full bg-status-warning border-4 border-white ring-1 ring-status-warning" />
                    <p className="text-xs font-bold text-status-warning uppercase mb-1">↺ Rescheduled</p>
                    <p className="text-sm font-bold text-navy-900">Moved to 11:15 AM</p>
                    <p className="text-xs text-navy-500 mt-1 italic">Reason: Overbooked slot stabilization (Auto-Resolve)</p>
                  </div>
                )}

                <div className="relative pl-12">
                  <div className="absolute left-2.5 top-1.5 w-3.5 h-3.5 rounded-full bg-primary-600 border-4 border-white ring-1 ring-primary-600" />
                  <p className="text-xs font-bold text-primary-600 uppercase mb-1">Current Status</p>
                  <p className="text-sm font-bold text-navy-900 capitalize">{selectedPatient.status} at reception</p>
                  <p className="text-xs text-navy-500 mt-1 flex items-center gap-1"><MapPin size={12} /> Waiting Area B · Floor 2</p>
                </div>
              </div>

              {/* Action area */}
              <div className="mt-12 space-y-3">
                <button className="w-full py-4 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-primary-200">
                  Notify Patient via SMS
                </button>
                <button className="w-full py-4 border border-navy-200 text-navy-600 font-bold rounded-2xl hover:bg-navy-50 transition-all">
                  Print Token Receipt
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slide-left {
          from { transform: translateX(100%); }
          to   { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
