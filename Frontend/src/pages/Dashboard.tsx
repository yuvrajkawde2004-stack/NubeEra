import React, { useEffect, useState } from 'react';
import {
  BookOpen,
  PlayCircle,
  ChevronDown,
  Image as ImageIcon,
  Activity,
  CheckCircle2
} from 'lucide-react';

// Removed unused import

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
  if (url.includes('youtube.com/watch?v=')) {
    return url.replace('watch?v=', 'embed/');
  }
  if (url.includes('youtu.be/')) {
    const videoId = url.split('youtu.be/')[1]?.split('?')[0];
    return `https://www.youtube.com/embed/${videoId}`;
  }
  return url;
};

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);

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

        const grouped = modulesRes.data.map((m: any) => ({
          ...m,
          lessons: lessonsRes.data.filter((l: any) => l.module_id === m.id)
        }));
        setModules(grouped);

        if (grouped.length > 0 && grouped[0].lessons.length > 0) {
          setSelectedLesson(grouped[0].lessons[0]);
          setExpandedModules({ [grouped[0].id]: true });
        }

        if (isLearner) {
          const completedRes = await api.get('/lessons/completed');
          setCompletedLessons(completedRes.data);
        }
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []); 

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] animate-in fade-in">
      <div className="w-10 h-10 border-2 border-indigo-500/10 border-t-indigo-500 rounded-full animate-spin"></div>
      <p className="mt-4 text-slate-500 text-xs font-bold tracking-widest uppercase text-center">Mobilizing Knowledge Base...</p>
    </div>
  );

  const role = user?.utype?.toLowerCase();
  const isLearner = role === 'learner' || role === 'student';

  if (isLearner) {
    return (
      <div className="max-w-[1400px] mx-auto space-y-10 animate-in fade-in duration-1000 pb-20">
        
        {/* Zone 1: Welcome Hero */}
        <section className="ag-hero group">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full">
                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest leading-none">Learning Portal</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Welcome back, <span className="text-gradient">{user?.name?.split(' ')[0] || 'Explorer'}</span>.
              </h1>
            </div>
            
            <div className="hidden lg:block relative">
               <div className="w-64 h-64 bg-gradient-to-br from-indigo-500/20 to-violet-500/10 rounded-3xl rotate-12 absolute -top-8 -right-8 blur-2xl animate-pulse"></div>
               <div className="w-48 h-48 bg-slate-900/5 backdrop-blur-3xl border border-slate-900/10 rounded-3xl relative z-20 flex items-center justify-center rotate-3 group-hover:rotate-0 transition-transform duration-700">
                  <BookOpen className="w-20 h-20 text-indigo-600" />
               </div>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Zone 2: Curriculum Exploration (Sidebar-esque) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="flex items-center justify-between px-2">
               <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Your Curriculum</h3>
               <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">{modules.length} Tracks</span>
            </div>
            
            <div className="space-y-3">
              {modules.map((module) => (
                <div key={module.id} className="ag-panel ag-panel-hover border-slate-900/5 bg-white/[0.02]">
                  <button
                    onClick={() => setExpandedModules((p: Record<string, boolean>) => ({ ...p, [module.id]: !p[module.id] }))}
                    className="w-full p-5 flex items-center justify-between transition-colors"
                  >
                    <div className="text-left">
                      <span className="text-base font-bold text-slate-800 tracking-tight">{module.name}</span>
                      <p className="text-[11px] text-slate-500 font-semibold mt-1 uppercase tracking-wider">{module.lessons.length} Learning Blocks</p>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform duration-300 ${expandedModules[module.id] ? 'rotate-180' : ''}`} />
                  </button>
                  {expandedModules[module.id] && (
                    <div className="px-3 pb-4 space-y-1.5 animate-in slide-in-from-top-2 duration-300">
                      {module.lessons.map(lesson => (
                        <button
                          key={lesson.id}
                          onClick={() => setSelectedLesson(lesson)}
                          className={`w-full flex items-center gap-3.5 p-3.5 rounded-xl transition-all ${selectedLesson?.id === lesson.id ? 'bg-indigo-500/10 text-indigo-600 border border-indigo-500/20' : 'text-slate-600 hover:text-slate-800 hover:bg-white/[0.03] border border-transparent'}`}
                        >
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${selectedLesson?.id === lesson.id ? 'bg-indigo-500/20 text-indigo-600 shadow-[0_0_12px_rgba(99,102,241,0.2)]' : 'bg-slate-900/5 text-slate-500'}`}>
                             {completedLessons.includes(lesson.id) ? <CheckCircle2 className="w-4 h-4" /> : <PlayCircle className="w-4 h-4" />}
                          </div>
                          <span className="text-[13px] font-semibold text-left truncate">{lesson.sub_topic}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Zone 3: Interactive Learning Environment */}
          <div className="lg:col-span-8 space-y-8">
            {selectedLesson ? (
              <div className="ag-panel border-slate-900/10 shadow-2xl bg-white/[0.01]">
                <div className="p-8 md:p-10 border-b border-slate-900/5 flex flex-col md:flex-row md:items-center justify-between gap-8 relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                   <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-3">
                       <span className="px-2.5 py-1 bg-slate-900/5 text-indigo-600 border border-slate-900/10 rounded-md text-[10px] font-bold uppercase tracking-widest">{selectedLesson.module_name}</span>
                    </div>
                    <h2 className="text-3xl font-bold text-slate-900 tracking-tight">{selectedLesson.sub_topic}</h2>
                  </div>
                  <div className="hidden"></div>
                </div>

                <div className="p-8 md:p-10 space-y-10">
                  {/* Cinematic Video Player */}
                  <div className="aspect-video rounded-3xl bg-black border border-slate-900/5 overflow-hidden shadow-2xl relative group ring-1 ring-white/10">
                    {selectedLesson.video_url ? (
                      <iframe className="w-full h-full" src={getEmbedUrl(selectedLesson.video_url)} title="Lesson Media" allowFullScreen />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 bg-gradient-to-br from-slate-900 to-black">
                        <div className="w-20 h-20 bg-slate-900/5 rounded-full flex items-center justify-center mb-6">
                           <ImageIcon className="w-10 h-10 opacity-20" />
                        </div>
                        <p className="text-xs font-bold uppercase tracking-widest opacity-50">Visual Content Awaiting Sync</p>
                      </div>
                    )}
                  </div>

                  {/* Resource intelligence tabs unmounted per configuration */}
                </div>
              </div>
            ) : (
              <div className="ag-panel h-[700px] flex flex-col items-center justify-center text-center p-12 bg-white/[0.01] border border-slate-900/5 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full -mr-48 -mt-48 blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-violet-500/5 rounded-full -ml-48 -mb-48 blur-3xl"></div>
                
                <div className="w-24 h-24 bg-gradient-to-br from-indigo-500/20 to-violet-500/10 rounded-[32px] flex items-center justify-center mb-10 shadow-lg shadow-indigo-500/10 border border-slate-900/10 rotate-3">
                   <BookOpen className="w-12 h-12 text-indigo-600" />
                </div>
                <h3 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-4">Start Your Session</h3>
                <p className="text-slate-600 font-medium max-w-sm text-lg leading-relaxed">Select a curriculum path from the navigator to begin your learning experience.</p>
                
                <div className="mt-12 p-8 bg-slate-900/5 rounded-[40px] border border-slate-900/5 backdrop-blur-md max-w-md w-full">
                   <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mb-6">Featured Paths</p>
                   <div className="grid grid-cols-1 gap-3">
                      {modules.slice(0, 3).map((m: Module) => (
                        <button 
                          key={m.id} 
                          onClick={() => {
                            setExpandedModules((p: Record<string, boolean>) => ({ ...p, [m.id]: true }));
                            if (m.lessons.length > 0) setSelectedLesson(m.lessons[0]);
                          }} 
                          className="w-full px-5 py-4 bg-slate-900/5 border border-slate-900/5 rounded-2xl text-[12px] font-bold text-slate-800 hover:border-indigo-500/40 hover:bg-indigo-500/5 transition-all uppercase tracking-wide flex items-center justify-between group"
                        >
                          {m.name}
                          <PlayCircle className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
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


  // Fallback for non-learners accessing this view correctly or while data loads
  return (
    <div className="ag-panel p-20 text-center flex flex-col items-center justify-center">
       <Activity className="w-12 h-12 text-indigo-500 animate-pulse mb-6" />
       <h2 className="text-xl font-bold text-slate-900">Redirecting to Optimized View</h2>
       <p className="text-slate-500 mt-2 font-medium">Platform architecture is aligning your user role with the appropriate intelligence dashboard.</p>
    </div>
  );
};

export default Dashboard;
