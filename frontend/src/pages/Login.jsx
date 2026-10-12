import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, Key, Activity, ArrowRight, Info, User, Phone } from 'lucide-react';

export default function Login() {
  const { login, signup, forgotPassword, resetPassword } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState('login'); // 'login' | 'signup' | 'forgot' | 'reset'
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);

    try {
      if (mode === 'signup') {
        await signup(name.trim(), email.trim(), phone.trim(), password);
        navigate('/');
      } else if (mode === 'login') {
        const user = await login(email.trim(), password);
        switch (user.role) {
          case 'admin':
            navigate('/admin');
            break;
          case 'warehouse_staff':
            navigate('/warehouse');
            break;
          case 'delivery_agent':
            navigate('/delivery');
            break;
          default:
            navigate('/');
        }
      } else if (mode === 'forgot') {
        const res = await forgotPassword(email.trim());
        setSuccessMessage(res.message || 'Password reset link dispatched to your email.');
        setMode('reset');
      } else if (mode === 'reset') {
        const res = await resetPassword(resetToken.trim(), email.trim(), newPassword);
        setSuccessMessage(res.message || 'Password updated successfully! You can now log in.');
        setMode('login');
        setPassword('');
        setResetToken('');
        setNewPassword('');
      }
    } catch (err) {
      setError(err.message || 'Authentication request failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 min-h-screen bg-[#080B11] text-slate-100 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center space-y-2">
          <img
            src="/logo.jpg"
            alt="SPORTSMAN.KE - THE PROFESSIONAL ATHLETE"
            className="h-16 w-auto rounded-xl object-contain bg-white p-2 shadow-xl shadow-orange-500/10"
          />
        </div>

        {/* Login/Signup/Forgot Box */}
        <div className="bg-[#0D1321]/60 border border-slate-800/80 p-8 rounded-3xl shadow-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <h2 className="text-lg font-black text-white uppercase tracking-tight m-0">
              {mode === 'signup' && 'Create Account'}
              {mode === 'login' && 'Sign In'}
              {mode === 'forgot' && 'Reset Password'}
              {mode === 'reset' && 'Set New Password'}
            </h2>
            <span className="text-[10px] font-black uppercase text-orange-500 bg-orange-500/10 px-2.5 py-1 rounded-full">
              {mode === 'forgot' || mode === 'reset' ? 'Password Recovery' : 'Secure Access'}
            </span>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            {mode === 'signup' && (
              <>
                <div>
                  <label className="text-[9px] font-black uppercase text-slate-400 block mb-1.5">Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder="Jane Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded-xl pl-10 pr-3 py-3 text-xs text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[9px] font-black uppercase text-slate-400 block mb-1.5">Phone Number</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      required
                      placeholder="0712345678"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded-xl pl-10 pr-3 py-3 text-xs text-white font-mono"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Email field (shown in signup, login, forgot, reset) */}
            <div>
              <label className="text-[9px] font-black uppercase text-slate-400 block mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="name@sportsman.ke"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded-xl pl-10 pr-3 py-3 text-xs text-white placeholder-slate-700"
                />
              </div>
            </div>

            {/* Password field for login & signup */}
            {(mode === 'login' || mode === 'signup') && (
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-[9px] font-black uppercase text-slate-400 block">Password</label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => {
                        setMode('forgot');
                        setError('');
                        setSuccessMessage('');
                      }}
                      className="text-[10px] font-bold text-orange-400 hover:text-orange-300 transition-colors"
                    >
                      Forgot Password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Key className="w-4 h-4 text-slate-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded-xl pl-10 pr-3 py-3 text-xs text-white placeholder-slate-700 tracking-widest font-bold"
                  />
                </div>
              </div>
            )}

            {/* Reset Token & New Password for 'reset' mode */}
            {mode === 'reset' && (
              <>
                <div>
                  <label className="text-[9px] font-black uppercase text-slate-400 block mb-1.5">Reset Token (from email)</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder="Paste 64-char token or link code"
                      value={resetToken}
                      onChange={(e) => setResetToken(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded-xl pl-10 pr-3 py-3 text-xs text-white font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[9px] font-black uppercase text-slate-400 block mb-1.5">New Password</label>
                  <div className="relative">
                    <Key className="w-4 h-4 text-slate-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      placeholder="Minimum 6 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded-xl pl-10 pr-3 py-3 text-xs text-white"
                    />
                  </div>
                </div>
              </>
            )}

            {error && (
              <p className="text-[10px] font-bold text-red-500 m-0 animate-pulse">
                ⚠️ {error}
              </p>
            )}

            {successMessage && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 p-3.5 rounded-xl text-emerald-400 text-[10.5px] font-bold leading-normal">
                ✓ {successMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-650 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-orange-500/10 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>
                {loading
                  ? 'Processing...'
                  : mode === 'signup'
                  ? 'Create Account'
                  : mode === 'forgot'
                  ? 'Send One-Time Reset Link'
                  : mode === 'reset'
                  ? 'Update Password'
                  : 'Unlock Portal'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Bottom Navigation toggles */}
          <div className="flex flex-col gap-2 text-center pt-2 border-t border-slate-900 text-xs font-black">
            {mode === 'login' && (
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setError('');
                  setSuccessMessage('');
                }}
                className="text-orange-500 hover:text-orange-400 transition-colors cursor-pointer"
              >
                Don't have an account? Sign Up
              </button>
            )}

            {mode === 'signup' && (
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError('');
                  setSuccessMessage('');
                }}
                className="text-orange-500 hover:text-orange-400 transition-colors cursor-pointer"
              >
                Already have an account? Sign In
              </button>
            )}

            {(mode === 'forgot' || mode === 'reset') && (
              <div className="flex justify-between items-center px-1">
                <button
                  type="button"
                  onClick={() => {
                    setMode(mode === 'reset' ? 'forgot' : 'login');
                    setError('');
                  }}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setError('');
                  }}
                  className="text-orange-500 hover:text-orange-400 transition-colors"
                >
                  Return to Sign In
                </button>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
