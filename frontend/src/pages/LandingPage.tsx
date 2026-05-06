import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, Stethoscope, LayoutDashboard, ChevronRight,
  ChevronLeft, Eye, EyeOff, ShieldAlert, Zap, Clock, BarChart2, CheckCircle2
} from 'lucide-react';
import { useAuth, roleHomePath, type Role } from '../context/AuthContext';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import api from '../api';

function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }

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
    placeholder: 'e.g. user@example.com',
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
    placeholder: 'e.g. doctor@example.com',
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
    placeholder: 'e.g. receptionist@example.com',
  },
];

const features = [
  { icon: Zap,          label: 'Real-time Conflict Resolution'  },
  { icon: Clock,        label: 'Queue Wait Prediction'          },
  { icon: BarChart2,    label: 'Fatigue-Aware Scheduling'       },
  { icon: CheckCircle2, label: 'Auto Overbooking Stabilization' },
];

type Step = 'select' | 'login' | 'signup' | 'verify' | 'forgot';

export default function LandingPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [step, setStep]             = useState<Step>('select');
  const [selectedRole, setRole]     = useState<Role | null>(null);
  const [email, setEmail]           = useState('');
  const [fullName, setFullName]     = useState('');
  const [mobile, setMobile]         = useState('');
  const [password, setPassword]     = useState('');
  const [showPass, setShowPass]     = useState(false);
  const [error, setError]           = useState('');
  const [loading, setLoading] =       useState(false);
  const [otp, setOtp]               = useState('');
  const [resetSent, setResetSent]   = useState(false);
  const [resendCooldown, setCooldown]= useState(0);
  const [specialty, setSpecialty]   = useState('General');
  const [bio, setBio]               = useState('');
  const [dob, setDob]               = useState('');
  const [gender, setGender]         = useState('');
  const [medicalHistory, setMedHist]= useState('');

  const roleConfig = roles.find(r => r.id === selectedRole);

  const handleRoleSelect = (r: Role) => {
    setRole(r);
    setStep('login');
    setError('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) { setError('Please fill all fields.'); return; }
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/login', {
        email: email.trim(),
        password: password.trim(),
      });

      const { access_token, user } = response.data;
      // Backend returns role in uppercase, we need it in lowercase for frontend
      const role = user.role.toLowerCase() as Role;
      
      login(role, user.full_name || user.email, access_token, user.id);
      navigate(roleHomePath(role));
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim() || !fullName.trim()) { setError('Please fill all fields.'); return; }
    setLoading(true);
    setError('');

    try {
      await api.post('/auth/signup', {
        email: email.trim(),
        password: password.trim(),
        full_name: fullName.trim(),
        mobile: mobile.trim(),
        role: selectedRole?.toUpperCase(),
        dob: selectedRole === 'patient' ? dob : null,
        gender: selectedRole === 'patient' ? gender : null,
        specialty: selectedRole === 'doctor' ? specialty : null,
        bio: selectedRole === 'doctor' ? bio : null,
        medical_history: selectedRole === 'patient' ? medicalHistory : null,
      });
      
      setStep('verify');
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Signup failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim()) return;
    setLoading(true);
    // Mocking OTP verification - in real app, call /auth/verify
    setTimeout(() => {
      setLoading(false);
      setStep('login');
      setError('Email verified! Please login.');
    }, 1500);
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    setLoading(true);
    try {
      await api.post(`/auth/resend-otp?email=${email.trim()}`);
      setCooldown(60);
      setError('');
    } catch (err: any) {
      setError('Failed to resend code.');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setCooldown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    try {
      await api.post(`/auth/forgot-password?email=${email.trim()}`);
      setResetSent(true);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to send reset link.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex overflow-hidden bg-[#f0f4ff]">
      {/* ── Left: Hero ── */}
      <div className="hidden lg:flex flex-col justify-between w-[58%] relative overflow-hidden px-16 py-14">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-80px] left-[-80px] w-[500px] h-[500px] rounded-full bg-primary-300/30 blur-[100px] animate-[float_8s_ease-in-out_infinite]" />
          <div className="absolute bottom-[-60px] right-[-60px] w-[400px] h-[400px] rounded-full bg-violet-300/25 blur-[100px] animate-[float_10s_ease-in-out_infinite_reverse]" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center shadow-lg">
              <ShieldAlert size={22} className="text-white" />
            </div>
            <span className="text-2xl font-bold text-primary-700 tracking-tight">HealthConnect</span>
          </div>
          <p className="text-xs text-navy-400 font-medium tracking-widest uppercase ml-1">Appointment Stabilizer · v1.0</p>
        </div>

        <div className="relative z-10 space-y-6">
          <h1 className="text-5xl font-bold text-navy-900 leading-tight tracking-tight">
            Intelligent Scheduling<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-violet-600">
              for Modern Healthcare
            </span>
          </h1>
          <p className="text-lg text-navy-500 max-w-md leading-relaxed">
            HealthConnect dynamically stabilizes overbooked appointments, resolves conflicts in real-time, and ensures every patient gets fair, timely care.
          </p>
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
            <div className="px-8 pt-8 pb-6 border-b border-navy-100">
              <div className="lg:hidden flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg bg-primary-600 flex items-center justify-center">
                  <ShieldAlert size={15} className="text-white" />
                </div>
                <span className="font-bold text-primary-700">HealthConnect</span>
              </div>
              {step === 'select' && (
                <>
                  <h2 className="text-2xl font-bold text-navy-900">Welcome back</h2>
                  <p className="text-navy-500 text-sm mt-1">Select your role to continue</p>
                </>
              )}
              {(step === 'login' || step === 'signup' || step === 'verify' || step === 'forgot') && roleConfig && (
                <div className="flex items-center gap-3">
                  <button onClick={() => { 
                    if (step === 'verify') setStep('signup');
                    else if (step === 'forgot') setStep('login');
                    else setStep('select'); 
                    setError(''); 
                  }} className="p-1.5 rounded-lg hover:bg-navy-50 text-navy-400 hover:text-navy-700 transition-colors">
                    <ChevronLeft size={20} />
                  </button>
                  <div>
                    <h2 className="text-xl font-bold text-navy-900">
                      {step === 'login' ? 'Login' : step === 'signup' ? 'Sign Up' : step === 'verify' ? 'Verify Email' : 'Forgot Password'}
                    </h2>
                    <p className="text-sm text-navy-400">
                      {step === 'verify' ? `Sent code to ${email}` : 'Enter your details to continue'}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="px-8 py-7">
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

              {(step === 'login' || step === 'signup') && roleConfig && (
                <form onSubmit={step === 'login' ? handleLogin : handleSignup} className="space-y-4">
                  {step === 'signup' && (
                    <>
                      <div>
                        <label className="block text-sm font-semibold text-navy-700 mb-1.5">Full Name</label>
                        <input
                          type="text"
                          value={fullName}
                          onChange={e => setFullName(e.target.value)}
                          placeholder="e.g. John Doe"
                          className="w-full px-4 py-3 border border-navy-200 rounded-xl text-sm text-navy-900 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-navy-700 mb-1.5">Mobile Number</label>
                        <input
                          type="tel"
                          value={mobile}
                          onChange={e => setMobile(e.target.value)}
                          placeholder="e.g. 9876543210"
                          className="w-full px-4 py-3 border border-navy-200 rounded-xl text-sm text-navy-900 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition"
                          required
                        />
                      </div>
                      
                      {selectedRole === 'patient' && (
                        <>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-semibold text-navy-700 mb-1.5">Date of Birth</label>
                              <input
                                type="date"
                                value={dob}
                                onChange={e => setDob(e.target.value)}
                                className="w-full px-4 py-3 border border-navy-200 rounded-xl text-sm text-navy-900 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-semibold text-navy-700 mb-1.5">Gender</label>
                              <select
                                value={gender}
                                onChange={e => setGender(e.target.value)}
                                className="w-full px-4 py-3 border border-navy-200 rounded-xl text-sm text-navy-900 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition"
                                required
                              >
                                <option value="">Select</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                              </select>
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-navy-700 mb-1.5">Medical History</label>
                            <textarea
                              value={medicalHistory}
                              onChange={e => setMedHist(e.target.value)}
                              placeholder="e.g. Allergies, chronic conditions..."
                              className="w-full px-4 py-3 border border-navy-200 rounded-xl text-sm text-navy-900 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition"
                              rows={2}
                            />
                          </div>
                        </>
                      )}

                      {selectedRole === 'doctor' && (
                        <>
                          <div>
                            <label className="block text-sm font-semibold text-navy-700 mb-1.5">Specialty</label>
                            <input
                              type="text"
                              value={specialty}
                              onChange={e => setSpecialty(e.target.value)}
                              placeholder="e.g. Cardiology"
                              className="w-full px-4 py-3 border border-navy-200 rounded-xl text-sm text-navy-900 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-navy-700 mb-1.5">Bio</label>
                            <textarea
                              value={bio}
                              onChange={e => setBio(e.target.value)}
                              placeholder="Describe your expertise..."
                              className="w-full px-4 py-3 border border-navy-200 rounded-xl text-sm text-navy-900 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition"
                              rows={2}
                            />
                          </div>
                        </>
                      )}
                    </>
                  )}
                  <div>
                    <label className="block text-sm font-semibold text-navy-700 mb-1.5">Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={e => { setEmail(e.target.value); setError(''); }}
                      placeholder={roleConfig.placeholder}
                      className="w-full px-4 py-3 border border-navy-200 rounded-xl text-sm text-navy-900 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition"
                      required
                    />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1.5">
                      <label className="text-sm font-semibold text-navy-700">Password</label>
                      {step === 'login' && (
                        <button type="button" onClick={() => setStep('forgot')} className="text-xs font-bold text-primary-600 hover:underline">Forgot Password?</button>
                      )}
                    </div>
                    <div className="relative">
                      <input
                        type={showPass ? 'text' : 'password'}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-4 py-3 border border-navy-200 rounded-xl text-sm text-navy-900 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition pr-12"
                        required
                      />
                      <button type="button" onClick={() => setShowPass(s => !s)} className="absolute right-3 top-3.5 text-navy-400 hover:text-navy-600">
                        {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                  {error && <p className="text-sm text-status-error font-medium">{error}</p>}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl transition-all shadow-sm disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {loading
                      ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Working…</>
                      : step === 'login' ? `Login as ${roleConfig.label}` : `Create ${roleConfig.label} Account`
                    }
                  </button>
                  <p className="text-center text-sm text-navy-500">
                    {step === 'login' ? "Don't have an account?" : "Already have an account?"}{' '}
                    <button
                      type="button"
                      onClick={() => { setStep(step === 'login' ? 'signup' : 'login'); setError(''); }}
                      className="text-primary-600 font-bold hover:underline"
                    >
                      {step === 'login' ? 'Sign Up' : 'Login'}
                    </button>
                  </p>
                </form>
              )}

              {step === 'verify' && (
                <form onSubmit={handleVerifyOtp} className="space-y-6">
                  <div className="text-center">
                    <p className="text-sm text-navy-500 mb-4">We've sent a 6-digit code to your inbox. Please enter it below to verify your identity.</p>
                    <input
                      type="text"
                      maxLength={6}
                      value={otp}
                      onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                      placeholder="000000"
                      className="w-full text-center text-3xl font-black tracking-[10px] py-4 border-2 border-navy-200 rounded-2xl focus:border-primary-500 focus:outline-none transition"
                      required
                    />
                  </div>
                  {error && <p className="text-sm text-status-error font-medium text-center">{error}</p>}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl shadow-lg transition-all"
                  >
                    {loading ? 'Verifying...' : 'Verify & Continue'}
                  </button>
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={resendCooldown > 0 || loading}
                      className="text-sm font-bold text-primary-600 hover:underline disabled:text-navy-300"
                    >
                      {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : "Didn't receive code? Resend"}
                    </button>
                  </div>
                </form>
              )}

              {step === 'forgot' && (
                <div className="space-y-6">
                  {!resetSent ? (
                    <form onSubmit={handleForgotPassword} className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-navy-700 mb-1.5">Email Address</label>
                        <input
                          type="email"
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          placeholder="Enter your registered email"
                          className="w-full px-4 py-3 border border-navy-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-400 outline-none"
                          required
                        />
                      </div>
                      {error && <p className="text-sm text-status-error font-medium">{error}</p>}
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-primary-600 text-white font-bold rounded-xl shadow-sm disabled:opacity-60"
                      >
                        {loading ? 'Sending...' : 'Send Reset Link'}
                      </button>
                    </form>
                  ) : (
                    <div className="text-center space-y-4">
                      <div className="w-16 h-16 bg-status-open/10 text-status-open rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle2 size={32} />
                      </div>
                      <h3 className="text-lg font-bold text-navy-900">Email Sent!</h3>
                      <p className="text-sm text-navy-500">Check your inbox for a link to reset your password. If you don't see it, check your spam folder.</p>
                      <button onClick={() => setStep('login')} className="text-primary-600 font-bold hover:underline">Back to Login</button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) scale(1); }
          50%       { transform: translateY(-30px) scale(1.05); }
        }
      `}</style>
    </div>
  );
}
