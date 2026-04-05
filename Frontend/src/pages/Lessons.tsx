import { useState, useEffect } from 'react';
import { Search, Edit, Trash2, BookText, Video, ArrowLeft, Clock, X, ChevronRight, Play, Layers, Plus } from 'lucide-react';
import api from '../services/api';
import { toast } from 'sonner';
import ConfirmModal from '../components/ConfirmModal';
import Pagination from '../components/Pagination';
import { useConfirm } from '../hooks/useConfirm';
import { useEscapeKey } from '../hooks/useEscapeKey';

interface Lesson {
  id: string;
  module_id: string;
  module_name?: string;
  sub_topic: string;
  activity?: string;
  video_url?: string;
  diagram_url?: string;
  code?: string;
  procedure?: string;
  required_material?: string;
  what_you_get?: string;
  serial_number: number;
  total_hours: number;
  created_by_teacher_id?: string;
  created_by_teacher_name?: string;
}



const Lessons: React.FC = () => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  
  const { confirmState, requestConfirm } = useConfirm();

  const getEmbedUrl = (url: string) => {
    if (!url) return '';
    try {
      let embedUrl = url;
      if (url.includes('youtu.be/')) {
        const id = url.split('youtu.be/')[1]?.split('?')[0];
        embedUrl = `https://www.youtube.com/embed/${id}`;
      } else if (url.includes('youtube.com/watch?v=')) {
        const id = url.split('v=')[1]?.split('&')[0];
        embedUrl = `https://www.youtube.com/embed/${id}`;
      }
      
      const separator = embedUrl.includes('?') ? '&' : '?';
      return `${embedUrl}${separator}rel=0&modestbranding=1&autoplay=0`;
    } catch (e) {
      return url;
    }
  };

  const handleDelete = async (id: string, name: string) => {
    const ok = await requestConfirm({
      title: 'Decommission Lesson',
      message: `Confirm removal of lesson protocol "${name}"? This action will archive this instructional unit.`,
      confirmLabel: 'Decommission',
      variant: 'danger'
    });
    if (!ok) return;
    try {
      await api.delete(`/lessons/${id}`);
      toast.success('Lesson decommissioned');
      fetchData();
    } catch (error) {
      toast.error('Decommission protocol failed');
    }
  };

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);

  const [formData, setFormData] = useState({
    module_id: '',
    sub_topic: '',
    activity: '',
    video_url: '',
    diagram_url: '',
    code: '',
    procedure: '',
    required_material: '',
    what_you_get: '',
    serial_number: 0,
    total_hours: 0
  });

  const [isUploading, setIsUploading] = useState(false);

  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) setUser(JSON.parse(savedUser));
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const lessonsRes = await api.get('/lessons');
      setLessons(lessonsRes.data);
    } catch (error) {
       console.error('Core data sync error:', error);
       toast.error('Failed to synchronize resource registry');
    } finally {
      setLoading(false);
    }
  };

  const fetchLessonDetail = async (id: string) => {
    try {
      setLoading(true);
      const res = await api.get(`/lessons/${id}`);
      setSelectedLesson(res.data);
    } catch (error) {
      toast.error('Identity fetch failure');
    } finally {
      setLoading(false);
    }
  };



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsUploading(true);
    const toastId = toast.loading('Synchronizing lesson protocols...');

    try {
      let activeModuleId = formData.module_id;
      if (!activeModuleId) {
        const modulesRes = await api.get('/modules');
        if (modulesRes.data && modulesRes.data.length > 0) {
          activeModuleId = modulesRes.data[0].id;
        } else {
          // If no courses exist, establish a default one automatically
          toast.loading('Establishing foundational track...', { id: toastId });
          const newModule = await api.post('/modules', { 
            name: "NubeEra Curriculum", 
            description: "Main instructional track for platform residents.",
            credits: 1
          });
          activeModuleId = newModule.data.id;
        }
      }

      const payload = {
        ...formData,
        module_id: activeModuleId,
        video_url: formData.video_url,
        diagram_url: formData.diagram_url,
        serial_number: Number(formData.serial_number)
      };

      if (editingId) {
        await api.put(`/lessons/${editingId}`, payload);
        toast.success('Lesson manifest updated', { id: toastId });
      } else {
        await api.post('/lessons', payload);
        toast.success('New lesson protocol established', { id: toastId });
      }
      setShowModal(false);
      resetForm();
      fetchData();
    } catch (error: any) {
      toast.error('Protocol failure: ' + (error?.response?.data?.message || 'Check inputs'), { id: toastId });
    } finally {
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      module_id: '',
      sub_topic: '',
      activity: '',
      video_url: '',
      diagram_url: '',
      code: '',
      procedure: '',
      required_material: '',
      what_you_get: '',
      serial_number: lessons.length + 1,
      total_hours: 0
    });
  };

  const filteredLessons = lessons.filter(l =>
    l.sub_topic?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.module_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredLessons.length / pageSize);
  const paginatedLessons = filteredLessons.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  useEffect(() => { setCurrentPage(1); }, [searchTerm]);

  useEscapeKey(() => setShowModal(false), showModal);

  const isStaffOrTrainer = user?.utype !== 'learner' && user?.utype !== 'student';

  if (selectedLesson) {
    const moduleLessons = lessons.filter(l => l.module_id === selectedLesson.module_id)
                                .sort((a, b) => a.serial_number - b.serial_number);

    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-16">
        <div className="flex items-center justify-between">
          <button onClick={() => setSelectedLesson(null)} className="ag-btn ag-btn-outline !rounded-full px-6 shadow-sm">
            <ArrowLeft className="w-4 h-4" /> <span>Return to Registry</span>
          </button>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50 border border-indigo-100 rounded-full text-[10px] font-bold text-indigo-600 uppercase tracking-widest shadow-sm">
             <Layers className="w-3.5 h-3.5" /> {selectedLesson.module_name}
          </div>
        </div>

        <div className="flex flex-col xl:flex-row gap-8 items-start">
          {/* Main Video & Content */}
          <div className="flex-1 w-full space-y-8">
            <div className="bg-white rounded-[32px] overflow-hidden shadow-premium border border-slate-100">
               <div className="aspect-video bg-slate-900 relative group overflow-hidden shadow-2xl">
                  {selectedLesson.video_url ? (
                    <iframe className="w-full h-full" src={getEmbedUrl(selectedLesson.video_url)} title="Instructional Media" allowFullScreen />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 bg-slate-50">
                      <Play className="w-16 h-16 text-slate-800 mb-6" />
                      <p className="text-xs font-bold uppercase tracking-widest opacity-40">No media protocol identified</p>
                    </div>
                  )}
               </div>
               <div className="p-10">
                  <div className="flex items-center gap-3 mb-6">
                     <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-[0.2em] bg-indigo-50 px-3 py-1 rounded-lg">Protocol {selectedLesson.serial_number}</span>
                     <div className="h-1 w-1 rounded-full bg-slate-300"></div>
                     <span className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em]">{selectedLesson.total_hours} Minute Sequence</span>
                  </div>
                  <h1 className="text-3xl font-bold text-slate-900 tracking-tight leading-tight">{selectedLesson.sub_topic}</h1>
               </div>
            </div>

            {/* Additional details could go here if needed */}
          </div>

          {/* Chapter Sidebar */}
          <div className="w-full xl:w-[400px] flex flex-col gap-8 sticky top-24">
             <div className="bg-white rounded-[32px] p-8 shadow-premium border border-slate-100 flex flex-col gap-6 max-h-[70vh]">
                <div className="flex items-center justify-between">
                   <h3 className="text-[10px] font-bold text-slate-600 uppercase tracking-widest flex items-center gap-2">
                     <BookText className="w-4 h-4 text-indigo-600" />
                     Corpus Content
                   </h3>
                   <span className="px-2 py-0.5 bg-slate-50 border border-slate-100 rounded-md text-[9px] font-bold text-slate-500 uppercase tracking-widest">{moduleLessons.length} Modules</span>
                </div>

                <div className="flex-1 overflow-y-auto no-scrollbar space-y-3 pr-2">
                   {moduleLessons.map((lesson) => {
                     const isActive = lesson.id === selectedLesson.id;
                     return (
                        <div 
                           key={lesson.id}
                           onClick={() => fetchLessonDetail(lesson.id)}
                           className={`p-4 rounded-2xl border transition-all duration-300 cursor-pointer group flex items-start gap-4 ${
                             isActive 
                             ? 'bg-indigo-50 border-indigo-200 shadow-sm ring-1 ring-indigo-200' 
                             : 'bg-white border-slate-100 hover:border-indigo-100 hover:bg-slate-50'
                           }`}
                        >
                           <div className={`mt-1 w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center text-[10px] font-bold transition-colors ${
                              isActive ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-200' : 'bg-slate-50 text-slate-500 group-hover:bg-indigo-100 group-hover:text-indigo-600'
                           }`}>
                              {lesson.serial_number}
                           </div>
                           <div className="flex-1 min-w-0">
                              <div className={`text-xs font-bold tracking-tight leading-snug transition-colors ${
                                 isActive ? 'text-indigo-900' : 'text-slate-700 group-hover:text-indigo-600'
                              }`}>
                                 {lesson.sub_topic}
                              </div>
                              <div className="flex items-center gap-3 mt-1.5">
                                 <div className="flex items-center gap-1 text-[9px] font-medium text-slate-400">
                                    <Clock className="w-2.5 h-2.5" />
                                    {lesson.total_hours}m
                                 </div>
                                 {lesson.video_url && (
                                    <div className="w-4 h-4 rounded bg-red-50 flex items-center justify-center text-red-500">
                                       <Video className="w-2.5 h-2.5" />
                                    </div>
                                 )}
                              </div>
                           </div>
                           {isActive && <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 px-0.5"></div>}
                        </div>
                     );
                   })}
                </div>
             </div>

             {/* Lead Architect section moved below if still desired, or removed for more space */}
             <div className="bg-slate-50/50 rounded-[32px] p-6 border border-slate-100 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-600 font-bold text-lg shadow-sm">{(selectedLesson.created_by_teacher_name?.[0] || 'S').toUpperCase()}</div>
                <div>
                   <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Lead Architect</div>
                   <div className="text-xs font-bold text-slate-900 tracking-tight mt-0.5">{selectedLesson.created_by_teacher_name || 'System Staff'}</div>
                </div>
             </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-1000 pb-16">
      
      {/* Search & Action Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex flex-col gap-1">
           <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Instructional Resources</h2>
           <p className="text-sm text-slate-500 font-medium">Manage granular learning units and resource materials.</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="relative w-full sm:w-80 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 w-4 h-4 group-focus-within:text-indigo-500 transition-colors" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search resource titles..."
              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm text-slate-900 focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/5 transition-all shadow-sm placeholder:text-slate-600"
            />
          </div>
          {isStaffOrTrainer && (
            <button
              onClick={() => { resetForm(); setShowModal(true); }}
              className="ag-btn ag-btn-primary !rounded-full px-6 shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Establish Lesson</span>
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="py-24 text-center">
          <div className="w-12 h-12 border-2 border-indigo-500/10 border-t-indigo-500 rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-slate-600 text-[10px] font-bold uppercase tracking-[0.3em]">Synching resources...</p>
        </div>
      ) : paginatedLessons.length === 0 ? (
        <div className="py-24 text-center bg-white rounded-[32px] border border-slate-100 shadow-sm border-dashed">
           <div className="max-w-xs mx-auto opacity-40">
              <BookText className="w-16 h-16 mx-auto text-slate-800 mb-6" />
              <h3 className="text-lg font-bold text-slate-900">Resource Database Empty</h3>
              <p className="text-slate-500 text-xs mt-2 font-medium leading-relaxed">No instructional lessons matched your query. Consider establishing new content protocols.</p>
           </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {paginatedLessons.map((lesson, idx) => (
            <div key={lesson.id} onClick={() => fetchLessonDetail(lesson.id)} className="group bg-white rounded-[32px] border border-slate-100 shadow-sm hover:shadow-premium transition-all duration-500 overflow-hidden flex flex-col cursor-pointer border-l-4 border-l-slate-100 hover:border-l-indigo-500">
               <div className="p-8 pb-4 flex items-center justify-between">
                  <div className="px-2.5 py-1 bg-slate-50 rounded-lg text-[9px] font-bold text-slate-600 uppercase tracking-widest group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                     Unit {(currentPage - 1) * pageSize + idx + 1}
                  </div>
                  <div className="flex items-center gap-2">
                     <Clock className="w-3.5 h-3.5 text-slate-700" />
                     <span className="text-[10px] font-bold text-slate-600 group-hover:text-indigo-600 transition-colors">{(lesson.total_hours && lesson.total_hours > 0) ? `${lesson.total_hours}m` : 'Duration TBD'}</span>
                  </div>
               </div>

               <div className="px-8 flex-1">
                  <h3 className="text-lg font-bold text-slate-900 tracking-tight leading-snug group-hover:text-indigo-600 transition-colors line-clamp-2">
                    {lesson.sub_topic}
                  </h3>
                  <div className="mt-4 flex items-center gap-3">
                     <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100 group-hover:bg-indigo-50 group-hover:border-indigo-100 group-hover:text-indigo-600 transition-all font-mono italic">{lesson.module_name || 'Core Curriculum'}</span>
                  </div>
               </div>

               <div className="p-8 pt-6 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                     {lesson.video_url && <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-500"><Video className="w-3.5 h-3.5" /></div>}

                  </div>

                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
                    {isStaffOrTrainer ? (
                      <>
                        <button onClick={(e) => { e.stopPropagation(); setEditingId(lesson.id); setFormData({...lesson} as any); setShowModal(true); }} className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-50 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 transition-all shadow-sm">
                           <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); handleDelete(lesson.id, lesson.sub_topic); }} className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-50 text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-all shadow-sm">
                           <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                       <ChevronRight className="w-5 h-5 text-indigo-600" />
                    )}
                  </div>
               </div>
            </div>
          ))}
        </div>
      )}

      {paginatedLessons.length > 0 && (
        <div className="pt-6">
          <Pagination currentPage={currentPage} totalPages={totalPages} pageSize={pageSize} totalItems={filteredLessons.length} onPageChange={setCurrentPage} onPageSizeChange={setPageSize} />
        </div>
      )}

      {/* Lesson Configuration Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-6 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-4xl rounded-[32px] shadow-premium animate-in zoom-in-95 duration-300 overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">
             <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight">{editingId ? 'Refine Lesson Blueprint' : 'Establish New Lesson'}</h2>
                  <p className="text-xs text-slate-500 font-medium mt-1">Configure instructional content, media nodes, and learning logic.</p>
                </div>
                <button onClick={() => setShowModal(false)} className="w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-100 transition-all shadow-sm">
                   <X className="w-5 h-5" />
                </button>
             </div>
             
             <form onSubmit={handleSubmit} className="p-10 space-y-10 overflow-y-auto custom-scrollbar">
                {/* Core Identification Box */}
                <div className="bg-slate-50/50 rounded-[32px] p-8 border border-slate-100">
                   <div className="relative group">
                     <BookText className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-700 group-focus-within:text-indigo-500 transition-colors" />
                     <input 
                       type="text" 
                       required 
                       value={formData.sub_topic} 
                       onChange={e => setFormData({...formData, sub_topic: e.target.value})} 
                       placeholder="Lesson Title / Sub-Topic"
                       className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl focus:border-indigo-500 transition-all outline-none text-sm font-bold text-slate-900 shadow-sm" 
                     />
                   </div>
                </div>

                {/* Media Node Grid (YouTube URL) */}
                <div className="bg-slate-50/50 rounded-[32px] p-8 border border-slate-100">
                   <div className="relative group">
                     <Play className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-700 group-focus-within:text-red-500 transition-colors" />
                     <input 
                       type="url" 
                       value={formData.video_url} 
                       onChange={e => setFormData({...formData, video_url: e.target.value})} 
                       placeholder="Resource Media URL (YouTube Link)"
                       className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl focus:border-red-500 transition-all outline-none text-sm font-bold text-slate-900 shadow-sm" 
                     />
                   </div>
                </div>







                <div className="flex gap-4 pt-6 border-t border-slate-50">
                   <button type="button" onClick={() => setShowModal(false)} className="ag-btn ag-btn-outline grow !rounded-2xl py-4 !font-bold uppercase tracking-widest text-[10px]">Decline</button>
                   <button type="submit" disabled={isUploading} className="ag-btn ag-btn-primary grow !rounded-2xl py-4 !font-bold shadow-lg">
                      {isUploading ? 'Synching...' : (editingId ? 'Push Manifest Updates' : 'Commit Lesson Protocol')}
                   </button>
                </div>
             </form>
          </div>
        </div>
      )}
      <ConfirmModal open={confirmState.open} title={confirmState.title ?? 'Confirm Protocol'} message={confirmState.message ?? ''} confirmLabel={confirmState.confirmLabel} cancelLabel={confirmState.cancelLabel} variant={confirmState.variant as any} onConfirm={() => confirmState.resolve?.(true)} onCancel={() => confirmState.resolve?.(false)} />
    </div>
  );
};

export default Lessons;
