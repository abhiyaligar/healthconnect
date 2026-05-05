import React, { useState } from 'react';
import {
  TrendingDown, TrendingUp, CheckCircle2, AlertTriangle, Zap,
  Users, Clock, Calendar, ArrowUpRight, ArrowDownRight, Shield
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ─── Mock Data ─────────────────────────────────────────────────────────────────

const kpis = [
  {
    label: 'Total Appointments',
    value: '242',
    sub: '+18 from yesterday',
    trend: 'up',
    icon: Calendar,
    color: 'text-primary-600',
    bg: 'bg-primary-50',
  },
  {
    label: 'Conflicts Auto-Resolved',
    value: '18 / 21',
    sub: '85.7% resolution rate',
    trend: 'up',
    icon: CheckCircle2,
    color: 'text-status-open',
    bg: 'bg-status-open/10',
    fillPct: 85.7,
  },
  {
    label: 'Avg. Wait Time',
    value: '18 min',
    sub: '↓ 4 min vs yesterday',
    trend: 'down-good',
    icon: Clock,
    color: 'text-primary-600',
    bg: 'bg-primary-50',
  },
  {
    label: 'Cancellation Rate',
    value: '4.2%',
    sub: '↑ 1.1% vs yesterday',
    trend: 'up-bad',
    icon: Users,
    color: 'text-status-error',
    bg: 'bg-status-error/10',
  },
];

// Hourly bookings data — 8 AM to 6 PM (10 data points)
const hourlyData = [
  { hour: '8AM', count: 12 },
  { hour: '9AM', count: 28 },
  { hour: '10AM', count: 45 },
  { hour: '11AM', count: 38 },
  { hour: '12PM', count: 22 },
  { hour: '1PM', count: 31 },
  { hour: '2PM', count: 40 },
  { hour: '3PM', count: 36 },
  { hour: '4PM', count: 20 },
  { hour: '5PM', count: 10 },
];
const CAPACITY_THRESHOLD = 35;
const MAX_COUNT = 50;

// Doctor load data
const doctorLoad = [
  { name: 'Dr. Sarah Smith', specialty: 'Cardiology', scheduled: 22, capacity: 20 },
  { name: 'Dr. Michael Jones', specialty: 'Cardiology', scheduled: 14, capacity: 20 },
  { name: 'Dr. David Lee', specialty: 'Neurology', scheduled: 20, capacity: 20 },
  { name: 'Dr. Emily Brown', specialty: 'Orthopedics', scheduled: 18, capacity: 20 },
  { name: 'Dr. Robert Davis', specialty: 'Ophthalmology', scheduled: 9, capacity: 20 },
];

const alerts = [
  { id: 1, type: 'success', time: '11:04 AM', message: 'Conflict auto-resolved for Dr. Jones (Slot 10:30 AM — overcapacity).' },
  { id: 2, type: 'warning', time: '10:58 AM', message: 'Cancellation storm detected — batch reschedule triggered for 7 patients.' },
  { id: 3, type: 'error',   time: '10:41 AM', message: "Dr. Sarah Smith's fatigue score reached 82%. Booking priority reduced." },
  { id: 4, type: 'success', time: '10:30 AM', message: 'Conflict auto-resolved for Dr. Brown (Doctor double-booking at 10:00 AM).' },
  { id: 5, type: 'success', time: '09:55 AM', message: 'Conflict auto-resolved for Dr. Lee (Slot 9:45 AM — overcapacity).' },
  { id: 6, type: 'warning', time: '09:22 AM', message: 'High delay expected (>25 min) in Cardiology — load balancing initiated.' },
];

// ─── Sub-components ────────────────────────────────────────────────────────────

function KpiCard({ label, value, sub, trend, icon: Icon, color, bg, fillPct }: any) {
  const isPositive = trend === 'up' || trend === 'down-good';
  const TrendIcon = (trend === 'up' || trend === 'up-bad') ? ArrowUpRight : ArrowDownRight;
  const trendColor = trend === 'up-bad' ? 'text-status-error' : trend === 'down-good' ? 'text-status-open' : 'text-navy-400';

  return (
    <div className="bg-surface rounded-2xl shadow-skyline border border-navy-100 p-6 flex flex-col gap-3">
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

function BookingVolumeChart() {
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
    <div className="bg-surface rounded-2xl shadow-skyline border border-navy-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-navy-900">Hourly Booking Volume</h3>
          <p className="text-xs text-navy-500 mt-0.5">Today · 8 AM – 6 PM</p>
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

          {/* Y-axis grid lines */}
          {[0, 10, 20, 30, 40, 50].map(v => (
            <g key={v}>
              <line
                x1={PAD.left} y1={yPos(v)} x2={W - PAD.right} y2={yPos(v)}
                stroke="#e0e3e5" strokeWidth="1"
              />
              <text x={PAD.left - 6} y={yPos(v) + 4} textAnchor="end" fontSize="10" fill="#70787e">{v}</text>
            </g>
          ))}

          {/* Capacity threshold dashed line */}
          <line
            x1={PAD.left} y1={thresholdY} x2={W - PAD.right} y2={thresholdY}
            stroke="#ba1a1a" strokeWidth="1.5" strokeDasharray="6 4" opacity="0.6"
          />

          {/* Area fill */}
          <path d={areaPath} fill="url(#areaGrad)" />

          {/* Line */}
          <path d={linePath} fill="none" stroke="#006382" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />

          {/* Data points + hover zones */}
          {hourlyData.map((d, i) => (
            <g key={i} onMouseEnter={() => setHovered(i)} style={{ cursor: 'crosshair' }}>
              {/* Invisible hover region */}
              <rect
                x={xPos(i) - (chartW / (n - 1)) / 2}
                y={PAD.top}
                width={chartW / (n - 1)}
                height={chartH}
                fill="transparent"
              />
              <circle
                cx={xPos(i)} cy={yPos(d.count)} r={hovered === i ? 5 : 3.5}
                fill={hovered === i ? '#006382' : '#ffffff'}
                stroke="#006382" strokeWidth="2"
                className="transition-all duration-150"
              />
              {/* Tooltip */}
              {hovered === i && (
                <g>
                  <rect
                    x={xPos(i) - 28} y={yPos(d.count) - 32}
                    width={56} height={24} rx={6}
                    fill="#191c1e"
                  />
                  <text
                    x={xPos(i)} y={yPos(d.count) - 16}
                    textAnchor="middle" fontSize="11" fill="#ffffff" fontWeight="600"
                  >
                    {d.count} appts
                  </text>
                </g>
              )}
              {/* X-axis label */}
              <text
                x={xPos(i)} y={H - 6}
                textAnchor="middle" fontSize="10" fill="#70787e"
              >
                {d.hour}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}

function DoctorLoadChart() {
  const getLoadStatus = (scheduled: number, capacity: number) => {
    const pct = (scheduled / capacity) * 100;
    if (pct > 100) return { color: 'bg-status-error', textColor: 'text-status-error', label: 'Overloaded' };
    if (pct >= 90) return { color: 'bg-status-warning', textColor: 'text-status-warning', label: 'At Capacity' };
    return { color: 'bg-primary-500', textColor: 'text-primary-600', label: 'Optimal' };
  };

  return (
    <div className="bg-surface rounded-2xl shadow-skyline border border-navy-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-base font-bold text-navy-900">Doctor Load Distribution</h3>
          <p className="text-xs text-navy-500 mt-0.5">Today · All Departments</p>
        </div>
        <div className="flex items-center gap-3 text-xs font-medium">
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-primary-500 inline-block" /> Optimal</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-status-warning inline-block" /> At Limit</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-status-error inline-block" /> Overloaded</span>
        </div>
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
              <div className="h-2.5 bg-navy-100 rounded-full overflow-hidden">
                <div
                  className={cn('h-full rounded-full transition-all duration-700', color)}
                  style={{ width: `${Math.min(pct, 100)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AlertsFeed() {
  const getConfig = (type: string) => {
    switch (type) {
      case 'success': return { border: 'border-status-open', icon: CheckCircle2, iconColor: 'text-status-open', bg: 'bg-status-open/5' };
      case 'warning': return { border: 'border-status-warning', icon: AlertTriangle, iconColor: 'text-status-warning', bg: 'bg-status-warning/5' };
      case 'error':   return { border: 'border-status-error', icon: Zap, iconColor: 'text-status-error', bg: 'bg-status-error/5' };
      default:        return { border: 'border-navy-200', icon: Shield, iconColor: 'text-navy-400', bg: 'bg-navy-50' };
    }
  };

  return (
    <div className="bg-surface rounded-2xl shadow-skyline border border-navy-100 p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-base font-bold text-navy-900">System Alerts</h3>
          <p className="text-xs text-navy-500 mt-0.5">Live feed · Today</p>
        </div>
        <span className="flex items-center gap-1.5 text-xs font-bold text-status-open bg-status-open/10 px-2 py-1 rounded-md">
          <span className="w-1.5 h-1.5 rounded-full bg-status-open animate-pulse inline-block" /> Live
        </span>
      </div>
      <div className="space-y-3">
        {alerts.map((alert) => {
          const { border, icon: Icon, iconColor, bg } = getConfig(alert.type);
          return (
            <div
              key={alert.id}
              className={cn(
                'flex items-start gap-3 p-3.5 rounded-xl border-l-4 border border-navy-100',
                border,
                bg
              )}
            >
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
  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-navy-900 font-sans tracking-tight">Analytics & System Overview</h1>
          <p className="text-navy-500 mt-1">Real-time intelligence across all departments · Today, {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
        </div>
        <div className="flex items-center gap-2 bg-status-open/10 text-status-open px-4 py-2 rounded-xl text-sm font-bold">
          <span className="w-2 h-2 rounded-full bg-status-open animate-pulse inline-block" />
          System Stable
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k) => (
          <KpiCard key={k.label} {...k} />
        ))}
      </div>

      {/* Booking Volume Chart */}
      <BookingVolumeChart />

      {/* Doctor Load + Alerts — 2-col */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DoctorLoadChart />
        <AlertsFeed />
      </div>

    </div>
  );
}
