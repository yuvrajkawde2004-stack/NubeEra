import React, { useState } from 'react';
import { Eye, EyeOff, Loader2, AlertCircle, X, Github, Linkedin } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { useEffect } from 'react';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    const externalError = searchParams.get('error');

    if (externalError) {
      setError(externalError);
    }

    if (token) {
      handleExternalLogin(token);
    }
  }, [searchParams]);

  const handleExternalLogin = async (token: string) => {
    setLoading(true);
    try {
      localStorage.setItem('token', token);
      const response = await api.get('/auth/me');
      const user = response.data;
      localStorage.setItem('user', JSON.stringify(user));

      const roleLower = user.utype?.toLowerCase() || '';
      let redirectPath = '/learner/dashboard';
      
      if (['staff', 'admin', 'superadmin'].includes(roleLower)) redirectPath = '/staff/dashboard';
      else if (['trainer', 'teacher'].includes(roleLower)) redirectPath = '/trainer/dashboard';
      else redirectPath = '/learner/dashboard';

      window.location.href = redirectPath;
    } catch (err: any) {
      setError('OAuth synchronization failed. Please try again.');
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const triggerSocialLogin = (provider: string) => {
    const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    // Remove /api from local dev url if it exists to hit the base redirect
    const baseUrl = backendUrl.replace('/api', '');
    window.location.href = `${baseUrl}/api/auth/external/login/${provider}`;
  };

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

            {/* Social Login Section */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-100"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-slate-400 font-medium">Or continue with</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <button
                type="button"
                disabled={loading}
                onClick={() => triggerSocialLogin('Google')}
                className="flex items-center justify-center py-3 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-[0.98] disabled:opacity-50"
                title="Sign in with Google"
              >
                <svg className="w-5 h-5 text-[#4285F4]" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26.81-.58z" />
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={() => triggerSocialLogin('GitHub')}
                className="flex items-center justify-center py-3 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-[0.98] disabled:opacity-50"
                title="Sign in with GitHub"
              >
                <Github className="w-5 h-5 text-[#181717]" />
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={() => triggerSocialLogin('LinkedIn')}
                className="flex items-center justify-center py-3 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-[0.98] disabled:opacity-50"
                title="Sign in with LinkedIn"
              >
                <Linkedin className="w-5 h-5 text-[#0A66C2]" />
              </button>
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
