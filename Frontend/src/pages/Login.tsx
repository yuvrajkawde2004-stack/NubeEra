import React, { useState } from 'react';
import { Eye, EyeOff, Loader2, AlertCircle, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Forgot Password State
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState<'request' | 'otp'>('request');
  const [forgotEmail, setForgotEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      const roleLower = user.utype?.toLowerCase() || '';
      let redirectPath = '/learner/dashboard';
      
      if (['staff', 'admin', 'superadmin'].includes(roleLower)) redirectPath = '/staff/dashboard';
      else if (['trainer', 'teacher'].includes(roleLower)) redirectPath = '/trainer/dashboard';
      else redirectPath = '/learner/dashboard';

      window.location.href = redirectPath;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Identity verification failed. Please audit your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotLoading(true);
    setForgotError('');
    setForgotSuccess('');

    try {
      if (forgotStep === 'request') {
        const res = await api.post('/auth/forgot-password', { email: forgotEmail });
        setForgotSuccess(res.data.message || 'Access code dispatched to your terminal.');
        setForgotStep('otp');
      } else if (forgotStep === 'otp') {
        await api.post('/auth/reset-password', { email: forgotEmail, otp, newPassword });
        setForgotSuccess('Security credentials synchronized. Access restored.');
        setTimeout(() => closeForgotModal(), 2000);
      }
    } catch (err: any) {
      setForgotError(err.response?.data?.message || 'Sync protocol failure. Please retry.');
    } finally {
      setForgotLoading(false);
    }
  };

  const closeForgotModal = () => {
    setShowForgotModal(false);
    setForgotStep('request');
    setForgotEmail('');
    setOtp('');
    setNewPassword('');
    setForgotError('');
    setForgotSuccess('');
  };

  return (
    <div className="min-h-screen bg-[var(--bg-page)] flex items-center justify-center p-6 relative overflow-hidden font-sans">
      
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-indigo-500/10 blur-[140px] rounded-full animate-pulse duration-[10s]"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-violet-500/10 blur-[140px] rounded-full animate-pulse duration-[12s]"></div>

      <div className="w-full max-w-[460px] relative z-10 animate-in fade-in slide-in-from-bottom-12 duration-1000">



        {/* Authentication Card */}
        <div className="bg-white p-8 md:p-10 rounded-[32px] border border-slate-200 shadow-xl relative overflow-hidden">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Welcome back</h2>
            <p className="mt-2 text-slate-500 font-medium">Sign in to your account to continue</p>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 mb-6 animate-in head-shake duration-500" role="alert">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <span className="text-sm font-medium text-red-600">{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6 relative z-10">
            <div>
              <label className="text-sm font-semibold text-slate-700 mb-2 block">Email or Username</label>
              <div className="relative group/field">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-white border border-slate-200 rounded-xl py-3.5 px-4 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-sm"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold text-slate-700">Password</label>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative group/field">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full bg-white border border-slate-200 rounded-xl py-3.5 px-4 pr-12 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>



            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 !rounded-xl bg-[#0f172a] hover:bg-[#1e293b] text-white font-bold text-lg transition-all shadow-lg active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin mx-auto" />
              ) : (
                "Sign in"
              )}
            </button>

            <div className="pt-6 border-t border-slate-100 text-center">
              <span className="text-sm text-slate-500">
                Don't have an account?{' '}
                <Link to="/register" className="font-semibold text-slate-900 hover:underline transition-colors">
                  Register now
                </Link>
              </span>
            </div>
          </form>
        </div>

        <p className="text-center text-[11px] font-bold text-slate-500 uppercase tracking-[0.4em] mt-16 opacity-40">
          Nubeera Technologies © {new Date().getFullYear()}
        </p>
      </div>

      {/* Recover Access Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-6 animate-in fade-in duration-500">
          <div className="bg-white w-full max-w-md rounded-[40px] border border-slate-200 shadow-2xl animate-in zoom-in-95 duration-500 overflow-hidden">
            <div className="p-10 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Recover Access</h2>
                <p className="text-[11px] text-indigo-600 font-bold uppercase tracking-widest mt-2">Verification Loop Required</p>
              </div>
              <button onClick={closeForgotModal} className="w-10 h-10 flex items-center justify-center rounded-2xl bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-500 transition-all border border-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleForgotPassword} className="p-10 space-y-8">
              {forgotError && (
                <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-[11px] font-bold text-rose-600 uppercase tracking-widest">
                  {forgotError}
                </div>
              )}
              {forgotSuccess && (
                <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-[11px] font-bold text-emerald-600 uppercase tracking-widest">
                  {forgotSuccess}
                </div>
              )}

              {forgotStep === 'request' ? (
                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-3 block ml-1">Registered Identifier</label>
                    <input
                      type="email"
                      required
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl py-3.5 px-4 text-base font-medium text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-sm"
                      placeholder="Enter email to receive code"
                    />
                </div>
              ) : (
                <>
                  <div>
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-3 block ml-1">Verification Code</label>
                    <input
                      type="text"
                      required
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-2xl py-4 px-6 text-xl font-black text-indigo-600 tracking-[0.6em] text-center focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-3 block ml-1">New Security Protocol</label>
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-2xl py-4 px-6 text-base font-medium text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                      placeholder="••••••••"
                    />
                  </div>
                </>
              )}

              <div className="flex gap-4 pt-4">
                <button type="button" onClick={closeForgotModal} className="flex-1 py-4 rounded-2xl text-[11px] font-bold uppercase tracking-widest bg-slate-50 text-slate-500 hover:bg-slate-100 transition-all">Abort</button>
                <button type="submit" disabled={forgotLoading} className="flex-1 py-4 rounded-2xl text-[11px] font-bold uppercase tracking-widest bg-[#0f172a] hover:bg-[#1e293b] text-white shadow-lg shadow-slate-900/10 transition-all disabled:opacity-70">
                  {forgotLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : (forgotStep === 'request' ? 'Request Code' : 'Synchronize')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
