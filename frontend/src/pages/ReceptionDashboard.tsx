import { Zap, Activity, Info, Clock, AlertTriangle, Users, UserPlus, Calendar, CheckCircle2, ArrowRight } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import OptimizationPanel from '../components/OptimizationPanel';
import NotificationCenter from '../components/NotificationCenter';

export default function ReceptionDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>(null);
  const [surgeStatus, setSurgeStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDocForOpt, setSelectedDocForOpt] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, surgeRes] = await Promise.all([
          api.get('/analytics/dashboard'),
          api.get('/analytics/surge-status')
        ]);
        setStats(statsRes.data);
        setSurgeStatus(surgeRes.data);
      } catch (err) {
        console.error('Failed to fetch dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 30000); // Update every 30s
    return () => clearInterval(interval);
  }, []);

  if (loading || !stats) return <div className="p-20 text-center text-navy-400">Initializing Live Dashboard...</div>;

  return (
    <div className="space-y-6">
      
      {/* Storm & Safety Alert Banner */}
      {(surgeStatus?.is_storm || surgeStatus?.lobby_overcrowded || (surgeStatus?.fatigued_doctors?.length > 0)) && (
        <div className={cn(
          "p-6 rounded-[24px] flex flex-col md:flex-row items-center justify-between gap-6 border-2 transition-all",
          surgeStatus.is_storm ? "bg-status-error/10 border-status-error/20 animate-pulse" : "bg-status-warning/10 border-status-warning/20"
        )}>
          <div className="flex items-center gap-4">
            <div className={cn(
              "w-12 h-12 text-white rounded-2xl flex items-center justify-center shadow-lg",
              surgeStatus.is_storm ? "bg-status-error shadow-status-error/20" : "bg-status-warning shadow-status-warning/20"
            )}>
              <AlertTriangle size={24} />
            </div>
            <div>
              <h2 className={cn("text-xl font-black", surgeStatus.is_storm ? "text-status-error" : "text-status-warning")}>
                {surgeStatus.is_storm ? "CANCELLATION STORM DETECTED" : "SAFETY VALVES ENGAGED"}
              </h2>
              <p className="text-sm font-bold text-navy-600 uppercase tracking-wider">
                {surgeStatus.lobby_overcrowded ? "Lobby Overcrowded: Cooldown in effect." : surgeStatus.message}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
             {surgeStatus.lobby_overcrowded && (
               <div className="bg-white px-4 py-2 rounded-xl border border-navy-100 flex flex-col items-center">
                 <span className="text-[10px] font-black text-status-error uppercase mb-0.5">Crowd Lock</span>
                 <span className="text-lg font-black text-navy-900">{surgeStatus.recent_walkin_count}/5</span>
               </div>
             )}
             <div className="bg-white px-4 py-2 rounded-xl border border-navy-100 flex flex-col items-center">
               <span className="text-xs font-bold text-navy-400">Gaps</span>
               <span className="text-lg font-black text-navy-900">{surgeStatus.gap_percentage}%</span>
             </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-12 gap-6">
      
      {/* Card 1: Live Queue Status */}
      <div className="col-span-12 lg:col-span-4 md:col-span-6 bg-surface rounded-[24px] p-6 sm:p-8 shadow-skyline border border-navy-100">
        <h3 className="text-lg font-bold text-navy-800 uppercase tracking-wider text-xs">Live Queue Status</h3>
        <p className="text-sm text-navy-500 mt-1">Total patients in queue today</p>
        <div className="mt-8">
          <span className="text-[64px] font-black tracking-tighter leading-none text-primary-700">{stats.queue.total}</span>
        </div>
        
        <div className="mt-8 space-y-4">
          <div className="flex h-3 rounded-full overflow-hidden bg-navy-50">
            <div className="bg-primary-600" style={{ width: `${(stats.queue.routine / stats.queue.total * 100) || 0}%` }}></div>
            <div className="bg-tertiary-400" style={{ width: `${(stats.queue.elevated / stats.queue.total * 100) || 0}%` }}></div>
            <div className="bg-status-error" style={{ width: `${(stats.queue.emergency / stats.queue.total * 100) || 0}%` }}></div>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-2 text-[10px] font-bold text-navy-400 uppercase">
            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-primary-600"></div> Routine ({stats.queue.routine})</div>
            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-tertiary-400"></div> Elevated ({stats.queue.elevated})</div>
            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-status-error"></div> Emergency ({stats.queue.emergency})</div>
          </div>
        </div>
      </div>

      {/* Card 2: System Health Widget (Premium Gauge) */}
      <div className="col-span-12 lg:col-span-4 md:col-span-6 bg-surface rounded-[24px] p-6 sm:p-8 shadow-skyline border border-navy-100 flex flex-col items-center text-center overflow-hidden relative">
        <div className="absolute top-0 right-0 p-4">
          <Info size={16} className="text-navy-300 hover:text-navy-600 cursor-help" />
        </div>
        <h3 className="text-lg font-bold text-navy-800 uppercase tracking-wider text-xs mb-6 w-full text-left">System Health</h3>
        
        {/* SVG Gauge */}
        <div className="relative w-48 h-48 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90">
            <circle cx="96" cy="96" r="80" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-navy-50" />
            <circle cx="96" cy="96" r="80" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray={502} strokeDashoffset={502 * (1 - stats.system_health / 100)} strokeLinecap="round" className="text-primary-600 transition-all duration-1000 ease-out" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
            <span className="text-4xl font-black text-navy-900 leading-none">{stats.system_health}<span className="text-xl">%</span></span>
            <span className="text-[10px] font-bold text-status-open mt-1 tracking-widest uppercase">
              {stats.system_health > 90 ? 'Stable' : 'Surged'}
            </span>
          </div>
        </div>

        <div className="mt-6 w-full space-y-3">
          <div className="flex items-center justify-between p-3 bg-navy-50 rounded-xl">
            <div className="flex items-center gap-2 text-xs font-bold text-navy-600">
              <Zap size={14} className="text-status-warning" /> Conflict Risk
            </div>
            <span className="text-sm font-black text-navy-900">{stats.queue.emergency > 0 ? 'Medium' : 'Low'}</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-navy-50 rounded-xl">
            <div className="flex items-center gap-2 text-xs font-bold text-navy-600">
              <Activity size={14} className="text-primary-500" /> Live Patients
            </div>
            <span className="text-sm font-black text-navy-900">{stats.queue.total} Active</span>
          </div>
        </div>
      </div>

      {/* Card 3: Upcoming Conflict Risk */}
      <div className="col-span-12 lg:col-span-4 md:col-span-12 bg-surface rounded-[24px] p-6 sm:p-8 shadow-skyline border border-navy-100">
        <h3 className="text-lg font-bold text-navy-800 uppercase tracking-wider text-xs mb-8">Upcoming Conflict Risk</h3>
        <div className="space-y-4">
          {stats.conflicts.length === 0 ? (
            <div className="py-8 text-center">
              <CheckCircle2 size={32} className="mx-auto text-status-open mb-4" />
              <p className="text-xs font-bold text-navy-400 uppercase tracking-widest">No Active Conflicts</p>
            </div>
          ) : (
            stats.conflicts.map((c: any, i: number) => (
              <div 
                key={i} 
                onClick={() => navigate('/reception/conflicts')}
                className="flex items-center gap-4 p-4 bg-navy-50 rounded-2xl border border-transparent hover:border-navy-200 group transition-all cursor-pointer"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${c.risk === 'high' ? 'bg-status-error/10 text-status-error' : 'bg-status-warning/10 text-status-warning'}`}>
                  {c.risk === 'high' ? <AlertTriangle size={18} /> : <Clock size={18} />}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-navy-900 text-sm">{c.doctor} · {c.time}</p>
                  <p className="text-[10px] text-navy-400 font-bold uppercase tracking-wider mt-0.5">{c.reason}</p>
                </div>
                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-navy-300 group-hover:text-primary-600 transition-colors shadow-sm">
                  <ArrowRight size={14} />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Card 4: Avg Wait Time */}
      <div className="col-span-12 lg:col-span-3 md:col-span-6 bg-surface rounded-[24px] p-6 sm:p-8 shadow-skyline border border-navy-100">
        <h3 className="text-xs font-bold text-navy-400 uppercase tracking-widest mb-4">Avg Wait Time</h3>
        <div className="flex items-baseline gap-2">
          <span className="text-[48px] font-black tracking-tighter text-navy-900 leading-none">{stats.avg_wait_time}<span className="text-2xl">m</span></span>
          <span className="text-xs font-bold text-status-open">Live</span>
        </div>
        <div className="mt-6 h-12 flex items-end gap-1">
          {[40, 60, 35, 90, 55, 70, 45, 80].map((h, i) => (
            <div key={i} className="flex-1 bg-primary-100 rounded-t-sm" style={{ height: `${h}%` }} />
          ))}
        </div>
      </div>

      {/* Card 5: System Alerts Log */}
      <div className="col-span-12 lg:col-span-3 md:col-span-6 h-[400px]">
        <NotificationCenter />
      </div>

      {/* Card 6: Staff Duty Forecast */}
      <div className="col-span-12 lg:col-span-6 md:col-span-12 bg-surface rounded-[24px] p-6 sm:p-8 shadow-skyline border border-navy-100">
        <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-navy-800 uppercase tracking-wider text-xs">Doctor Workload Forecast</h3>
            <div className="flex items-center gap-3 text-[10px] font-bold text-navy-400">
                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-primary-500" /> Current</div>
                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-navy-200" /> Predicted</div>
            </div>
        </div>
        <div className="space-y-6">
            {stats.workload.map((d: any) => (
                <div key={d.name} className="group">
                    <div className="flex justify-between items-center text-xs font-bold text-navy-700 mb-2">
                        <span>{d.name}</span>
                        <div className="flex items-center gap-3">
                          {surgeStatus?.fatigued_doctors?.some((f: any) => f.name === d.name) && (
                            <span className="px-2 py-0.5 bg-status-error text-white text-[8px] font-black uppercase rounded animate-pulse">
                              Fatigued
                            </span>
                          )}
                          <span className={cn(
                            "px-2 py-0.5 rounded",
                            d.capacity > 85 ? "bg-status-error/10 text-status-error" : "text-navy-400"
                          )}>
                            {d.capacity}% Capacity ({d.current}/{d.total})
                          </span>
                          <button 
                            onClick={() => setSelectedDocForOpt(selectedDocForOpt === d.name ? null : d.name)}
                            className="text-primary-600 hover:underline"
                          >
                            {selectedDocForOpt === d.name ? 'Hide Opt' : 'Optimize'}
                          </button>
                        </div>
                    </div>
                    <div className="h-6 flex gap-1 items-center">
                        <div className="h-full bg-primary-500 rounded-lg shadow-sm transition-all duration-1000" style={{ width: `${d.capacity}%` }} />
                        <div className="flex-1 h-px bg-navy-100 border-t border-dashed" />
                    </div>
                    {selectedDocForOpt === d.name && (
                      <div className="mt-4 animate-in slide-in-from-top-4 duration-300">
                         <OptimizationPanel doctorId={d.name} onApplied={() => {}} />
                      </div>
                    )}
                </div>
            ))}
        </div>
      </div>

      {/* Card 7: Quick Actions */}
      <div className="col-span-12 md:col-span-6 bg-primary-900 rounded-[24px] p-8 shadow-xl text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Users size={64} />
        </div>
        <h3 className="text-xs font-bold text-primary-400 uppercase tracking-[0.2em] mb-8">Reception Quick Actions</h3>
        
        <div className="grid grid-cols-2 gap-4 relative">
          <button 
            onClick={() => window.location.href = '/reception/walkin'}
            className="flex flex-col items-start p-6 bg-white/10 hover:bg-white/20 rounded-2xl border border-white/10 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-primary-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <UserPlus size={20} className="text-white" />
            </div>
            <p className="font-bold text-white">Register Walk-in</p>
            <p className="text-[10px] text-primary-300 font-bold uppercase mt-1">New Patient Account</p>
          </button>

          <button className="flex flex-col items-start p-6 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 transition-all group opacity-50 cursor-not-allowed">
            <div className="w-10 h-10 rounded-xl bg-navy-700 flex items-center justify-center mb-4">
              <Calendar size={20} className="text-white" />
            </div>
            <p className="font-bold text-white">Emergency Bump</p>
            <p className="text-[10px] text-navy-400 font-bold uppercase mt-1">Priority Override</p>
          </button>
        </div>
      </div>

    </div>
  </div>
);
}
