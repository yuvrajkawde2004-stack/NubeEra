import React, { useEffect, useState, useRef } from 'react';
import {
  BookOpen,
  PlayCircle,
  ChevronDown,
  Image as ImageIcon,
  Activity,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';

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
  return `${embedUrl}${separator}rel=0&modestbranding=1&autoplay=0`;
};

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
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
      <p className="mt-4 text-slate-500 text-xs font-bold tracking-widest uppercase text-center">Mobilizing Knowledge Base...</p>
    </div>
  );

  const role = user?.utype?.toLowerCase();
  const isLearner = role === 'learner' || role === 'student';

  if (isLearner) {
    return (
      <div className="max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-1000 pb-20 px-4 sm:px-6">
        
        {/* Zone 1: Welcome Hero */}
        <section className="ag-hero group !mb-4">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Welcome back, <span className="text-gradient">{user?.name?.split(' ')[0] || 'Explorer'}</span>.
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
                <div className="p-8 md:p-10 border-b border-slate-900/5 flex flex-col md:flex-row md:items-center justify-between gap-10 relative bg-white/20">
                   <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-500/5 rounded-full -ml-32 -mt-32 blur-3xl"></div>
                   
                   <div className="relative z-10 space-y-4">
                    <div className="flex items-center gap-4">
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
                                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Curriculum</p>
                                   <p className="text-sm font-bold text-slate-900 tracking-tight">Modules</p>
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
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-2">Duration: {selectedLesson.total_hours || 0}m</span>
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
                        <p className="text-xs font-bold uppercase tracking-[0.4em] opacity-40">Synchronizing Media Stream</p>
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
                        <span className="text-xs font-bold uppercase tracking-widest">Previous Unit</span>
                     </button>
                     <button 
                       onClick={handleNextLesson}
                       className="flex items-center gap-3 text-slate-800 hover:text-indigo-600 transition-all group text-right"
                     >
                        <span className="text-xs font-bold uppercase tracking-widest font-mono">Next Unit</span>
                        <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-lg group-hover:bg-indigo-600 transition-colors">
                           <ChevronRight className="w-5 h-5" />
                        </div>
                     </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="ag-panel h-[750px] flex flex-col items-center justify-center text-center p-12 bg-white/30 backdrop-blur-xl border border-slate-900/5 shadow-2xl relative overflow-hidden rounded-[48px]">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full -mr-[250px] -mt-[250px] blur-3xl"></div>
                
                <div className="w-28 h-28 bg-gradient-to-br from-indigo-500/20 to-violet-500/10 rounded-[36px] flex items-center justify-center mb-12 shadow-2xl shadow-indigo-500/20 border border-slate-900/10 rotate-6 group-hover:rotate-0 transition-transform duration-700">
                   <BookOpen className="w-14 h-14 text-indigo-600" />
                </div>
                <h3 className="text-5xl font-black text-slate-900 tracking-tight mb-6">Initialize Your <span className="text-gradient">Flight</span></h3>
                <p className="text-slate-500 font-medium max-w-sm text-xl leading-relaxed mb-12 italic opacity-80">"Select your curriculum path from the command center to begin."</p>
                
                <div className="w-full max-w-lg p-1 bg-white/50 backdrop-blur-md rounded-3xl border border-white/50 shadow-inner">
                    <div className="p-8 space-y-4">
                        <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-[0.3em] mb-6">Recommended Access Nodes</p>
                        <div className="grid grid-cols-1 gap-3">
                            {modules.slice(0, 3).map((m: Module) => (
                                <button 
                                key={m.id} 
                                onClick={() => {
                                    setExpandedModules((p: Record<string, boolean>) => ({ ...p, [m.id]: true }));
                                    if (m.lessons.length > 0) setSelectedLesson(m.lessons[0]);
                                }} 
                                className="w-full px-8 py-5 bg-white border border-slate-100 rounded-2xl text-[13px] font-bold text-slate-900 hover:border-indigo-500/40 hover:shadow-xl hover:-translate-y-1 transition-all uppercase tracking-wide flex items-center justify-between group"
                                >
                                {m.name}
                                <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 opacity-0 group-hover:opacity-100 transition-all">
                                    <ChevronRight className="w-4 h-4" />
                                </div>
                                </button>
                            ))}
                        </div>
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
    <div className="ag-panel p-24 text-center flex flex-col items-center justify-center bg-white/50 backdrop-blur-xl border border-slate-900/5 min-h-[60vh] rounded-[40px]">
       <Activity className="w-16 h-16 text-indigo-500 animate-pulse mb-8" />
       <h2 className="text-2xl font-black text-slate-900 tracking-tight italic uppercase">System Synchronization</h2>
       <p className="text-slate-500 mt-4 font-medium max-w-xs mx-auto">Platform architecture is aligning your user role with the appropriate intelligence dashboard.</p>
    </div>
  );
};

export default Dashboard;
