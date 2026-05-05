import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, AlertTriangle, CalendarDays, BarChart2,
  Bell, X, Zap, CalendarPlus, Stethoscope, ShieldCheck, LogOut
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useAuth, type Role } from '../context/AuthContext';
import { useToast } from './ToastProvider';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ─── Role-based nav config ─────────────────────────────────────────────────────
type NavItem = { name: string; path: string; icon: React.ElementType };

const navConfig: Record<Role, NavItem[]> = {
  patient: [
    { name: 'Book Appointment', path: '/book',      icon: CalendarPlus },
  ],
  doctor: [
    { name: 'My Schedule',     path: '/doctors',   icon: Stethoscope  },
    { name: 'Scheduling',      path: '/scheduling',icon: CalendarDays },
  ],
  receptionist: [
    { name: 'Dashboard',       path: '/reception', icon: LayoutDashboard },
    { name: 'Scheduling',      path: '/scheduling',icon: CalendarDays },
    { name: 'Queue',           path: '/queue',     icon: Users           },
    { name: 'Conflicts',       path: '/conflicts', icon: AlertTriangle   },
    { name: 'Analytics',       path: '/analytics', icon: BarChart2       },
  ],
  admin: [
    { name: 'Dashboard',       path: '/reception', icon: LayoutDashboard },
    { name: 'Book Appointment',path: '/book',      icon: CalendarPlus    },
    { name: 'Queue',           path: '/queue',     icon: Users           },
    { name: 'Conflicts',       path: '/conflicts', icon: AlertTriangle   },
    { name: 'Doctors',         path: '/doctors',   icon: CalendarDays    },
    { name: 'Analytics',       path: '/analytics', icon: BarChart2       },
    { name: 'Admin Panel',     path: '/admin',     icon: ShieldCheck     },
  ],
};

const roleLabel: Record<Role, string> = {
  patient:      'Patient',
  doctor:       'Doctor',
  receptionist: 'Receptionist',
  admin:        'Administrator',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate  = useNavigate();
  const { role, name, logout } = useAuth();
  const { showToast } = useToast();

  const [stormActive]               = useState(true);
  const [stormDismissed, setStormDismissed] = useState(false);
  const [batchTriggered, setBatchTriggered] = useState(false);

  const handleBatchReschedule = () => {
    setBatchTriggered(true);
    showToast('warning', 'Rescheduling In Progress', '7 patients are being re-queued due to the cancellation storm.');
    setTimeout(() => {
      setStormDismissed(true);
      showToast('success', 'System Stabilized', 'Batch rescheduling complete. Queue flow optimized.');
    }, 1800);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems    = navConfig[role ?? 'receptionist'] ?? [];
  const showBanner  = stormActive && !stormDismissed && (role === 'receptionist' || role === 'admin');
  const initials    = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '??';

  return (
    <div className="flex h-screen bg-background overflow-hidden">

      {/* Sidebar */}
      <aside className="w-64 bg-surface border-r border-navy-100 flex flex-col">
        {/* Brand */}
        <div className="p-6 border-b border-navy-100">
          <h1 className="text-2xl font-bold text-primary-700 tracking-tight">MediSync</h1>
          <p className="text-xs text-navy-400 mt-0.5">Appointment Stabilizer</p>
        </div>

        {/* User pill */}
        <div className="px-4 pt-4 pb-2">
          <div className="flex items-center gap-3 p-3 bg-navy-50 rounded-xl">
            <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center shrink-0">
              <span className="text-xs font-bold text-primary-700">{initials}</span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-navy-900 truncate">{name || 'User'}</p>
              <p className="text-xs text-navy-400">{roleLabel[role ?? 'receptionist']}</p>
            </div>
            {role === 'admin' && (
              <div title="Administrator">
                <ShieldCheck size={16} className="text-primary-500 shrink-0 ml-auto" />
              </div>
            )}
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-4 pt-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive     = location.pathname === item.path;
            const Icon         = item.icon;
            const isConflicts  = item.path === '/conflicts';
            const isAdminPanel = item.path === '/admin';
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors relative',
                  isActive
                    ? 'bg-primary-100 text-primary-700'
                    : isAdminPanel
                      ? 'text-primary-600 hover:bg-primary-50 hover:text-primary-700'
                      : 'text-navy-500 hover:bg-navy-50 hover:text-navy-800'
                )}
              >
                <Icon size={20} className={cn(
                  isActive      ? 'text-primary-600' :
                  isAdminPanel  ? 'text-primary-500' : 'text-navy-400'
                )} />
                {item.name}
                {isConflicts && showBanner && (
                  <span className="ml-auto w-2 h-2 rounded-full bg-status-error animate-pulse" />
                )}
                {isAdminPanel && (
                  <span className="ml-auto text-[10px] font-bold bg-primary-100 text-primary-600 px-1.5 py-0.5 rounded">ADMIN</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-navy-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-medium text-navy-500 hover:text-status-error hover:bg-status-error/5 rounded-lg transition-colors"
          >
            <LogOut size={16} /> Log Out
          </button>
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Cancellation Storm Banner (receptionist + admin only) */}
        {showBanner && (
          <div className="bg-status-warning border-b border-status-warning/80 text-white px-6 py-3 flex items-center gap-4 shrink-0">
            <div className="flex items-center gap-2 shrink-0">
              <Zap size={18} />
              <span className="font-bold text-sm">CANCELLATION STORM DETECTED</span>
            </div>
            <div className="flex-1 text-sm text-amber-100">
              <span className="font-semibold text-white">11 cancellations</span> in the last 10 min
              &nbsp;·&nbsp; <span className="font-semibold text-white">7 patients</span> require re-queuing
              &nbsp;·&nbsp; Overbooking risk: <span className="font-semibold text-white">High</span>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              {!batchTriggered ? (
                <button
                  onClick={handleBatchReschedule}
                  className="px-4 py-1.5 bg-white text-status-warning font-bold text-xs rounded-lg hover:bg-amber-50 transition-colors shadow-sm"
                >
                  Trigger Batch Reschedule
                </button>
              ) : (
                <span className="text-xs text-amber-100 font-semibold flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
                  Rescheduling 7 patients…
                </span>
              )}
              <button
                onClick={() => setStormDismissed(true)}
                className="p-1 rounded-lg hover:bg-status-warning/80 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Header */}
        <header className="h-16 bg-surface border-b border-navy-100 flex items-center justify-between px-8 shrink-0">
          <p className="text-navy-700 font-medium">
            Welcome back, <span className="font-bold text-navy-900">{name || 'User'}</span>
            {role === 'admin' && (
              <span className="ml-2 text-xs bg-primary-100 text-primary-600 font-bold px-2 py-0.5 rounded-full">ADMIN</span>
            )}
          </p>
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-navy-500 hover:text-navy-800 transition-colors">
              <Bell size={22} />
              <span className="absolute top-2 right-2 h-2 w-2 bg-status-error rounded-full border-2 border-surface" />
            </button>
            <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center">
              <span className="text-sm font-bold text-primary-700">{initials}</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-8">
          <div className="max-w-[1400px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
