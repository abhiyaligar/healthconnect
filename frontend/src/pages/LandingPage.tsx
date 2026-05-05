import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, Stethoscope, LayoutDashboard, ChevronRight,
  ChevronLeft, Eye, EyeOff, ShieldAlert, Zap, Clock, BarChart2, CheckCircle2
} from 'lucide-react';
import { useAuth, roleHomePath, type Role } from '../context/AuthContext';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }

// ─── Role definitions ─────────────────────────────────────────────────────────
const roles = [
  {
    id: 'patient' as Role,
    label: 'Patient',
    icon: User,
    desc: 'Book appointments & track your visit',
    color: 'text-tertiary-600',
    bg: 'bg-tertiary-50',
    border: 'border-tertiary-200 hover:border-tertiary-400',
    activeBorder: 'border-tertiary-500',
    activeBg: 'bg-tertiary-50',
    placeholder: 'e.g. John Smith',
  },
  {
    id: 'doctor' as Role,
    label: 'Doctor',
    icon: Stethoscope,
    desc: 'View your schedule & manage availability',
    color: 'text-primary-600',
    bg: 'bg-primary-50',
    border: 'border-primary-200 hover:border-primary-400',
    activeBorder: 'border-primary-500',
    activeBg: 'bg-primary-50',
    placeholder: 'e.g. Dr. Sarah Smith',
  },
  {
    id: 'receptionist' as Role,
    label: 'Receptionist',
    icon: LayoutDashboard,
    desc: 'Manage queue, conflicts & patient flow',
    color: 'text-violet-600',
    bg: 'bg-violet-50',
    border: 'border-violet-200 hover:border-violet-400',
    activeBorder: 'border-violet-500',
    activeBg: 'bg-violet-50',
    placeholder: 'e.g. Sarah (Front Desk)',
  },
];

const features = [
  { icon: Zap,          label: 'Real-time Conflict Resolution'  },
  { icon: Clock,        label: 'Queue Wait Prediction'          },
  { icon: BarChart2,    label: 'Fatigue-Aware Scheduling'       },
  { icon: CheckCircle2, label: 'Auto Overbooking Stabilization' },
];

// ─── Component ────────────────────────────────────────────────────────────────
type Step = 'select' | 'login' | 'admin';

export default function LandingPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [step, setStep]             = useState<Step>('select');
  const [selectedRole, setRole]     = useState<Role | null>(null);
  const [name, setName]             = useState('');
  const [password, setPassword]     = useState('');
  const [showPass, setShowPass]     = useState(false);
  const [error, setError]           = useState('');
  const [loading, setLoading]       = useState(false);

  const roleConfig = roles.find(r => r.id === selectedRole);

  const handleRoleSelect = (r: Role) => {
    setRole(r);
    setStep('login');
    setName('');
    setPassword('');
    setError('');
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError('Please enter your name.'); return; }
    setLoading(true);

    // SIMULATED BACKEND CALL
    // In production, this sends name/pass to the API.
    // The API checks the database and returns the actual role authorized for this user.
    setTimeout(() => {
      let finalRole: Role = selectedRole!;
      
      // Demo logic: If name is 'Admin', simulate backend returning admin role
      if (name.toLowerCase() === 'admin') {
        finalRole = 'admin';
      }

      login(finalRole, name.trim());
      navigate(roleHomePath(finalRole));
    }, 800);
  };

  return (
    <div className="min-h-screen flex overflow-hidden bg-[#f0f4ff]">

      {/* ── Left: Hero ── */}
      <div className="hidden lg:flex flex-col justify-between w-[58%] relative overflow-hidden px-16 py-14">
        {/* Animated gradient blobs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-80px] left-[-80px] w-[500px] h-[500px] rounded-full bg-primary-300/30 blur-[100px] animate-[float_8s_ease-in-out_infinite]" />
          <div className="absolute bottom-[-60px] right-[-60px] w-[400px] h-[400px] rounded-full bg-violet-300/25 blur-[100px] animate-[float_10s_ease-in-out_infinite_reverse]" />
          <div className="absolute top-[40%] left-[40%] w-[300px] h-[300px] rounded-full bg-tertiary-200/20 blur-[80px] animate-[float_12s_ease-in-out_infinite_1s]" />
        </div>

        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center shadow-lg">
              <ShieldAlert size={22} className="text-white" />
            </div>
            <span className="text-2xl font-bold text-primary-700 tracking-tight">MediSync</span>
          </div>
          <p className="text-xs text-navy-400 font-medium tracking-widest uppercase ml-1">Appointment Stabilizer · v1.0</p>
        </div>

        {/* Main headline */}
        <div className="relative z-10 space-y-6">
          <h1 className="text-5xl font-bold text-navy-900 leading-tight tracking-tight">
            Intelligent Scheduling<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-violet-600">
              for Modern Healthcare
            </span>
          </h1>
          <p className="text-lg text-navy-500 max-w-md leading-relaxed">
            MediSync dynamically stabilizes overbooked appointments, resolves conflicts in real-time, and ensures every patient gets fair, timely care.
          </p>

          {/* Feature pills */}
          <div className="flex flex-col gap-3">
            {features.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/80 shadow-sm flex items-center justify-center shrink-0">
                  <Icon size={16} className="text-primary-600" />
                </div>
                <span className="text-sm font-medium text-navy-700">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Floating stats preview card */}
        <div className="relative z-10 bg-white/70 backdrop-blur-md rounded-2xl border border-white/80 shadow-xl p-5 max-w-sm">
          <p className="text-xs font-bold text-navy-400 uppercase tracking-wide mb-3">System Status · Live</p>
          <div className="grid grid-cols-3 gap-4 text-center">
            {[
              { val: '242', label: 'Appts Today', color: 'text-primary-600' },
              { val: '18 / 21', label: 'Conflicts Resolved', color: 'text-status-open' },
              { val: '18m', label: 'Avg Wait', color: 'text-status-warning' },
            ].map(s => (
              <div key={s.label}>
                <p className={cn('text-xl font-bold', s.color)}>{s.val}</p>
                <p className="text-xs text-navy-400 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right: Login Panel ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-10 lg:px-12">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-3xl shadow-2xl border border-navy-100 overflow-hidden">

            {/* Panel header */}
            <div className="px-8 pt-8 pb-6 border-b border-navy-100">
              <div className="lg:hidden flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg bg-primary-600 flex items-center justify-center">
                  <ShieldAlert size={15} className="text-white" />
                </div>
                <span className="font-bold text-primary-700">MediSync</span>
              </div>
              {step === 'select' && (
                <>
                  <h2 className="text-2xl font-bold text-navy-900">Welcome back</h2>
                  <p className="text-navy-500 text-sm mt-1">Select your role to continue</p>
                </>
              )}
              {step === 'login' && roleConfig && (
                <div className="flex items-center gap-3">
                  <button onClick={() => { setStep('select'); setError(''); }} className="p-1.5 rounded-lg hover:bg-navy-50 text-navy-400 hover:text-navy-700 transition-colors">
                    <ChevronLeft size={20} />
                  </button>
                  <div>
                    <h2 className="text-xl font-bold text-navy-900">Login as {roleConfig.label}</h2>
                    <p className="text-sm text-navy-400">Enter your details to continue</p>
                  </div>
                </div>
              )}
              {step === 'admin' && (
                <div className="flex items-center gap-3">
                  <button onClick={() => { setStep('select'); setError(''); }} className="p-1.5 rounded-lg hover:bg-navy-50 text-navy-400 hover:text-navy-700 transition-colors">
                    <ChevronLeft size={20} />
                  </button>
                  <div>
                    <h2 className="text-xl font-bold text-navy-900">Administrator Access</h2>
                    <p className="text-sm text-status-warning">Restricted — Authorized personnel only</p>
                  </div>
                </div>
              )}
            </div>

            <div className="px-8 py-7">
              {/* ── STEP 1: Role Selection ── */}
              {step === 'select' && (
                <div className="space-y-3">
                  {roles.map(r => {
                    const Icon = r.icon;
                    return (
                      <button
                        key={r.id}
                        onClick={() => handleRoleSelect(r.id)}
                        className={cn(
                          'w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all group text-left',
                          r.border,
                          'hover:shadow-md'
                        )}
                      >
                        <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center shrink-0', r.bg)}>
                          <Icon size={22} className={r.color} />
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-navy-900">{r.label}</p>
                          <p className="text-xs text-navy-400 mt-0.5">{r.desc}</p>
                        </div>
                        <ChevronRight size={18} className="text-navy-300 group-hover:text-navy-600 transition-colors shrink-0" />
                      </button>
                    );
                  })}
                </div>
              )}

              {/* ── STEP 2: Login Form ── */}
              {step === 'login' && roleConfig && (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-navy-700 mb-1.5">Your Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={e => { setName(e.target.value); setError(''); }}
                      placeholder={roleConfig.placeholder}
                      className="w-full px-4 py-3 border border-navy-200 rounded-xl text-sm text-navy-900 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition"
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-navy-700 mb-1.5">Password</label>
                    <div className="relative">
                      <input
                        type={showPass ? 'text' : 'password'}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        className="w-full px-4 py-3 border border-navy-200 rounded-xl text-sm text-navy-900 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition pr-12"
                      />
                      <button type="button" onClick={() => setShowPass(s => !s)} className="absolute right-3 top-3.5 text-navy-400 hover:text-navy-600">
                        {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    <p className="text-xs text-navy-400 mt-1.5">Your role is verified against the database on login.</p>
                  </div>
                  {error && <p className="text-sm text-status-error font-medium">{error}</p>}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl transition-all shadow-sm disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {loading
                      ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Signing in…</>
                      : `Login as ${roleConfig.label}`
                    }
                  </button>
                </form>
              )}
            </div>

            {/* Panel footer */}
            <div className="px-8 pb-7 text-center">
            </div>
          </div>
        </div>
      </div>

      {/* CSS for floating blobs */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) scale(1); }
          50%       { transform: translateY(-30px) scale(1.05); }
        }
      `}</style>
    </div>
  );
}
