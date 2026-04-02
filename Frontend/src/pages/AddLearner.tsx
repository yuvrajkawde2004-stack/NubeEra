import React, { useState } from 'react';
import { toast } from 'sonner';
import api from '../services/api';
import { Mail, ArrowRight, Lock, UserPlus, Info, Shield, BookOpen } from 'lucide-react';

const AddLearner: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/users', {
        email: formData.email,
        password: formData.password,
        role: 'Learner',
        first_name: formData.firstName || 'New',
        last_name: formData.lastName || 'Learner'
      });
      toast.success('Learner enrollment completed');
      setFormData({ email: '', password: '', firstName: '', lastName: '' });
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Enrollment protocol failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in duration-1000 pb-16">
      
      <div className="bg-white rounded-[40px] shadow-premium border border-slate-100 overflow-hidden relative group mt-10">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[120px] rounded-full -mr-20 -mt-20"></div>
        
        <form onSubmit={handleSubmit} className="relative z-10 flex flex-col">
          <div className="p-10 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
             <div className="flex items-center gap-6">
                <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-indigo-500 shadow-sm">
                   <UserPlus className="w-8 h-8" />
                </div>
                <div>
                   <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Enroll New Learner</h2>
                   <p className="text-sm text-slate-500 font-medium">Provision access credentials for a student node.</p>
                </div>
             </div>
          </div>

          <div className="p-12 space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-4">
                  <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest ml-1 block">First Name</label>
                  <div className="relative group">
                    <input
                      type="text"
                      required
                      value={formData.firstName}
                      onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                      placeholder="e.g. John"
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none text-slate-900 text-sm font-bold focus:border-indigo-500 focus:bg-white transition-all shadow-inner placeholder:text-slate-400"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest ml-1 block">Last Name</label>
                  <div className="relative group">
                    <input
                      type="text"
                      required
                      value={formData.lastName}
                      onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                      placeholder="e.g. Doe"
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none text-slate-900 text-sm font-bold focus:border-indigo-500 focus:bg-white transition-all shadow-inner placeholder:text-slate-400"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest ml-1 block">Learner Mail Registry</label>
                  <div className="relative group">
                    <Mail className="w-4 h-4 absolute left-5 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-indigo-500 transition-colors" />
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      placeholder="Enter authorized email"
                      className="w-full pl-14 pr-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none text-slate-900 text-sm font-bold focus:border-indigo-500 focus:bg-white transition-all shadow-inner placeholder:text-slate-400"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest ml-1 block">Primary Encryption Key</label>
                  <div className="relative group">
                    <Lock className="w-4 h-4 absolute left-5 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-indigo-500 transition-colors" />
                    <input
                      type="password"
                      required
                      value={formData.password}
                      onChange={e => setFormData({ ...formData, password: e.target.value })}
                      placeholder="••••••••••••"
                      className="w-full pl-14 pr-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none text-slate-900 text-sm font-bold focus:border-indigo-500 focus:bg-white transition-all shadow-inner placeholder:text-slate-400"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-10 border-t border-slate-50 flex items-center justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="ag-btn ag-btn-primary !rounded-2xl px-12 py-4 w-full sm:w-auto flex items-center justify-center gap-4 group shadow-lg active:scale-95 transition-all text-sm font-black uppercase tracking-widest"
                >
                  {loading ? (
                    <div className="w-6 h-6 border-3 border-slate-900/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Provision Learner Node</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
                    </>
                  )}
                </button>
              </div>
          </div>
        </form>
      </div>

      {/* Verification Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100 flex flex-col gap-4 hover:border-indigo-100 hover:shadow-md transition-all">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-500">
               <BookOpen className="w-5 h-5" />
            </div>
            <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest leading-none">Curriculum Access</h4>
            <p className="text-[11px] text-slate-500 font-bold leading-relaxed">Learners will have immediate access to all globally published curriculum tracks.</p>
         </div>
         <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100 flex flex-col gap-4 hover:border-emerald-100 hover:shadow-md transition-all">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-500">
               <Shield className="w-5 h-5" />
            </div>
            <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest leading-none">Restricted Privileges</h4>
            <p className="text-[11px] text-slate-500 font-bold leading-relaxed">Accounts are sandboxed. They cannot modify platform architecture or parameters.</p>
         </div>
         <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100 flex flex-col gap-4 hover:border-amber-100 hover:shadow-md transition-all">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-500">
               <Info className="w-5 h-5" />
            </div>
            <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest leading-none">Security Protocol</h4>
            <p className="text-[11px] text-slate-500 font-bold leading-relaxed">Ensure initial passwords are communicated securely to new learners.</p>
         </div>
      </div>
    </div>
  );
};

export default AddLearner;
