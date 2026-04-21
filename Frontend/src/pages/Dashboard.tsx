import React, { useEffect, useState, useRef } from 'react';
import {
  BookOpen,
  PlayCircle,
  ChevronDown,
  Image as ImageIcon,
  Activity,
  CheckCircle2,
  ChevronRight,
  Users,
  Terminal,
  Zap
} from 'lucide-react';
import { formatYouTubeDuration } from '../utils/format';
import type { DashboardStats } from '../types/index';

import api from '../services/api';

interface Lesson {
  id: string;
  module_id: string;
  module_name: string;
  sub_topic: string;
  activity?: string;
  video_url?: string;
  diagram_url?: string;
  code?: string;
  procedure?: string;
  what_you_get?: string;
  required_material?: string;
  total_hours?: number;
}

interface Module {
  id: string;
  name: string;
  description?: string;
  lessons: Lesson[];
}

const getEmbedUrl = (url: string | undefined) => {
  if (!url) return '';
  let embedUrl = url;
  if (url.includes('youtube.com/watch?v=')) {
    embedUrl = url.replace('watch?v=', 'embed/');
  } else if (url.includes('youtu.be/')) {
    const videoId = url.split('youtu.be/')[1]?.split('?')[0];
    embedUrl = `https://www.youtube.com/embed/${videoId}`;
  }
  
  // Add parameters to remove "More videos" and branding
  const separator = embedUrl.includes('?') ? '&' : '?';
  return `${embedUrl}${separator}rel=0&modestbranding=1&autoplay=0&iv_load_policy=3`;
};

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isCurriculumOpen, setIsCurriculumOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }

    const fetchData = async () => {
      try {
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        const role = currentUser.utype?.toLowerCase();
        const isLearner = role === 'learner' || role === 'student';

        const [modulesRes, lessonsRes] = await Promise.all([
          api.get('/modules'),
          api.get('/lessons')
        ]);

        const sortedLessons = lessonsRes.data.sort((a: any, b: any) => a.serial_number - b.serial_number);

        const grouped = modulesRes.data.map((m: any) => ({
          ...m,
          lessons: sortedLessons.filter((l: any) => l.module_id === m.id)
        }));
        setModules(grouped);

        // No longer auto-selecting lesson on first load to allow for Overview visibility
        // const firstModuleWithLessons = grouped.find((m: any) => m.lessons.length > 0);
        // if (firstModuleWithLessons) {
        //   setSelectedLesson(firstModuleWithLessons.lessons[0]);
        //   setExpandedModules({ [firstModuleWithLessons.id]: true });
        // }

        if (isLearner) {
          const completedRes = await api.get('/lessons/completed');
          setCompletedLessons(completedRes.data);
        } else {
          // Fetch trainer stats
          const statsRes = await api.get('/dashboard/stats');
          console.log('Synchronized platform intel:', statsRes.data);
          setStats(statsRes.data);
        }
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []); 

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsCurriculumOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const flattenedLessons = modules.flatMap(m => m.lessons);

  const handleNextLesson = () => {
    if (!selectedLesson) return;
    const currentIndex = flattenedLessons.findIndex(l => l.id === selectedLesson.id);
    if (currentIndex < flattenedLessons.length - 1) {
      const next = flattenedLessons[currentIndex + 1];
      setSelectedLesson(next);
      setExpandedModules(p => ({ ...p, [next.module_id]: true }));
    }
  };

  const handlePrevLesson = () => {
    if (!selectedLesson) return;
    const currentIndex = flattenedLessons.findIndex(l => l.id === selectedLesson.id);
    if (currentIndex > 0) {
      const prev = flattenedLessons[currentIndex - 1];
      setSelectedLesson(prev);
      setExpandedModules(p => ({ ...p, [prev.module_id]: true }));
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] animate-in fade-in">
      <div className="w-10 h-10 border-2 border-indigo-500/10 border-t-indigo-500 rounded-full animate-spin"></div>
      <p className="mt-4 text-slate-500 text-xs font-bold tracking-widest uppercase text-center">Loading Lessons...</p>
    </div>
  );

  const role = user?.utype?.toLowerCase();
  const isLearner = role === 'learner' || role === 'student';
  const isTrainer = role === 'trainer' || role === 'teacher';

  if (isLearner) {
    return (
      <div className="max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-1000 pb-20 px-4 sm:px-6">
        {/* ... existing learner layout content ... */}
        <section className="ag-hero group !mb-4">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Welcome back, <span className="text-gradient">{(user?.full_name || user?.first_name)?.split(' ')[0] || 'User'}</span>.
              </h1>
            </div>
          </div>
        </section>

        <div className="w-full">
          {/* Zone 3: Interactive Learning Environment (Full-Screen Focus) */}
          <div className="space-y-8">
            {selectedLesson ? (
              <div className="ag-panel border border-slate-900/10 shadow-premium bg-white/40 backdrop-blur-3xl overflow-hidden rounded-[32px]">
                {/* Enhanced Lesson Header with Dropdown Navigation */}
                    <div className="relative z-10 flex items-center justify-between w-full">
                      <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <button 
                              onClick={() => setSelectedLesson(null)}
                              className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all mr-2"
                              title="Back to Overview"
                            >
                               <ChevronDown className="w-5 h-5 rotate-90" />
                            </button>
                            <div className="relative" ref={dropdownRef}>
                           <button 
                             onClick={() => setIsCurriculumOpen(!isCurriculumOpen)}
                             className={`flex items-center gap-3 px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all shadow-sm border ${isCurriculumOpen ? 'bg-indigo-600 text-white border-indigo-600 shadow-indigo-200' : 'bg-indigo-50/50 text-indigo-600 border-indigo-500/20 hover:bg-indigo-600 hover:text-white'}`}
                           >
                              {selectedLesson.module_name.replace(' Curriculum', '')}
                              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${isCurriculumOpen ? 'rotate-180' : ''}`} />
                           </button>

                           {/* Curriculum Dropdown Menu */}
                           {isCurriculumOpen && (
                             <div className="absolute left-0 mt-4 w-80 sm:w-96 bg-white/95 backdrop-blur-2xl rounded-3xl border border-slate-200 shadow-2xl py-4 z-50 animate-in fade-in zoom-in-95 duration-300 max-h-[70vh] overflow-y-auto no-scrollbar">
                                <div className="px-6 pb-3 mb-2 border-b border-slate-100">
                                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Menu</p>
                                   <p className="text-sm font-bold text-slate-900 tracking-tight">Lessons</p>
                                </div>
                                <div className="px-3 space-y-1.5">
                                    {modules.map((module) => (
                                      <div key={module.id} className="space-y-1">
                                        <button
                                          onClick={() => setExpandedModules((p: Record<string, boolean>) => ({ ...p, [module.id]: !p[module.id] }))}
                                          className={`w-full flex items-center justify-between p-3.5 rounded-2xl transition-all ${expandedModules[module.id] ? 'bg-slate-900/5 text-slate-900' : 'text-slate-600 hover:bg-slate-50'}`}
                                        >
                                          <span className="text-xs font-bold tracking-tight">{module.name}</span>
                                          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expandedModules[module.id] ? 'rotate-180' : ''}`} />
                                        </button>
                                        {expandedModules[module.id] && (
                                          <div className="pl-4 pr-1 space-y-1 py-1">
                                            {module.lessons.map(lesson => (
                                              <button
                                                key={lesson.id}
                                                onClick={() => { setSelectedLesson(lesson); setIsCurriculumOpen(false); }}
                                                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${selectedLesson?.id === lesson.id ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}
                                              >
                                                <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${selectedLesson?.id === lesson.id ? 'bg-indigo-500 text-white' : 'bg-slate-100'}`}>
                                                  {completedLessons.includes(lesson.id) ? <CheckCircle2 className="w-3.5 h-3.5" /> : <PlayCircle className="w-3.5 h-3.5" />}
                                                </div>
                                                <span className="text-[12px] font-semibold text-left truncate">{lesson.sub_topic}</span>
                                              </button>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                </div>
                             </div>
                           )}
                        </div>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">{selectedLesson.sub_topic}</h2>
                  </div>

                  <div className="hidden lg:flex items-center gap-6 relative z-10">
                     <div className="flex flex-col items-end">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-2">Duration: {formatYouTubeDuration(selectedLesson.total_hours || 0)}</span>
                        <div className="h-1.5 w-32 bg-slate-100 rounded-full overflow-hidden">
                           <div className="h-full bg-indigo-500 rounded-full transition-all duration-1000" style={{ width: selectedLesson.total_hours ? '100%' : '15%' }}></div>
                        </div>
                     </div>
                  </div>
                </div>

                <div className="p-4 md:p-8">
                  {/* Cinematic Full-Bleed Video Experience */}
                  <div className="aspect-video w-full rounded-[32px] bg-black shadow-[0_40px_80px_-15px_rgba(0,0,0,0.5)] overflow-hidden relative group ring-1 ring-white/10">
                    {selectedLesson.video_url ? (
                      <iframe className="w-full h-full" src={getEmbedUrl(selectedLesson.video_url)} title="NubeEra Course Media" allowFullScreen />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-gradient-to-br from-slate-900 to-black">
                        <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-8 border border-white/5 shadow-2xl">
                           <ImageIcon className="w-10 h-10 opacity-30" />
                        </div>
                         <p className="text-xs font-bold uppercase tracking-[0.4em] opacity-40">Loading Video</p>
                      </div>
                    )}
                  </div>

                  {/* Supplemental Navigation Quick-access */}
                  <div className="mt-10 flex items-center justify-between px-2">
                     <button 
                       onClick={handlePrevLesson}
                       className="flex items-center gap-3 text-slate-400 hover:text-indigo-600 transition-all group"
                     >
                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100 group-hover:bg-indigo-50 group-hover:border-indigo-100 transition-colors">
                           <ChevronDown className="w-5 h-5 rotate-90" />
                        </div>
                         <span className="text-xs font-bold uppercase tracking-widest">Previous Lesson</span>
                     </button>
                     <button 
                       onClick={handleNextLesson}
                       className="flex items-center gap-3 text-slate-800 hover:text-indigo-600 transition-all group text-right"
                     >
                         <span className="text-xs font-bold uppercase tracking-widest font-mono">Next Lesson</span>
                        <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-lg group-hover:bg-indigo-600 transition-colors">
                           <ChevronRight className="w-5 h-5" />
                        </div>
                     </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="animate-in fade-in duration-700 space-y-12">
                {/* Zone 1: Quick Access Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <button 
                    onClick={() => {
                       const first = modules.find(m => m.lessons.length > 0)?.lessons[0];
                       if (first) {
                         setSelectedLesson(first);
                         setExpandedModules({ [first.module_id]: true });
                       }
                    }}
                    className="group bg-white rounded-[40px] p-10 border border-slate-100 shadow-premium hover:shadow-2xl transition-all duration-500 text-left relative overflow-hidden active:scale-[0.98]"
                  >
                    <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
                    <div className="w-16 h-16 rounded-[24px] bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-200 mb-8 group-hover:rotate-6 transition-transform duration-500">
                       <BookOpen className="w-8 h-8" />
                    </div>
                    <h3 className="text-3xl font-black text-slate-900 tracking-tight mb-2">My Curriculum</h3>
                    <p className="text-slate-500 font-medium text-sm leading-relaxed mb-8">Access all enrolled modules and continue your learning trajectory.</p>
                    <div className="flex items-center gap-2 text-indigo-600 font-black text-xs uppercase tracking-widest">
                       Continue Learning <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </button>

                  <a 
                    href="/playground"
                    className="group bg-slate-900 rounded-[40px] p-10 border border-white/5 shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500 text-left relative overflow-hidden active:scale-[0.98]"
                  >
                    <div className="absolute bottom-0 left-0 w-40 h-40 bg-indigo-500/10 rounded-full -ml-20 -mb-20 blur-3xl"></div>
                    <div className="w-16 h-16 rounded-[24px] bg-white text-slate-900 flex items-center justify-center shadow-lg mb-8 group-hover:-rotate-6 transition-transform duration-500">
                       <Terminal className="w-8 h-8" />
                    </div>
                    <h3 className="text-3xl font-black text-white tracking-tight mb-2">Lab Playground</h3>
                    <p className="text-slate-400 font-medium text-sm leading-relaxed mb-8">Launch your personal cloud-based sandbox for hands-on experimentation.</p>
                    <div className="flex items-center gap-2 text-indigo-400 font-black text-xs uppercase tracking-widest">
                       Launch Environment <Zap className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </a>
                </div>

                {/* Zone 2: All Videos / Curriculum Grid */}
                <div className="space-y-8">
                  <div className="flex items-center justify-between px-2">
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">Full Curriculum</h3>
                    <div className="px-4 py-1.5 bg-slate-100 rounded-full text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                       {flattenedLessons.length} Modules Available
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {modules.map((m) => (
                      <div key={m.id} className="ag-panel !p-6 bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                         <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mb-3 opacity-60">Module Node</p>
                         <h4 className="text-lg font-black text-slate-900 tracking-tight mb-4 group-hover:text-indigo-600 transition-colors uppercase">{m.name}</h4>
                         <div className="space-y-1.5">
                            {m.lessons.slice(0, 3).map(l => (
                              <button 
                                key={l.id} 
                                onClick={() => { setSelectedLesson(l); setExpandedModules(p => ({ ...p, [m.id]: true })); }}
                                className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-all text-left group/item"
                              >
                                 <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 group-hover/item:bg-indigo-500 group-hover/item:text-white transition-all">
                                    <PlayCircle className="w-4 h-4" />
                                 </div>
                                 <span className="text-[11px] font-bold text-slate-600 group-hover/item:text-slate-900 truncate">{l.sub_topic}</span>
                              </button>
                            ))}
                            {m.lessons.length > 3 && (
                              <button 
                                onClick={() => {
                                   if (m.lessons.length > 0) setSelectedLesson(m.lessons[0]);
                                   setExpandedModules(p => ({ ...p, [m.id]: true }));
                                }}
                                className="w-full mt-2 text-center py-2 text-[9px] font-black text-slate-400 uppercase tracking-widest hover:text-indigo-600 transition-colors"
                              >
                                + View {m.lessons.length - 3} more lessons
                              </button>
                            )}
                         </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (isTrainer) {
    const primaryMetrics = [
      { label: 'Active Learners', value: stats?.total_active_learners ?? 0, icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-500/10', trend: 'Live', desc: 'Currently engaged students', link: '/trainer/learner-list' },
      { label: 'Chapters Done', value: stats?.total_lesson_completions ?? 0, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-500/10', trend: 'Completed', desc: 'Total lesson completions', link: '/staff/lessons/' },
      { label: 'Curriculum', value: stats?.total_modules ?? 0, icon: BookOpen, color: 'text-purple-600', bg: 'bg-purple-500/10', trend: 'Stable', desc: `Across ${stats?.total_lessons ?? 0} lessons`, link: '/staff/lessons/' },
      { label: 'Support Nodes', value: stats?.total_trainers ?? 0, icon: Zap, color: 'text-amber-600', bg: 'bg-amber-500/10', trend: 'Active', desc: 'Peer instructors', link: '#' },
    ];

    return (
      <div className="max-w-[1400px] mx-auto space-y-12 animate-in fade-in duration-1000 pb-20">
        
        {/* Zone 1: Welcome & Intelligence Overview */}
        <section className="ag-hero !mb-0 group !bg-white !shadow-premium !border-slate-50">
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-12">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50 border border-indigo-100 rounded-full shadow-sm">
                 <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                 <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-[0.2em] leading-none">Instructor Node Active</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight leading-tight">
                Welcome, <span className="text-indigo-600">{user?.first_name || 'Trainer'}</span>.
              </h1>
              <p className="text-slate-500 font-medium max-w-2xl text-lg leading-relaxed italic">
                The platform is optimized for knowledge delivery. You have <span className="text-indigo-600 font-bold">{stats?.total_active_learners ?? 0} active learners</span> across <span className="text-slate-900 font-bold">{stats?.total_modules ?? 0} modules</span>.
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <a href="/trainer/learner-list" className="ag-btn ag-btn-primary !px-12 !py-4.5 text-sm !rounded-2xl shadow-xl shadow-indigo-500/20 active:scale-95 transition-all font-black uppercase tracking-widest">
                   Manage Learners
                </a>
                <a href="/playground" className="ag-btn ag-btn-secondary !px-12 !py-4.5 text-sm !rounded-2xl !bg-white !border-slate-200 hover:!bg-slate-50 transition-all font-black uppercase tracking-widest text-slate-700">
                   Lab Playground
                </a>
              </div>
            </div>
            
            <div className="lg:w-96 space-y-4">
               <div className="p-10 rounded-[40px] bg-indigo-50/30 border border-indigo-100 backdrop-blur-xl group-hover:border-indigo-500/30 transition-all shadow-inner relative overflow-hidden">
                  <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl"></div>
                  <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mb-4">Content Coverage</p>
                  <div className="flex items-end gap-3">
                     <h3 className="text-5xl font-black text-slate-900 leading-none tracking-tighter">{stats?.total_lessons ?? 0}</h3>
                     <span className="text-xs font-bold text-indigo-600 mb-2">Lessons</span>
                  </div>
                  <div className="mt-8 h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                     <div className="h-full w-4/5 bg-indigo-500 rounded-full shadow-[0_0_12px_rgba(99,102,241,0.5)]"></div>
                  </div>
                  <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-4 opacity-60 italic">Live curriculum delivery active</p>
               </div>
            </div>
          </div>
        </section>

        {/* Zone 2: Performance Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
          {primaryMetrics.map((stat, i) => (
            <a key={i} href={stat.link} className="bg-white rounded-[32px] border border-slate-100 p-8 shadow-sm hover:shadow-premium transition-all duration-500 group border-l-4 hover:border-l-indigo-500 block">
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
            </a>
          ))}
        </div>

        {/* Zone 3: Interactive Module Preview */}
        <div className="ag-panel p-10 bg-slate-900 border-indigo-500/20 relative overflow-hidden group">
           <div className="absolute -top-24 -right-24 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-colors"></div>
           <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
              <div className="space-y-4 text-center md:text-left">
                 <h3 className="text-2xl font-bold text-white tracking-tight">Interactive Playground</h3>
                 <p className="text-indigo-200/60 font-medium max-w-md leading-relaxed">Access the cloud-based terminal environment for hands-on practice and demonstration.</p>
                 <a href="/playground" className="ag-btn ag-btn-primary !bg-white !text-indigo-900 !font-bold mt-2 hover:!bg-slate-100 shadow-xl shadow-slate-900/5">
                    Launch Lab Ready
                 </a>
              </div>
              <Terminal className="w-40 h-40 text-white/5 absolute -right-4 -bottom-4 rotate-12 transition-transform group-hover:scale-110 duration-700" />
           </div>
        </div>
      </div>
    );
  }

  // Fallback for non-learners/trainers accessing this view correctly or while data loads
  return (
    <div className="ag-panel p-24 text-center flex flex-col items-center justify-center bg-white/50 backdrop-blur-xl border border-slate-900/5 min-h-[60vh] rounded-[40px]">
       <Activity className="w-16 h-16 text-indigo-500 animate-pulse mb-8" />
       <h2 className="text-2xl font-black text-slate-900 tracking-tight italic uppercase">Loading System</h2>
       <p className="text-slate-500 mt-4 font-medium max-w-xs mx-auto">Please wait while the platform prepares your dashboard.</p>
    </div>
  );
};

export default Dashboard;
