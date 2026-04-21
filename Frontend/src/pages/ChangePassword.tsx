import React, { useState } from 'react';
import { Shield, Lock, Eye, EyeOff, Save, Key } from 'lucide-react';
import api from '../services/api';
import { toast } from 'sonner';

const ChangePassword: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [formData, setFormData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.new_password !== formData.confirm_password) {
      toast.error('Passwords do not match.');
      return;
    }

    if (formData.new_password.length < 6) {
      toast.error('Password too short (min 6 characters).');
      return;
    }

    setLoading(true);
    try {
      await api.put('/auth/change-password', {
        current_password: formData.current_password,
        new_password: formData.new_password
      });
      toast.success('Password updated successfully');
      setFormData({
        current_password: '',
        new_password: '',
        confirm_password: ''
      });
    } catch (error: any) {
      toast.error('Update failed: ' + (error.response?.data?.message || 'Access denied'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-10 animate-in fade-in duration-1000 pb-16">
      
      <div className="bg-white rounded-[40px] shadow-premium border border-slate-100 overflow-hidden relative group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[120px] rounded-full -mr-20 -mt-20"></div>
        
        <div className="p-10 border-b border-slate-50 flex items-center justify-between bg-slate-50/30 relative z-10">
           <div className="flex items-center gap-6">
              <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-indigo-500 shadow-sm">
                 <Lock className="w-7 h-7" />
              </div>
              <div>
                 <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Change Password</h2>
                 <p className="text-sm text-slate-500 font-medium">Update your account security credentials.</p>
              </div>
           </div>
        </div>

        <form onSubmit={handleSubmit} className="p-12 space-y-10 relative z-10">
           {/* Current Password Node */}
           <div className="space-y-4">
              <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest ml-1 block">Current Password</label>
              <div className="relative group">
                 <Lock className="w-4 h-4 absolute left-5 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-indigo-500 transition-colors" />
                 <input
                   type={showCurrent ? "text" : "password"}
                   required
                   value={formData.current_password}
                   onChange={e => setFormData({ ...formData, current_password: e.target.value })}
                   className="w-full pl-14 pr-14 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-700 outline-none focus:border-indigo-500 focus:bg-white transition-all font-bold text-sm shadow-inner"
                   placeholder="Enter current password"
                 />
                 <button
                   type="button"
                   onClick={() => setShowCurrent(!showCurrent)}
                   className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-700 hover:text-indigo-600 transition-colors p-1"
                 >
                   {showCurrent ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                 </button>
              </div>
           </div>

           {/* New Credentials Surface */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-4">
                 <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest ml-1 block">New Password</label>
                 <div className="relative group">
                    <Key className="w-4 h-4 absolute left-5 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-emerald-500 transition-colors" />
                    <input
                      type={showNew ? "text" : "password"}
                      required
                      value={formData.new_password}
                      onChange={e => setFormData({ ...formData, new_password: e.target.value })}
                      className="w-full pl-14 pr-14 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-700 outline-none focus:border-emerald-500 focus:bg-white transition-all font-bold text-sm shadow-inner"
                      placeholder="Enter new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew(!showNew)}
                      className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-700 hover:text-emerald-600 transition-colors p-1"
                    >
                      {showNew ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                 </div>
              </div>

              <div className="space-y-4">
                 <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest ml-1 block">Confirm New Password</label>
                 <div className="relative group">
                    <Shield className="w-4 h-4 absolute left-5 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-indigo-500 transition-colors" />
                    <input
                      type={showConfirm ? "text" : "password"}
                      required
                      value={formData.confirm_password}
                      onChange={e => setFormData({ ...formData, confirm_password: e.target.value })}
                      className="w-full pl-14 pr-14 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-700 outline-none focus:border-indigo-500 focus:bg-white transition-all font-bold text-sm shadow-inner"
                      placeholder="Confirm new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-700 hover:text-indigo-600 transition-colors p-1"
                    >
                      {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                 </div>
              </div>
           </div>

           {/* Actions */}
           <div className="pt-10 border-t border-slate-50 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="ag-btn ag-btn-primary !rounded-2xl px-10 py-4 w-full md:w-auto shadow-lg active:scale-95 transition-all text-sm font-black uppercase tracking-widest"
              >
                {loading ? (
                   <div className="w-6 h-6 border-3 border-slate-900/30 border-t-white rounded-full animate-spin" />
                ) : (
                   <>
                     <Save className="w-5 h-5" />
                     <span>Update Password</span>
                   </>
                )}
              </button>
           </div>
        </form>
      </div>


    </div>
  );
};

export default ChangePassword;
