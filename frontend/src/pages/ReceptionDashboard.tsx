import { Zap, Activity, Info, Clock, AlertTriangle } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function ReceptionDashboard() {
  return (
    <div className="grid grid-cols-12 gap-6">
      
      {/* Card 1: Live Queue Status */}
      <div className="col-span-12 lg:col-span-4 md:col-span-6 bg-surface rounded-[24px] p-6 sm:p-8 shadow-skyline border border-navy-100">
        <h3 className="text-lg font-bold text-navy-800 uppercase tracking-wider text-xs">Live Queue Status</h3>
        <p className="text-sm text-navy-500 mt-1">Total patients in queue today</p>
        <div className="mt-8">
          <span className="text-[64px] font-black tracking-tighter leading-none text-primary-700">142</span>
        </div>
        
        <div className="mt-8 space-y-4">
          <div className="flex h-3 rounded-full overflow-hidden bg-navy-50">
            <div className="bg-primary-600 w-[65%]"></div>
            <div className="bg-tertiary-400 w-[20%]"></div>
            <div className="bg-status-error w-[15%]"></div>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-2 text-[10px] font-bold text-navy-400 uppercase">
            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-primary-600"></div> Routine (92)</div>
            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-tertiary-400"></div> Elevated (28)</div>
            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-status-error"></div> Emergency (22)</div>
          </div>
        </div>
      </div>

      {/* Card 2: 6.6 System Health Widget (Premium Gauge) */}
      <div className="col-span-12 lg:col-span-4 md:col-span-6 bg-surface rounded-[24px] p-6 sm:p-8 shadow-skyline border border-navy-100 flex flex-col items-center text-center overflow-hidden relative">
        <div className="absolute top-0 right-0 p-4">
          <Info size={16} className="text-navy-300 hover:text-navy-600 cursor-help" />
        </div>
        <h3 className="text-lg font-bold text-navy-800 uppercase tracking-wider text-xs mb-6 w-full text-left">System Health</h3>
        
        {/* SVG Gauge */}
        <div className="relative w-48 h-48 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90">
            <circle cx="96" cy="96" r="80" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-navy-50" />
            <circle cx="96" cy="96" r="80" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray={502} strokeDashoffset={502 * (1 - 0.84)} strokeLinecap="round" className="text-primary-600 transition-all duration-1000 ease-out" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
            <span className="text-4xl font-black text-navy-900 leading-none">84<span className="text-xl">%</span></span>
            <span className="text-[10px] font-bold text-status-open mt-1 tracking-widest uppercase">Stable</span>
          </div>
        </div>

        <div className="mt-6 w-full space-y-3">
          <div className="flex items-center justify-between p-3 bg-navy-50 rounded-xl">
            <div className="flex items-center gap-2 text-xs font-bold text-navy-600">
              <Zap size={14} className="text-status-warning" /> Slot Overlap Risk
            </div>
            <span className="text-sm font-black text-navy-900">Low (12%)</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-navy-50 rounded-xl">
            <div className="flex items-center gap-2 text-xs font-bold text-navy-600">
              <Activity size={14} className="text-primary-500" /> Resolution Accuracy
            </div>
            <span className="text-sm font-black text-navy-900">98.2%</span>
          </div>
        </div>
      </div>

      {/* Card 3: Upcoming Schedule */}
      <div className="col-span-12 lg:col-span-4 md:col-span-12 bg-surface rounded-[24px] p-6 sm:p-8 shadow-skyline border border-navy-100">
        <h3 className="text-lg font-bold text-navy-800 uppercase tracking-wider text-xs mb-8">Upcoming Conflict Risk</h3>
        <div className="space-y-4">
          {[
            { doctor: "Dr. Aris", time: "12:30 PM", risk: "high", reason: "3 overlap surge" },
            { doctor: "Dr. Miller", time: "01:15 PM", risk: "medium", reason: "Fatigue warning" },
            { doctor: "Dr. Jones", time: "02:00 PM", risk: "low", reason: "Optimal load" },
          ].map((apt, i) => (
            <div key={i} className="flex items-center gap-4 p-4 bg-navy-50 rounded-2xl hover:shadow-sm transition-all border border-transparent hover:border-navy-200 group">
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                apt.risk === 'high' ? 'bg-status-error/10 text-status-error' :
                apt.risk === 'medium' ? 'bg-status-warning/10 text-status-warning' : 'bg-status-open/10 text-status-open'
              )}>
                {apt.risk === 'high' ? <AlertTriangle size={18} /> : <Clock size={18} />}
              </div>
              <div className="flex-1">
                <p className="font-bold text-navy-900 text-sm">{apt.doctor} · {apt.time}</p>
                <p className="text-[10px] text-navy-400 font-bold uppercase tracking-wider mt-0.5">{apt.reason}</p>
              </div>
              <ChevronRight size={16} className="text-navy-300 group-hover:text-navy-600" />
            </div>
          ))}
        </div>
      </div>

      {/* Card 4: Avg Wait Time */}
      <div className="col-span-12 lg:col-span-3 md:col-span-6 bg-surface rounded-[24px] p-6 sm:p-8 shadow-skyline border border-navy-100">
        <h3 className="text-xs font-bold text-navy-400 uppercase tracking-widest mb-4">Avg Wait Time</h3>
        <div className="flex items-baseline gap-2">
          <span className="text-[48px] font-black tracking-tighter text-navy-900 leading-none">18<span className="text-2xl">m</span></span>
          <span className="text-xs font-bold text-status-open">+12% surge</span>
        </div>
        <div className="mt-6 h-12 flex items-end gap-1">
          {[40, 60, 35, 90, 55, 70, 45, 80].map((h, i) => (
            <div key={i} className="flex-1 bg-primary-100 rounded-t-sm" style={{ height: `${h}%` }} />
          ))}
        </div>
      </div>

      {/* Card 5: Auto-Resolution Rate */}
      <div className="col-span-12 lg:col-span-3 md:col-span-6 bg-surface rounded-[24px] p-6 sm:p-8 shadow-skyline border border-navy-100">
        <h3 className="text-xs font-bold text-navy-400 uppercase tracking-widest mb-4">Self-Stabilization</h3>
        <div className="flex items-baseline gap-2">
          <span className="text-[48px] font-black tracking-tighter text-navy-900 leading-none">94<span className="text-2xl">%</span></span>
        </div>
        <div className="mt-4 flex items-center gap-2 text-xs font-bold text-navy-500">
          <Zap size={14} className="text-status-open fill-status-open" /> 18 conflicts auto-fixed
        </div>
        <div className="mt-6 bg-navy-50 p-3 rounded-xl">
            <p className="text-[10px] text-navy-400 font-bold">LATEST RESOLUTION</p>
            <p className="text-xs font-bold text-navy-700 mt-1">11:04 AM · Slot Re-balanced</p>
        </div>
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
            {['Dr. Smith', 'Dr. Lee', 'Dr. Miller'].map((d, i) => (
                <div key={d} className="space-y-2">
                    <div className="flex justify-between text-xs font-bold text-navy-700">
                        <span>{d}</span>
                        <span>{75 + i*5}% Capacity</span>
                    </div>
                    <div className="h-6 flex gap-1 items-center">
                        <div className="h-full bg-primary-500 rounded-lg shadow-sm" style={{ width: `${60 - i*10}%` }} />
                        <div className="h-full bg-navy-100 rounded-lg" style={{ width: `${20 + i*10}%` }} />
                        <div className="flex-1 h-px bg-navy-100 border-t border-dashed" />
                    </div>
                </div>
            ))}
        </div>
      </div>

    </div>
  );
}

function ChevronRight(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}
