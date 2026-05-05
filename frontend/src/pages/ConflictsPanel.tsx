import React, { useState } from 'react';
import {
  AlertTriangle, CheckCircle2, Zap, Clock, User,
  ChevronDown, ChevronUp, ShieldCheck, Stethoscope
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useToast } from '../components/ToastProvider';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ─── Types ────────────────────────────────────────────────────────────────────
type Severity = 'high' | 'medium' | 'low';
type CStatus  = 'open' | 'resolved';
type Tab      = 'all' | 'high' | 'open' | 'resolved';

interface ConflictItem {
  id: string;
  type: string;
  severity: Severity;
  status: CStatus;
  doctor: string;
  slotTime: string;
  affectedCount: number;
  suggestion: string;
  resolvedAt?: string;
  affectedPatients: { 
    name: string; 
    priority: string; 
    rescheduleCount: number;
    score: number;
    base: number;
    waitBonus: number;
    penalty: number;
  }[];
}

// ─── Mock Data ─────────────────────────────────────────────────────────────────
const initialConflicts: ConflictItem[] = [
  {
    id: 'c1',
    type: 'Slot Overcapacity',
    severity: 'high',
    status: 'open',
    doctor: 'Dr. Sarah Smith',
    slotTime: '10:30 AM',
    affectedCount: 3,
    suggestion: 'Move Emily Davis → 11:15 AM · Move James Martinez → 11:30 AM',
    affectedPatients: [
      { name: 'Emily Davis',    priority: 'P3', rescheduleCount: 0, score: 1.4, base: 1.0, waitBonus: 0.6, penalty: 0.2 },
      { name: 'James Martinez', priority: 'P2', rescheduleCount: 1, score: 3.2, base: 2.0, waitBonus: 1.6, penalty: 0.4 },
      { name: 'Linda Anderson', priority: 'P3', rescheduleCount: 2, score: 1.1, base: 1.0, waitBonus: 0.9, penalty: 0.8 },
    ],
  },
  {
    id: 'c2',
    type: 'Doctor Double-Booked',
    severity: 'high',
    status: 'open',
    doctor: 'Dr. David Lee',
    slotTime: '11:00 AM',
    affectedCount: 2,
    suggestion: 'Reassign Linda Anderson to Dr. R. Davis (Neurology) at 11:00 AM',
    affectedPatients: [
      { name: 'Linda Anderson', priority: 'P3', rescheduleCount: 2, score: 1.2, base: 1.0, waitBonus: 1.0, penalty: 0.8 },
      { name: 'Tom Harris',     priority: 'P2', rescheduleCount: 0, score: 3.5, base: 2.0, waitBonus: 1.5, penalty: 0.0 },
    ],
  },
  {
    id: 'c3',
    type: 'Fatigue Threshold Breached',
    severity: 'medium',
    status: 'open',
    doctor: 'Dr. Emily Brown',
    slotTime: 'All slots after 12:00 PM',
    affectedCount: 4,
    suggestion: 'Redistribute Dr. Brown\'s afternoon patients across available doctors',
    affectedPatients: [
      { name: 'Alice Wong',    priority: 'P3', rescheduleCount: 0, score: 1.5, base: 1.0, waitBonus: 0.5, penalty: 0.0 },
      { name: 'Brian Scott',   priority: 'P3', rescheduleCount: 0, score: 1.6, base: 1.0, waitBonus: 0.6, penalty: 0.0 },
      { name: 'Carol Jenkins', priority: 'P2', rescheduleCount: 1, score: 3.1, base: 2.0, waitBonus: 1.5, penalty: 0.4 },
      { name: 'Derek Paul',    priority: 'P3', rescheduleCount: 0, score: 1.3, base: 1.0, waitBonus: 0.3, penalty: 0.0 },
    ],
  },
  {
    id: 'c4',
    type: 'Slot Overcapacity',
    severity: 'low',
    status: 'resolved',
    doctor: 'Dr. R. Davis',
    slotTime: '09:00 AM',
    affectedCount: 1,
    suggestion: 'Move John Doe → 09:30 AM',
    resolvedAt: '09:04 AM',
    affectedPatients: [
      { name: 'John Doe', priority: 'P3', rescheduleCount: 1, score: 1.2, base: 1.0, waitBonus: 0.6, penalty: 0.4 },
    ],
  },
  {
    id: 'c5',
    type: 'Doctor Double-Booked',
    severity: 'medium',
    status: 'resolved',
    doctor: 'Dr. Sarah Smith',
    slotTime: '08:30 AM',
    affectedCount: 2,
    suggestion: 'Auto-reassigned via load balancer',
    resolvedAt: '08:31 AM',
    affectedPatients: [
      { name: 'Mark Green',  priority: 'P2', rescheduleCount: 0, score: 3.4, base: 2.0, waitBonus: 1.4, penalty: 0.0 },
      { name: 'Sara White',  priority: 'P3', rescheduleCount: 1, score: 1.3, base: 1.0, waitBonus: 0.7, penalty: 0.4 },
    ],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const severityConfig: Record<Severity, { label: string; pill: string; border: string; icon: typeof AlertTriangle }> = {
  high:   { label: 'HIGH',   pill: 'bg-status-error/10 text-status-error border-status-error/30',     border: 'border-l-status-error',   icon: Zap },
  medium: { label: 'MEDIUM', pill: 'bg-status-warning/10 text-status-warning border-status-warning/30', border: 'border-l-status-warning', icon: AlertTriangle },
  low:    { label: 'LOW',    pill: 'bg-navy-100 text-navy-500 border-navy-200',                         border: 'border-l-navy-300',       icon: Clock },
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function ConflictsPanel() {
  const [conflicts, setConflicts] = useState<ConflictItem[]>(initialConflicts);
  const [activeTab, setActiveTab] = useState<Tab>('all');
  const [expandedOverride, setExpandedOverride] = useState<string | null>(null);
  const [resolving, setResolving] = useState<string | null>(null);
  const [overrideTimes, setOverrideTimes] = useState<Record<string, string>>({});
  const { showToast } = useToast();

  const autoResolve = (id: string) => {
    setResolving(id);
    setTimeout(() => {
      setConflicts((cs: ConflictItem[]) =>
        cs.map((c: ConflictItem) =>
          c.id === id
            ? { ...c, status: 'resolved' as CStatus, resolvedAt: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) }
            : c
        )
      );
      setResolving(null);
      showToast('success', 'Conflict Resolved', 'Overbooked slots have been re-distributed based on priority scoring.');
    }, 900);
  };

  const manualResolve = (id: string) => {
    const time = overrideTimes[id];
    if (!time) return;
    setConflicts((cs: ConflictItem[]) =>
      cs.map((c: ConflictItem) =>
        c.id === id
          ? { ...c, status: 'resolved' as CStatus, suggestion: `Manually resolved → ${time}`, resolvedAt: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) }
          : c
      )
    );
    setExpandedOverride(null);
  };

  const filtered = conflicts.filter((c: ConflictItem) => {
    if (activeTab === 'high')     return c.severity === 'high';
    if (activeTab === 'open')     return c.status === 'open';
    if (activeTab === 'resolved') return c.status === 'resolved';
    return true;
  });

  const tabs: { key: Tab; label: string }[] = [
    { key: 'all',      label: 'All' },
    { key: 'high',     label: 'High Severity' },
    { key: 'open',     label: 'Open' },
    { key: 'resolved', label: 'Resolved' },
  ];

  const countFor = (tab: Tab) => {
    if (tab === 'all')      return conflicts.length;
    if (tab === 'high')     return conflicts.filter((c: ConflictItem) => c.severity === 'high').length;
    if (tab === 'open')     return conflicts.filter((c: ConflictItem) => c.status === 'open').length;
    if (tab === 'resolved') return conflicts.filter((c: ConflictItem) => c.status === 'resolved').length;
    return 0;
  };

  const openCount = conflicts.filter((c: ConflictItem) => c.status === 'open').length;

  return (
    <div className="max-w-5xl mx-auto pb-12 space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-navy-900 tracking-tight">Conflict Resolution</h1>
          <p className="text-navy-500 mt-1">Detected scheduling conflicts · Today's shift</p>
        </div>
        {openCount === 0 ? (
          <div className="flex items-center gap-2 bg-status-open/10 text-status-open px-4 py-2 rounded-xl text-sm font-bold w-fit">
            <ShieldCheck size={16} /> System Stable
          </div>
        ) : (
          <div className="flex items-center gap-2 bg-status-error/10 text-status-error px-4 py-2 rounded-xl text-sm font-bold w-fit">
            <AlertTriangle size={16} className="animate-pulse" />
            {openCount} Open {openCount === 1 ? 'Conflict' : 'Conflicts'}
          </div>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 bg-surface rounded-xl shadow-skyline border border-navy-100 p-1.5 w-full sm:w-fit overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
              activeTab === tab.key
                ? 'bg-primary-600 text-white shadow-sm'
                : 'text-navy-500 hover:bg-navy-50 hover:text-navy-800'
            )}
          >
            {tab.label}
            <span className={cn(
              'text-xs font-bold px-1.5 py-0.5 rounded-full',
              activeTab === tab.key ? 'bg-white/20 text-white' : 'bg-navy-100 text-navy-500'
            )}>
              {countFor(tab.key)}
            </span>
          </button>
        ))}
      </div>

      {/* Conflict Cards */}
      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-20 h-20 rounded-full bg-status-open/10 flex items-center justify-center mb-4">
            <CheckCircle2 size={40} className="text-status-open" />
          </div>
          <h2 className="text-xl font-bold text-navy-900 mb-1">All Clear!</h2>
          <p className="text-navy-500">No conflicts match this filter. The system is stable.</p>
        </div>
      )}

      <div className="space-y-4">
        {filtered.map((conflict: ConflictItem) => {
          const cfg      = severityConfig[conflict.severity];
          const SevIcon  = cfg.icon;
          const isOpen   = conflict.status === 'open';
          const isLoading = resolving === conflict.id;
          const isExpanded = expandedOverride === conflict.id;

          return (
            <div
              key={conflict.id}
              className={cn(
                'bg-surface rounded-2xl shadow-skyline border border-navy-100 border-l-4 overflow-hidden transition-all duration-300',
                cfg.border,
                !isOpen && 'opacity-75'
              )}
            >
              <div className="p-4 sm:p-5">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-3">
                    <div className={cn('h-9 w-9 rounded-xl flex items-center justify-center shrink-0',
                      conflict.severity === 'high'   ? 'bg-status-error/10'   :
                      conflict.severity === 'medium' ? 'bg-status-warning/10' : 'bg-navy-100'
                    )}>
                      <SevIcon size={18} className={
                        conflict.severity === 'high'   ? 'text-status-error'   :
                        conflict.severity === 'medium' ? 'text-status-warning' : 'text-navy-500'
                      } />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-navy-900">{conflict.type}</h3>
                        <span className={cn('text-xs font-bold px-2 py-0.5 rounded-md border', cfg.pill)}>
                          {cfg.label}
                        </span>
                      </div>
                    </div>
                  </div>
                  {/* Resolved badge */}
                  {!isOpen && (
                    <span className="flex items-center gap-1.5 text-xs font-bold text-status-open bg-status-open/10 px-3 py-1 rounded-full shrink-0">
                      <CheckCircle2 size={12} /> Resolved · {conflict.resolvedAt}
                    </span>
                  )}
                </div>

                {/* Details row */}
                <div className="flex flex-wrap gap-4 text-sm text-navy-500 mb-4 ml-0 sm:ml-12 mt-4 sm:mt-0">
                  <span className="flex items-center gap-1.5"><Stethoscope size={14} /> {conflict.doctor}</span>
                  <span className="flex items-center gap-1.5"><Clock size={14} /> {conflict.slotTime}</span>
                  <span className="flex items-center gap-1.5"><User size={14} /> {conflict.affectedCount} patient{conflict.affectedCount > 1 ? 's' : ''} affected</span>
                </div>

                {/* Affected patients + fairness */}
                {isOpen && (
                  <div className="ml-0 sm:ml-12 mb-4">
                    <p className="text-xs font-semibold text-navy-400 uppercase tracking-wide mb-2">Affected Patients &amp; Fairness Impact</p>
                    <div className="space-y-2">
                      {conflict.affectedPatients.map((p: any, i: number) => {
                        const isRescheduling = p.score < 2.0; // Simulated logic
                        return (
                          <div key={i} className="bg-navy-50 rounded-xl px-4 py-3 border border-navy-100">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span className={cn(
                                  'text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase',
                                  p.priority === 'P1' ? 'bg-status-error/10 text-status-error border-status-error/30' :
                                  p.priority === 'P2' ? 'bg-status-warning/10 text-status-warning border-status-warning/30' :
                                  'bg-navy-100 text-navy-500 border-navy-200'
                                )}>{p.priority}</span>
                                <span className="text-sm font-bold text-navy-900">{p.name}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className={cn(
                                  "text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1",
                                  isRescheduling ? "bg-status-warning/10 text-status-warning" : "bg-status-open/10 text-status-open"
                                )}>
                                  {isRescheduling ? <>↺ Rescheduling Candidate</> : <>✓ Retained in Slot</>}
                                </span>
                              </div>
                            </div>
                            
                            {/* Score Explainer */}
                            <div className="flex flex-wrap items-center gap-3 mt-2">
                              <div className="flex flex-col">
                                <span className="text-[10px] text-navy-400 uppercase font-bold tracking-wider">Priority Score</span>
                                <span className="text-lg font-black text-primary-600 leading-none">{p.score.toFixed(1)}</span>
                              </div>
                              <div className="h-8 w-px bg-navy-200" />
                              <div className="flex gap-4">
                                <div>
                                  <p className="text-[9px] text-navy-400 uppercase font-bold">Base</p>
                                  <p className="text-xs font-bold text-navy-700">{p.base.toFixed(1)}</p>
                                </div>
                                <div>
                                  <p className="text-[9px] text-navy-400 uppercase font-bold">Wait</p>
                                  <p className="text-xs font-bold text-navy-700">+{p.waitBonus.toFixed(1)}</p>
                                </div>
                                <div>
                                  <p className="text-[9px] text-navy-400 uppercase font-bold">Penalty</p>
                                  <p className="text-xs font-bold text-status-error">−{p.penalty.toFixed(1)}</p>
                                </div>
                              </div>
                              {p.rescheduleCount > 0 && (
                                <div className="ml-auto bg-status-error/5 border border-status-error/10 px-2 py-1 rounded text-right">
                                  <p className="text-[9px] text-status-error uppercase font-bold">Fairness Alert</p>
                                  <p className="text-[10px] font-bold text-status-error">Already moved {p.rescheduleCount}×</p>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Suggestion box */}
                <div className="ml-0 sm:ml-12 p-3 bg-navy-50 border border-navy-100 rounded-lg mb-4">
                  <p className="text-xs text-navy-400 font-semibold uppercase tracking-wide mb-1">System Suggestion</p>
                  <p className="text-sm text-navy-700">{conflict.suggestion}</p>
                </div>

                {/* Action buttons — only for open conflicts */}
                {isOpen && (
                  <div className="ml-0 sm:ml-12 flex flex-wrap items-center gap-3">
                    <button
                      onClick={() => autoResolve(conflict.id)}
                      disabled={isLoading}
                      className={cn(
                        'flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all shadow-sm',
                        isLoading
                          ? 'bg-navy-100 text-navy-400 cursor-wait'
                          : 'bg-primary-600 hover:bg-primary-700 text-white'
                      )}
                    >
                      {isLoading ? (
                        <><span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Resolving…</>
                      ) : (
                        <><CheckCircle2 size={15} /> Auto-Resolve</>
                      )}
                    </button>

                    <button
                      onClick={() => setExpandedOverride(isExpanded ? null : conflict.id)}
                      className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-medium border border-navy-200 text-navy-600 hover:bg-navy-50 transition-colors"
                    >
                      Manual Override
                      {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                    </button>
                  </div>
                )}

                {/* Manual override inline form */}
                {isOpen && isExpanded && (
                  <div className="ml-0 sm:ml-12 mt-4 p-4 bg-navy-50 border border-navy-200 rounded-xl space-y-3">
                    <p className="text-sm font-semibold text-navy-700">Enter a custom resolution slot:</p>
                    <div className="flex gap-3">
                      <input
                        type="time"
                        value={overrideTimes[conflict.id] || ''}
                        onChange={e => setOverrideTimes((t: any) => ({ ...t, [conflict.id]: e.target.value }))}
                        className="flex-1 px-3 py-2 border border-navy-200 rounded-lg text-sm text-navy-900 focus:outline-none focus:ring-2 focus:ring-primary-400 bg-white"
                      />
                      <button
                        onClick={() => manualResolve(conflict.id)}
                        disabled={!overrideTimes[conflict.id]}
                        className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
