import { useState, useEffect } from 'react';
import { Search, Edit, Trash2, BookText, Video, ArrowLeft, Clock, X, ChevronRight, Play, Layers, Plus, Image as ImageIcon } from 'lucide-react';
import api from '../services/api';
import { toast } from 'sonner';
import ConfirmModal from '../components/ConfirmModal';
import Pagination from '../components/Pagination';
import { useConfirm } from '../hooks/useConfirm';
import { useEscapeKey } from '../hooks/useEscapeKey';
import { formatYouTubeDuration, parseYouTubeDuration } from '../utils/format';

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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [durationText, setDurationText] = useState('');
  
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
      return `${embedUrl}${separator}rel=0&modestbranding=1&autoplay=0&iv_load_policy=3`;
    } catch (e) {
      return url;
    }
  };

  const handleDelete = async (id: string, name: string) => {
    const ok = await requestConfirm({
      title: 'Remove Lesson',
      message: `Are you sure you want to remove "${name}"?`,
      confirmLabel: 'Remove',
      variant: 'danger'
    });
    if (!ok) return;
    try {
      await api.delete(`/lessons/${id}`);
      toast.success('Lesson removed');
      fetchData();
    } catch (error) {
      toast.error('Failed to remove lesson');
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
       console.error('Data sync error:', error);
       toast.error('Failed to load lessons');
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
      toast.error('Failed to load lesson details');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'pdf' | 'image') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formDataUpload = new FormData();
    formDataUpload.append('file', file);

    const toastId = toast.loading(`Uploading ${type === 'pdf' ? 'PDF' : 'screenshot'}...`);
    try {
      const { data } = await api.post('/upload', formDataUpload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      const fileUrl = data.url;
      if (type === 'pdf') {
        setFormData(prev => ({ ...prev, procedure: fileUrl }));
      } else {
        setFormData(prev => ({ ...prev, diagram_url: fileUrl }));
      }
      
      toast.success('File uploaded!', { id: toastId });
    } catch (error) {
      toast.error('Upload failed', { id: toastId });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsUploading(true);
    const toastId = toast.loading('Saving lesson...');

    try {
      let activeModuleId = formData.module_id;
      if (!activeModuleId) {
        const modulesRes = await api.get('/modules');
        if (modulesRes.data && modulesRes.data.length > 0) {
          activeModuleId = modulesRes.data[0].id;
        } else {
          // If no courses exist, establish a default one automatically
          toast.loading('Creating course...', { id: toastId });
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
        toast.success('Lesson updated', { id: toastId });
      } else {
        await api.post('/lessons', payload);
        toast.success('New lesson added', { id: toastId });
      }
      setShowModal(false);
      resetForm();
      fetchData();
    } catch (error: any) {
      toast.error('Failed: ' + (error?.response?.data?.message || 'Check inputs'), { id: toastId });
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
            <ArrowLeft className="w-4 h-4" /> <span>Back to Lessons</span>
          </button>
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50 border border-indigo-100 rounded-full text-[10px] font-bold text-indigo-600 uppercase tracking-widest shadow-sm">
               <Layers className="w-3.5 h-3.5" /> {selectedLesson.module_name}
            </div>
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
              className={`ag-btn !rounded-full px-6 shadow-sm transition-all ${isSidebarOpen ? 'ag-btn-primary' : 'ag-btn-outline'}`}
            >
              <BookText className="w-4 h-4" /> <span>{isSidebarOpen ? 'Hide Topics' : 'Show Topics'}</span>
            </button>
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
                     <span className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em]">{formatYouTubeDuration(selectedLesson.total_hours)}</span>
                  </div>
                  <h1 className="text-3xl font-bold text-slate-900 tracking-tight leading-tight">{selectedLesson.sub_topic}</h1>
               </div>
            </div>

            {/* Additional details could go here if needed */}
          </div>

          {/* Sliding Sidebar */}
          <div className={`fixed top-0 right-0 h-full w-[400px] bg-white shadow-2xl z-[60] transition-transform duration-500 ease-in-out transform ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'} border-l border-slate-100 flex flex-col`}>
             <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                <div className="flex items-center gap-3">
                   <BookText className="w-5 h-5 text-indigo-600" />
                   <h3 className="text-lg font-bold text-slate-900 tracking-tight">Topics Covered</h3>
                </div>
                <button onClick={() => setIsSidebarOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors">
                   <X className="w-5 h-5 text-slate-500" />
                </button>
             </div>

             <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-8">
                {/* Active Lesson Details */}
                <div className="space-y-6 animate-in slide-in-from-right-4 duration-500 delay-200">
                   <div className="space-y-4">
                      <div className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">Selected Topic</div>
                      <h4 className="text-xl font-bold text-slate-900 leading-tight">{selectedLesson.sub_topic}</h4>
                   </div>

                   {/* PDF Resource */}
                   <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                      <div className="flex items-center justify-between mb-4">
                         <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Lesson PDF</div>
                         <Clock className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                      {selectedLesson.procedure ? (
                        <a href={selectedLesson.procedure} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-200 hover:border-indigo-500 hover:shadow-md transition-all group">
                           <div className="w-10 h-10 rounded-lg bg-rose-50 flex items-center justify-center text-rose-500 group-hover:scale-110 transition-transform">
                              <BookText className="w-5 h-5" />
                           </div>
                           <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-slate-900 truncate">Download PDF Guide</p>
                              <p className="text-[10px] text-slate-500">Resource Manifest</p>
                           </div>
                        </a>
                      ) : (
                        <div className="p-4 bg-white/50 border border-dashed border-slate-300 rounded-xl text-center">
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">No PDF synchronized</p>
                        </div>
                      )}
                   </div>

                   {/* Main Screenshot */}
                   <div className="space-y-3">
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Topic Overview</div>
                      <div className="aspect-video bg-slate-100 rounded-2xl border border-slate-200 overflow-hidden shadow-sm group relative">
                         {selectedLesson.diagram_url ? (
                           <img src={selectedLesson.diagram_url} alt="Topic Screenshot" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                         ) : (
                           <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 italic text-[10px]">
                              <ImageIcon className="w-8 h-8 mb-2 opacity-20" />
                              No screenshot available
                           </div>
                         )}
                      </div>
                   </div>
                </div>

                <div className="h-px bg-slate-50"></div>

                {/* Module Playlist */}
                <div className="space-y-6">
                   <div className="flex items-center justify-between">
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Module Playlist</div>
                      <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">{moduleLessons.length} Modules</span>
                   </div>
                   <div className="space-y-3">
                      {moduleLessons.map((lesson) => (
                        <div 
                           key={lesson.id}
                           onClick={() => fetchLessonDetail(lesson.id)}
                           className={`p-4 rounded-xl border transition-all duration-300 cursor-pointer flex items-center gap-4 ${
                             lesson.id === selectedLesson.id 
                             ? 'bg-indigo-50 border-indigo-200 shadow-sm ring-1 ring-indigo-200' 
                             : 'bg-white border-slate-100 hover:border-indigo-100 hover:bg-slate-50'
                           }`}
                        >
                           <div className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center text-[10px] font-bold ${
                             lesson.id === selectedLesson.id ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-200' : 'bg-slate-50 text-slate-500'
                           }`}>
                              {lesson.serial_number}
                           </div>
                           <div className="flex-1 min-w-0">
                              <p className={`text-[11px] font-bold truncate ${lesson.id === selectedLesson.id ? 'text-indigo-900' : 'text-slate-700'}`}>{lesson.sub_topic}</p>
                              <p className="text-[9px] text-slate-400 mt-0.5">{formatYouTubeDuration(lesson.total_hours)}</p>
                           </div>
                        </div>
                      ))}
                   </div>
                </div>
             </div>

             <div className="p-8 border-t border-slate-50 bg-slate-50/50">
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-600 font-bold shadow-sm">
                      {(selectedLesson.created_by_teacher_name?.[0] || 'I').toUpperCase()}
                   </div>
                   <div>
                      <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest tracking-tight">Instructor</p>
                      <p className="text-xs font-bold text-slate-900 mt-0.5">{selectedLesson.created_by_teacher_name || 'System Instructor'}</p>
                   </div>
                </div>
             </div>
          </div>
          
          {/* Overlay when sidebar is open */}
          {isSidebarOpen && (
            <div 
              className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-[55] animate-in fade-in duration-300" 
              onClick={() => setIsSidebarOpen(false)}
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-1000 pb-16">
      
      {/* Search & Action Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex flex-col gap-1">
           <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Lessons</h2>
           <p className="text-sm text-slate-500 font-medium">Manage your educational content and resources.</p>
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
              <span>Add Lesson</span>
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
              <h3 className="text-lg font-bold text-slate-900">No Lessons Found</h3>
              <p className="text-slate-500 text-xs mt-2 font-medium leading-relaxed">Try adjusting your search or add a new lesson.</p>
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
                     <span className="text-[10px] font-bold text-slate-600 group-hover:text-indigo-600 transition-colors">{(lesson.total_hours && lesson.total_hours > 0) ? formatYouTubeDuration(lesson.total_hours) : '0:00'}</span>
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
                         <button onClick={(e) => { 
                           e.stopPropagation(); 
                           setEditingId(lesson.id); 
                           setFormData({...lesson} as any); 
                           setDurationText(formatYouTubeDuration(lesson.total_hours));
                           setShowModal(true); 
                         }} className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-50 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 transition-all shadow-sm">
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
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight">{editingId ? 'Edit Lesson' : 'Add Lesson'}</h2>
                  <p className="text-xs text-slate-500 font-medium mt-1">Configure your lesson content and media.</p>
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
                 <div className="bg-slate-50/50 rounded-[32px] p-8 border border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="relative group">
                       <Play className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-700 group-focus-within:text-red-500 transition-colors" />
                       <input 
                         type="url" 
                         value={formData.video_url} 
                         onChange={e => setFormData({...formData, video_url: e.target.value})} 
                         placeholder="YouTube Link"
                         className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl focus:border-red-500 transition-all outline-none text-sm font-bold text-slate-900 shadow-sm" 
                       />
                    </div>
                    <div className="relative group">
                       <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-700 group-focus-within:text-indigo-500 transition-colors" />
                       <input 
                         type="text" 
                         value={durationText} 
                         onChange={e => {
                           const val = e.target.value;
                           setDurationText(val);
                           setFormData({...formData, total_hours: parseYouTubeDuration(val)});
                         }} 
                         placeholder="Duration (e.g., 1:30:00 or 15:00)"
                         className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl focus:border-indigo-500 transition-all outline-none text-sm font-bold text-slate-900 shadow-sm" 
                       />
                    </div>
                 </div>

                  {/* Advanced Resources (PDF & Screenshot) */}
                  <div className="bg-slate-50/50 rounded-[32px] p-8 border border-slate-100 space-y-8">
                     <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Additional Resources</div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                           <div className="relative group">
                             <BookText className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-700 group-focus-within:text-indigo-500 transition-colors" />
                             <input 
                               type="url" 
                               value={formData.procedure} 
                               onChange={e => setFormData({...formData, procedure: e.target.value})} 
                               placeholder="PDF Resource URL"
                               className="w-full pl-12 pr-12 py-4 bg-white border border-slate-200 rounded-2xl focus:border-indigo-500 transition-all outline-none text-sm font-bold text-slate-900 shadow-sm" 
                             />
                             <label className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-slate-400 hover:text-indigo-600 transition-colors">
                                <Plus className="w-5 h-5" />
                                <input type="file" className="hidden" accept=".pdf" onChange={(e) => handleFileUpload(e, 'pdf')} />
                             </label>
                           </div>
                           <p className="text-[9px] text-slate-400 ml-1 italic">Enter URL or click + to upload PDF</p>
                        </div>
                        <div className="space-y-3">
                           <div className="relative group">
                             <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-700 group-focus-within:text-indigo-500 transition-colors" />
                             <input 
                               type="url" 
                               value={formData.diagram_url} 
                               onChange={e => setFormData({...formData, diagram_url: e.target.value})} 
                               placeholder="Screenshot URL"
                               className="w-full pl-12 pr-12 py-4 bg-white border border-slate-200 rounded-2xl focus:border-indigo-500 transition-all outline-none text-sm font-bold text-slate-900 shadow-sm" 
                             />
                             <label className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-slate-400 hover:text-indigo-600 transition-colors">
                                <Plus className="w-5 h-5" />
                                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'image')} />
                             </label>
                           </div>
                           <p className="text-[9px] text-slate-400 ml-1 italic">Enter URL or click + to upload image</p>
                        </div>
                     </div>
                  </div>







                <div className="flex gap-4 pt-6 border-t border-slate-50">
                   <button type="button" onClick={() => setShowModal(false)} className="ag-btn ag-btn-outline grow !rounded-2xl py-4 !font-bold uppercase tracking-widest text-[10px]">Decline</button>
                   <button type="submit" disabled={isUploading} className="ag-btn ag-btn-primary grow !rounded-2xl py-4 !font-bold shadow-lg">
                      {isUploading ? 'Saving...' : (editingId ? 'Update Lesson' : 'Add Lesson')}
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
