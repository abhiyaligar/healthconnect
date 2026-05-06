import React, { useState, useEffect } from 'react';
import {
  TrendingDown, TrendingUp, CheckCircle2, AlertTriangle, Zap,
  Users, Clock, Calendar, ArrowUpRight, ArrowDownRight, Shield
} from 'lucide-react';
import api from '../api';
import EmergencyRescheduleModal from '../components/EmergencyRescheduleModal';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const CAPACITY_THRESHOLD = 35;
const MAX_COUNT = 50;

// ─── Sub-components ────────────────────────────────────────────────────────────

function KpiCard({ label, value, sub, trend, icon: Icon, color, bg, fillPct }: any) {
  const TrendIcon = (trend === 'up' || trend === 'up-bad') ? ArrowUpRight : ArrowDownRight;
  const trendColor = trend === 'up-bad' ? 'text-status-error' : trend === 'down-good' ? 'text-status-open' : 'text-navy-400';

  return (
    <div className="bg-white rounded-2xl shadow-skyline border border-navy-100 p-6 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className={cn('h-10 w-10 rounded-xl flex items-center justify-center', bg)}>
          <Icon size={20} className={color} />
        </div>
        <span className={cn('flex items-center gap-1 text-xs font-semibold', trendColor)}>
          <TrendIcon size={14} /> {sub.split(' ')[0]}
        </span>
      </div>
      <div>
        <p className="text-2xl font-bold text-navy-900 tracking-tight">{value}</p>
        <p className="text-sm text-navy-500 mt-0.5">{label}</p>
      </div>
      {fillPct !== undefined && (
        <div className="h-1.5 rounded-full bg-navy-100 overflow-hidden">
          <div
            className="h-full rounded-full bg-status-open transition-all duration-700"
            style={{ width: `${fillPct}%` }}
          />
        </div>
      )}
    </div>
  );
}

function BookingVolumeChart({ hourlyData }: { hourlyData: any[] }) {
  const [hovered, setHovered] = useState<number | null>(null);
  const W = 560;
  const H = 200;
  const PAD = { top: 20, right: 20, bottom: 36, left: 36 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;
  const n = hourlyData.length;

  const xPos = (i: number) => PAD.left + (i / (n - 1)) * chartW;
  const yPos = (v: number) => PAD.top + chartH - (v / MAX_COUNT) * chartH;
  const thresholdY = yPos(CAPACITY_THRESHOLD);

  const linePath = hourlyData
    .map((d, i) => `${i === 0 ? 'M' : 'L'} ${xPos(i)} ${yPos(d.count)}`)
    .join(' ');

  const areaPath =
    `M ${xPos(0)} ${yPos(0)} ` +
    hourlyData.map((d, i) => `L ${xPos(i)} ${yPos(d.count)}`).join(' ') +
    ` L ${xPos(n - 1)} ${yPos(0)} Z`;

  return (
    <div className="bg-white rounded-2xl shadow-skyline border border-navy-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-navy-900">Hourly Booking Volume</h3>
          <p className="text-xs text-navy-500 mt-0.5">Today · 8 AM – 5 PM</p>
        </div>
        <div className="flex items-center gap-4 text-xs font-medium">
          <span className="flex items-center gap-1.5 text-primary-600">
            <span className="w-3 h-0.5 bg-primary-500 inline-block rounded-full" /> Bookings
          </span>
          <span className="flex items-center gap-1.5 text-status-error">
            <span className="w-3 h-0.5 bg-status-error inline-block rounded-full border-dashed border border-status-error" /> Capacity limit
          </span>
        </div>
      </div>
      <div className="w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full"
          style={{ minWidth: 320 }}
          onMouseLeave={() => setHovered(null)}
        >
          <defs>
            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#006382" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#006382" stopOpacity="0.01" />
            </linearGradient>
          </defs>

          {[0, 10, 20, 30, 40, 50].map(v => (
            <g key={v}>
              <line x1={PAD.left} y1={yPos(v)} x2={W - PAD.right} y2={yPos(v)} stroke="#e0e3e5" strokeWidth="1" />
              <text x={PAD.left - 6} y={yPos(v) + 4} textAnchor="end" fontSize="10" fill="#70787e">{v}</text>
            </g>
          ))}

          <line x1={PAD.left} y1={thresholdY} x2={W - PAD.right} y2={thresholdY} stroke="#ba1a1a" strokeWidth="1.5" strokeDasharray="6 4" opacity="0.6" />
          <path d={areaPath} fill="url(#areaGrad)" />
          <path d={linePath} fill="none" stroke="#006382" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />

          {hourlyData.map((d, i) => (
            <g key={i} onMouseEnter={() => setHovered(i)} style={{ cursor: 'crosshair' }}>
              <rect x={xPos(i) - (chartW / (n - 1)) / 2} y={PAD.top} width={chartW / (n - 1)} height={chartH} fill="transparent" />
              <circle cx={xPos(i)} cy={yPos(d.count)} r={hovered === i ? 5 : 3.5} fill={hovered === i ? '#006382' : '#ffffff'} stroke="#006382" strokeWidth="2" />
              {hovered === i && (
                <g>
                  <rect x={xPos(i) - 28} y={yPos(d.count) - 32} width={56} height={24} rx={6} fill="#191c1e" />
                  <text x={xPos(i)} y={yPos(d.count) - 16} textAnchor="middle" fontSize="11" fill="#ffffff" fontWeight="600">{d.count} appts</text>
                </g>
              )}
              <text x={xPos(i)} y={H - 6} textAnchor="middle" fontSize="10" fill="#70787e">{d.hour}</text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}

function DoctorLoadChart({ doctorLoad, onEmergency }: { doctorLoad: any[], onEmergency: (id: string, name: string) => void }) {
  const getLoadStatus = (scheduled: number, capacity: number) => {
    const pct = (scheduled / capacity) * 100;
    if (pct > 100) return { color: 'bg-status-error', textColor: 'text-status-error', label: 'Overloaded' };
    if (pct >= 90) return { color: 'bg-status-warning', textColor: 'text-status-warning', label: 'At Capacity' };
    return { color: 'bg-primary-500', textColor: 'text-primary-600', label: 'Optimal' };
  };

  return (
    <div className="bg-white rounded-2xl shadow-skyline border border-navy-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-base font-bold text-navy-900">Doctor Load Distribution</h3>
      </div>
      <div className="space-y-5">
        {doctorLoad.map((doc) => {
          const pct = Math.min((doc.scheduled / doc.capacity) * 100, 110);
          const { color, textColor, label } = getLoadStatus(doc.scheduled, doc.capacity);
          return (
            <div key={doc.name}>
              <div className="flex items-center justify-between mb-1.5">
                <div>
                  <span className="text-sm font-semibold text-navy-900">{doc.name}</span>
                  <span className="ml-2 text-xs text-navy-400">{doc.specialty}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn('text-xs font-bold', textColor)}>{label}</span>
                  <span className="text-sm font-semibold text-navy-900">{doc.scheduled}<span className="text-navy-400 font-normal">/{doc.capacity}</span></span>
                </div>
              </div>
              <div className="h-2.5 bg-navy-100 rounded-full overflow-hidden mb-3">
                <div className={cn('h-full rounded-full transition-all duration-700', color)} style={{ width: `${Math.min(pct, 100)}%` }} />
              </div>
              <button 
                onClick={() => onEmergency(doc.id, doc.name)}
                className="w-full py-1.5 border border-status-error/30 text-status-error text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-status-error hover:text-white transition-all flex items-center justify-center gap-1.5"
              >
                <AlertTriangle size={12} /> Emergency Reschedule
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AlertsFeed({ alerts }: { alerts: any[] }) {
  const getConfig = (type: string) => {
    switch (type) {
      case 'success': return { border: 'border-status-open', icon: CheckCircle2, iconColor: 'text-status-open', bg: 'bg-status-open/5' };
      case 'warning': return { border: 'border-status-warning', icon: AlertTriangle, iconColor: 'text-status-warning', bg: 'bg-status-warning/5' };
      case 'error':   return { border: 'border-status-error', icon: Zap, iconColor: 'text-status-error', bg: 'bg-status-error/5' };
      default:        return { border: 'border-navy-200', icon: Shield, iconColor: 'text-navy-400', bg: 'bg-navy-50' };
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-skyline border border-navy-100 p-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-base font-bold text-navy-900">Recent System Events</h3>
      </div>
      <div className="space-y-3">
        {alerts.map((alert, i) => {
          const { border, icon: Icon, iconColor, bg } = getConfig(alert.type);
          return (
            <div key={i} className={cn('flex items-start gap-3 p-3.5 rounded-xl border-l-4 border border-navy-100', border, bg)}>
              <Icon size={16} className={cn('shrink-0 mt-0.5', iconColor)} />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-navy-900 leading-snug">{alert.message}</p>
                <p className="text-xs text-navy-400 mt-1">{alert.time}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [emergencyDoc, setEmergencyDoc] = useState<{id: string, name: string} | null>(null);

  const fetchData = async () => {
      try {
        const res = await api.get('/analytics/admin/overview');
        setData(res.data);
      } catch (err) {
        console.error('Failed to fetch admin stats');
      } finally {
        setLoading(false);
      }
    };
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading || !data) return <div className="p-20 text-center text-navy-400">Loading Real-time Analytics...</div>;

  const iconMap: any = { Calendar, CheckCircle2, Clock, Users };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between items-start gap-4">
        <div>
          <h1 className="text-3xl font-bold text-navy-900 tracking-tight">Analytics & System Overview</h1>
          <p className="text-navy-500 mt-1">Real-time intelligence across all departments · Today, {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
        </div>
        <div className="flex items-center gap-2 bg-status-open/10 text-status-open px-4 py-2 rounded-xl text-sm font-bold shrink-0">
          <span className="w-2 h-2 rounded-full bg-status-open animate-pulse inline-block" />
          System Stable
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {data.kpis.map((k: any) => (
          <KpiCard key={k.label} {...k} icon={iconMap[k.icon] || Calendar} />
        ))}
      </div>

      <BookingVolumeChart hourlyData={data.hourly_data} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DoctorLoadChart 
          doctorLoad={data.doctor_load} 
          onEmergency={(id, name) => setEmergencyDoc({id, name})}
        />
        <AlertsFeed alerts={data.alerts} />
      </div>

      {emergencyDoc && (
        <EmergencyRescheduleModal 
          sourceDoctorId={emergencyDoc.id}
          sourceDoctorName={emergencyDoc.name}
          onClose={() => {
            setEmergencyDoc(null);
            fetchData();
          }}
        />
      )}
    </div>
  );
}
