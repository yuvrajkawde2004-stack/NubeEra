import React, { useEffect, useState } from 'react';
import { 
  Users, 
  BookOpen, 
  BookText, 
  Shield, 
  Zap, 
  Layers, 
  Plus,
  ArrowUpRight,
  ShieldCheck,
  Settings,
  CircleCheck
} from 'lucide-react';
import api from '../services/api';

interface DashboardStats {
  total_students: number;
  total_teachers: number;
  total_modules: number;
  total_lessons: number;
  total_exams: number;
  total_results: number;
  total_schools: number;
  total_grades: number;
  total_teachers_pending: number;
  total_students_pending: number;
}

const StaffDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get('/dashboard/stats');
      setStats(res.data);
    } catch (error) {
       console.error('Core synchronicity failure:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] animate-in fade-in">
        <div className="w-10 h-10 border-2 border-indigo-500/10 border-t-indigo-500 rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-500 text-xs font-semibold tracking-widest uppercase">Syncing Platform Intel...</p>
      </div>
    );
  }

  const primaryMetrics = [
    { label: 'Active Learners', value: stats?.total_students ?? 0, icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-500/10', trend: '+12%', desc: 'Enrolled in active paths' },
    { label: 'Curriculum Items', value: stats?.total_modules ?? 0, icon: BookOpen, color: 'text-purple-600', bg: 'bg-purple-500/10', trend: 'Stable', desc: 'Published knowledge tracks' },
    { label: 'Completion Rate', value: '84%', icon: CircleCheck, color: 'text-emerald-600', bg: 'bg-emerald-500/10', trend: '+5%', desc: 'Average progress across all' },
    { label: 'Platform Experts', value: stats?.total_teachers ?? 0, icon: Shield, color: 'text-amber-600', bg: 'bg-amber-500/10', trend: '+2', desc: 'Validated instructors' },
  ];

  return (
    <div className="max-w-[1400px] mx-auto space-y-12 animate-in fade-in duration-1000 pb-20">
      
      {/* Zone 1: Executive Intelligence Hero */}
      <section className="ag-hero !mb-0 group !bg-white !shadow-premium !border-slate-50">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-12">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50 border border-indigo-100 rounded-full shadow-sm">
               <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
               <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-[0.2em] leading-none">System Operational</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight leading-tight">
              Executive <span className="text-indigo-600">Intelligence</span>.
            </h1>
            <p className="text-slate-500 font-medium max-w-2xl text-lg leading-relaxed italic">
              Platform performance is currently optimized at <span className="text-slate-900 font-bold">99.8% capacity</span>. You have <span className="text-indigo-600 font-bold">{ (stats?.total_teachers_pending ?? 0) + (stats?.total_students_pending ?? 0) } pending requests</span> awaiting your review.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <button className="ag-btn ag-btn-primary !px-12 !py-4.5 text-sm !rounded-2xl shadow-xl shadow-indigo-500/20 active:scale-95 transition-all font-black uppercase tracking-widest">
                 Explore Reports
              </button>
              <button className="ag-btn ag-btn-secondary !px-12 !py-4.5 text-sm !rounded-2xl !bg-white !border-slate-200 hover:!bg-slate-50 transition-all font-black uppercase tracking-widest text-slate-700">
                 Platform Settings
              </button>
            </div>
          </div>
          
          <div className="lg:w-96 space-y-4">
             <div className="p-10 rounded-[40px] bg-indigo-50/30 border border-indigo-100 backdrop-blur-xl group-hover:border-indigo-500/30 transition-all shadow-inner">
                <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mb-4">Live Throughput</p>
                <div className="flex items-end gap-3">
                   <h3 className="text-5xl font-black text-slate-900 leading-none tracking-tighter">2.4k</h3>
                   <span className="text-xs font-bold text-emerald-600 mb-2 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100">↑ 14%</span>
                </div>
                <div className="mt-8 h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                   <div className="h-full w-2/3 bg-indigo-500 rounded-full shadow-[0_0_12px_rgba(99,102,241,0.5)]"></div>
                </div>
                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-4 opacity-60">Synchronous data protocols active</p>
             </div>
          </div>
        </div>
      </section>

      {/* Zone 2: Performance Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
        {primaryMetrics.map((stat, i) => (
          <div key={i} className="bg-white rounded-[32px] border border-slate-100 p-8 shadow-sm hover:shadow-premium transition-all duration-500 group border-l-4 hover:border-l-indigo-500">
            <div className="flex items-start justify-between">
               <div className={`w-14 h-14 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center shadow-lg group-hover:rotate-6 transition-all duration-500`}>
                  <stat.icon className="w-7 h-7" />
               </div>
               <div className="text-right">
                  <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100 uppercase tracking-widest">{stat.trend}</span>
               </div>
            </div>
            <div className="mt-8">
               <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-2">{stat.label}</p>
               <h3 className="text-4xl font-black text-slate-900 tracking-tighter">{stat.value}</h3>
               <p className="text-[10px] text-slate-500 font-bold mt-4 uppercase tracking-widest opacity-60 flex items-center gap-2">
                 <div className="w-1 h-1 rounded-full bg-slate-300"></div> {stat.desc}
               </p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Zone 3: Operational Matrix */}
        <div className="lg:col-span-8 space-y-8">
           <div className="bg-white rounded-[40px] border border-slate-100 shadow-premium overflow-hidden">
              <div className="p-10 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                 <div>
                    <h2 className="text-xl font-black text-slate-900 tracking-tight">Today's Workspace</h2>
                    <p className="text-xs text-slate-500 font-bold mt-1 uppercase tracking-widest opacity-60">Core platform governance tools</p>
                 </div>
                 <div className="w-10 h-10 flex items-center justify-center rounded-2xl bg-white border border-slate-200 text-slate-600 shadow-sm">
                    <Settings className="w-5 h-5" />
                 </div>
              </div>
               <div className="p-10 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-8">
                 {[
                   { label: 'Course Architecture', desc: 'Structure', icon: Layers, href: '/staff/modules/', color: 'indigo' },
                   { label: 'Access Control', desc: 'Permissions', icon: ShieldCheck, href: '/users', color: 'purple' },
                   { label: 'Lesson Registry', desc: 'Materials', icon: BookText, href: '/staff/lessons/', color: 'emerald' },
                   { label: 'Add Trainer', desc: 'Invite Expert', icon: Plus, href: '/create-staff', color: 'indigo' },
                   { label: 'Enroll Learner', desc: 'New Admission', icon: Users, href: '/add-learner', color: 'purple' },
                   { label: 'Media Nodes', desc: 'Video Upload', icon: Zap, href: '/upload-video', color: 'emerald' },
                   { label: 'Settings', desc: 'Config', icon: Settings, href: '/settings', color: 'slate' },
                 ].map((op, i) => (
                   <a key={i} href={op.href} className="flex flex-col items-center text-center gap-5 p-8 rounded-[32px] border border-slate-50 bg-slate-50/30 hover:bg-indigo-50/50 hover:border-indigo-100 transition-all group relative">
                      <div className={`w-16 h-16 rounded-3xl bg-white border border-slate-100 shadow-sm flex items-center justify-center transition-all group-hover:scale-110 group-hover:shadow-lg group-hover:text-indigo-600 text-slate-600`}>
                         <op.icon className="w-7 h-7" />
                      </div>
                      <div>
                         <h4 className="text-xs font-black text-slate-900 leading-snug tracking-tight mb-1">{op.label}</h4>
                         <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest opacity-60">{op.desc}</p>
                      </div>
                      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all translate-x-1 group-hover:translate-x-0">
                         <ArrowUpRight className="w-4 h-4 text-indigo-400" />
                      </div>
                   </a>
                 ))}
              </div>
           </div>

           <div className="ag-panel p-10 bg-gradient-to-br from-indigo-900/40 to-slate-900 border-indigo-500/20 relative overflow-hidden group">
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl group-hover:bg-indigo-500/30 transition-colors"></div>
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
                 <div className="space-y-4 text-center md:text-left">
                    <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Expand the Expert Circle</h3>
                    <p className="text-slate-600 font-medium max-w-md leading-relaxed">Grow your educational impact by inviting elite instructors to the Antigravity ecosystem.</p>
                    <button className="ag-btn ag-btn-primary !bg-white !text-indigo-900 !font-bold mt-2 hover:!bg-slate-100 shadow-xl shadow-slate-900/5">
                       Invite Trainer
                    </button>
                 </div>
                 <ShieldCheck className="w-32 h-32 text-slate-900/5 absolute -right-4 -bottom-4 rotate-12 transition-transform group-hover:scale-110 duration-700" />
              </div>
           </div>
        </div>

        {/* Zone 4: Review Center */}
        <div className="lg:col-span-4 space-y-8">
           <div className="ag-panel border-slate-900/5 bg-white/[0.01]">
              <div className="p-6 border-b border-slate-900/5 bg-white/[0.01]">
                 <h2 className="text-xs font-bold text-indigo-600 uppercase tracking-widest flex items-center gap-2.5">
                   <Zap className="w-4 h-4" /> Priority Reviews
                 </h2>
              </div>
              <div className="p-6 space-y-4">
                 <div className="p-5 rounded-2xl bg-white/[0.02] border border-slate-900/5 flex items-center justify-between hover:bg-white/[0.04] transition-colors group">
                    <div>
                       <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Trainers</p>
                       <p className="text-2xl font-bold text-slate-900">{stats?.total_teachers_pending ?? 0}</p>
                    </div>
                    <a href="/pending-teachers" className="ag-btn ag-btn-ghost !px-4 !py-2 text-[10px] font-bold uppercase tracking-widest group-hover:bg-indigo-500 group-hover:text-slate-900 transition-all">Review Hub</a>
                 </div>
                 <div className="p-5 rounded-2xl bg-white/[0.02] border border-slate-900/5 flex items-center justify-between hover:bg-white/[0.04] transition-colors group">
                    <div>
                       <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Learners</p>
                       <p className="text-2xl font-bold text-slate-900">{stats?.total_students_pending ?? 0}</p>
                    </div>
                    <a href="/pending-students" className="ag-btn ag-btn-ghost !px-4 !py-2 text-[10px] font-bold uppercase tracking-widest group-hover:bg-indigo-500 group-hover:text-slate-900 transition-all">Review Hub</a>
                 </div>
              </div>
           </div>

           <div className="ag-panel p-8 border-l-4 border-l-indigo-500 bg-white/[0.01]">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2.5">
                 <CircleCheck className="w-4 h-4 text-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.4)]" /> Ecosystem Health
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed font-medium">
                 All platform nodes are operational. Knowledge delivery is at <span className="text-slate-900 font-bold">99.9% precision</span>.
              </p>
              <div className="mt-6 flex items-center gap-3">
                 <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-pulse"></div>
                 <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-widest leading-none">Optimal Status</span>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;
