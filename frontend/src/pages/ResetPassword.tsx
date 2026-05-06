import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ShieldAlert, Eye, EyeOff, CheckCircle2, Lock } from 'lucide-react';
import api from '../api';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email');
  const token = searchParams.get('token');

  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await api.post('/auth/reset-password', {
        email,
        otp,
        new_password: password
      });
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#f0f4ff] flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-10 text-center space-y-6">
          <div className="w-20 h-20 bg-status-open/10 text-status-open rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 size={40} />
          </div>
          <h2 className="text-3xl font-bold text-navy-900">Password Reset!</h2>
          <p className="text-navy-500">Your password has been successfully updated. You can now login with your new credentials.</p>
          <button
            onClick={() => navigate('/')}
            className="w-full py-4 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-2xl shadow-lg transition-all"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0f4ff] flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-navy-100">
        <div className="px-10 pt-10 pb-6 border-b border-navy-50">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center shadow-lg">
              <ShieldAlert size={22} className="text-white" />
            </div>
            <span className="text-2xl font-bold text-primary-700 tracking-tight">HealthConnect</span>
          </div>
          <h2 className="text-2xl font-bold text-navy-900">Reset Password</h2>
          <p className="text-sm text-navy-400 mt-1">Enter the 6-digit code sent to <strong>{email}</strong> and set a new password.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-10 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-navy-700 mb-2">6-Digit Code</label>
            <input
              type="text"
              maxLength={6}
              value={otp}
              onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
              placeholder="000000"
              className="w-full px-5 py-4 bg-navy-50/50 border border-navy-100 rounded-2xl text-center text-2xl font-black tracking-[10px] text-navy-900 focus:ring-2 focus:ring-primary-500 outline-none transition"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-navy-700 mb-2">New Password</label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-5 py-4 bg-navy-50/50 border border-navy-100 rounded-2xl text-navy-900 focus:ring-2 focus:ring-primary-500 outline-none transition"
                required
              />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-4 text-navy-400">
                {showPass ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-navy-700 mb-2">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-5 py-4 bg-navy-50/50 border border-navy-100 rounded-2xl text-navy-900 focus:ring-2 focus:ring-primary-500 outline-none transition"
              required
            />
          </div>

          {error && (
            <div className="bg-status-error/5 text-status-error text-sm p-4 rounded-xl border border-status-error/10 font-medium">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-2xl shadow-lg shadow-primary-600/20 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <><span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Resetting...</>
            ) : (
              <><Lock size={18} /> Update Password</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
