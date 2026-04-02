import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Search, Edit, Trash2, Award, X, BookOpen, Layers, ChevronRight, Clock, Plus } from 'lucide-react';
import api from '../services/api';
import { toast } from 'sonner';
import ConfirmModal from '../components/ConfirmModal';
import Pagination from '../components/Pagination';
import { useConfirm } from '../hooks/useConfirm';
import { useEscapeKey } from '../hooks/useEscapeKey';

interface Module {
  id: string;
  name: string;
  description?: string;
  credits?: number;
}

const Modules: React.FC = () => {
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const location = useLocation();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12); // Slightly larger for grid

  useEffect(() => {
    if (location.pathname.includes('/create')) {
      resetForm();
      setShowModal(true);
    }
  }, [location]);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    credits: 0
  });

  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) setUser(JSON.parse(savedUser));
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await api.get('/modules');
      setModules(response.data);
    } catch (error) {
      console.error('Data acquisition failure:', error);
      toast.error('Failed to load learning tracks');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...formData };

    try {
      if (editingId) {
        await api.put(`/modules/${editingId}`, payload);
        toast.success('Course details updated');
      } else {
        await api.post('/modules', payload);
        toast.success('Course successfully created');
      }
      setShowModal(false);
      resetForm();
      fetchData();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Protocol failure. Please audit inputs.');
    }
  };

  const { confirmState, requestConfirm } = useConfirm();

  const handleDelete = async (id: string, name: string) => {
    const ok = await requestConfirm({ 
      title: 'Decommission Course', 
      message: `Confirm decommissioning of "${name}"? This will archive all associated learning units.`, 
      confirmLabel: 'Decommission', 
      variant: 'danger' 
    });
    if (!ok) return;
    try {
      await api.delete(`/modules/${id}`);
      toast.success('Course decommissioned');
      fetchData();
    } catch (error) {
       toast.error('Decommission protocol failed');
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      name: '',
      description: '',
      credits: 0
    });
  };

  const filteredModules = modules.filter(m =>
    m.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredModules.length / pageSize);
  const paginatedModules = filteredModules.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  useEscapeKey(() => setShowModal(false), showModal);

  const isStaffOrTrainer = user?.utype !== 'learner' && user?.utype !== 'student';

  return (
    <div className="space-y-10 animate-in fade-in duration-1000 pb-16">
      
      {/* Search & Action Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex flex-col gap-1">
           <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Curriculum Library</h2>
           <p className="text-sm text-slate-500 font-medium">Browse and manage established learning trajectories.</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="relative w-full sm:w-80 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 w-4 h-4 group-focus-within:text-indigo-500 transition-colors" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter course tracks..."
              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm text-slate-900 focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/5 transition-all shadow-sm placeholder:text-slate-600"
            />
          </div>
          {isStaffOrTrainer && (
            <button
              onClick={() => { resetForm(); setShowModal(true); }}
              className="ag-btn ag-btn-primary !rounded-full px-6 shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Initialize Course</span>
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="py-24 text-center">
          <div className="w-12 h-12 border-2 border-indigo-500/10 border-t-indigo-500 rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-slate-600 text-[10px] font-bold uppercase tracking-[0.3em]">Mobilizing tracks...</p>
        </div>
      ) : paginatedModules.length === 0 ? (
        <div className="py-24 text-center bg-white rounded-[32px] border border-slate-100 shadow-sm border-dashed">
           <div className="max-w-xs mx-auto opacity-40">
              <BookOpen className="w-16 h-16 mx-auto text-slate-800 mb-6" />
              <h3 className="text-lg font-bold text-slate-900">No Tracks Identified</h3>
              <p className="text-slate-500 text-xs mt-2 font-medium leading-relaxed">The curriculum library is currently synchronized but empty. Filter adjustments may reveal hidden protocols.</p>
              <button onClick={() => setSearchTerm('')} className="mt-6 text-[10px] font-bold text-indigo-600 uppercase tracking-widest hover:underline">Reset Filter Sequence</button>
           </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {paginatedModules.map((module) => (
            <div key={module.id} className="group relative bg-white rounded-[32px] border border-slate-100 shadow-sm hover:shadow-premium transition-all duration-500 overflow-hidden flex flex-col h-full">
              {/* Card Header Decoration */}
              <div className="h-2 bg-slate-50 group-hover:bg-indigo-500 transition-colors duration-500"></div>
              
              <div className="p-8 flex-1 flex flex-col">
                <div className="flex items-start justify-between mb-6">
                  <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm group-hover:scale-110 transition-transform">
                     <Layers className="w-6 h-6" />
                  </div>
                  <div className="px-3 py-1 bg-slate-50 border border-slate-100 rounded-full text-[9px] font-bold text-slate-600 uppercase tracking-widest group-hover:bg-indigo-50 group-hover:text-indigo-600 group-hover:border-indigo-100 transition-all">
                     {module.credits} Unit Credits
                  </div>
                </div>

                <h3 className="text-lg font-bold text-slate-900 tracking-tight leading-tight mb-3 group-hover:text-indigo-600 transition-colors">
                  {module.name}
                </h3>
                
                <p className="text-sm text-slate-500 font-medium leading-relaxed mb-8 flex-1 line-clamp-3">
                  {module.description || 'Comprehensive learning trajectory established for platform residents. Includes theoretical protocols and practical logic sequences.'}
                </p>

                <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                  {isStaffOrTrainer ? (
                    <div className="flex items-center gap-2">
                       <button 
                         onClick={() => {
                           setEditingId(module.id);
                           setFormData({
                             name: module.name,
                             description: module.description || '',
                             credits: module.credits || 0
                           });
                           setShowModal(true);
                         }}
                         className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-50 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 hover:border-indigo-100 border border-transparent transition-all"
                         title="Refine Course"
                       >
                         <Edit className="w-4 h-4" />
                       </button>
                       <button 
                         onClick={() => handleDelete(module.id, module.name)}
                         className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-50 text-slate-600 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-100 border border-transparent transition-all"
                         title="Archive Track"
                       >
                         <Trash2 className="w-4 h-4" />
                       </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-slate-600 text-[10px] font-bold uppercase tracking-widest">
                       <Clock className="w-3.5 h-3.5" /> 12h Duration
                    </div>
                  )}

                  <button className="flex items-center gap-2 text-[10px] font-bold text-indigo-600 uppercase tracking-widest hover:translate-x-1 transition-transform">
                     Access Content <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {paginatedModules.length > 0 && (
        <div className="pt-6">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            totalItems={filteredModules.length}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
          />
        </div>
      )}

      {/* Course Configuration Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-6 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-xl rounded-[32px] shadow-premium animate-in zoom-in-95 duration-300 overflow-hidden border border-slate-100">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
              <div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">{editingId ? 'Refine Course Track' : 'Establish New Course'}</h2>
                <p className="text-xs text-slate-500 font-medium mt-1">Configure curriculum metadata and unit credits.</p>
              </div>
              <button onClick={() => setShowModal(false)} className="w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-100 transition-all shadow-sm">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-8">
              <div>
                <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-2.5 ml-1 block">Course Identifier / Title</label>
                <div className="relative">
                  <Layers className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-700" />
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Advanced System Architecture"
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:border-indigo-500 focus:bg-white transition-all outline-none text-sm font-medium text-slate-900 shadow-sm"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-2.5 ml-1 block">Allocated Intelligence Credits</label>
                <div className="relative">
                  <Award className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-600/50" />
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.credits}
                    onChange={(e) => setFormData({ ...formData, credits: parseInt(e.target.value) || 0 })}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:border-indigo-500 focus:bg-white transition-all outline-none text-sm font-bold text-slate-700 shadow-sm"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-2.5 ml-1 block">Course Syllabus / Overview</label>
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Summarize the instructional trajectory for platform residents..."
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:border-indigo-500 focus:bg-white outline-none text-sm font-medium text-slate-700 transition-all resize-none shadow-inner"
                />
              </div>

              <div className="flex gap-4 pt-4 border-t border-slate-50 mt-4">
                <button type="button" onClick={() => setShowModal(false)} className="ag-btn ag-btn-outline grow !rounded-2xl py-4 !font-bold uppercase tracking-widest text-[10px]">Abandon</button>
                <button type="submit" className="ag-btn ag-btn-primary grow !rounded-2xl py-4 !font-bold shadow-lg">
                  {editingId ? 'Push Manifest Updates' : 'Commit Course Track'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        open={confirmState.open}
        title={confirmState.title ?? 'Confirm Protocol'}
        message={confirmState.message}
        confirmLabel={confirmState.confirmLabel}
        cancelLabel={confirmState.cancelLabel}
        variant={confirmState.variant}
        onConfirm={() => confirmState.resolve?.(true)}
        onCancel={() => confirmState.resolve?.(false)}
      />
    </div>
  );
};

export default Modules;
