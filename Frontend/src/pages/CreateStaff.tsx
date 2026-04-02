import { useState, useEffect } from 'react';
import { Search, Edit, Trash2, Mail, X, Lock, User as UserIcon, UserPlus, Key } from 'lucide-react';
import { toast } from 'sonner';
import api from '../services/api';
import ConfirmModal from '../components/ConfirmModal';
import Pagination from '../components/Pagination';
import { useConfirm } from '../hooks/useConfirm';
import { useEscapeKey } from '../hooks/useEscapeKey';

interface Trainer {
  id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  is_active: boolean;
  school_id: string;
  school_name: string;
}

const CreateStaff: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    school_id: '',
    is_active: true
  });

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      setUser(parsed);
      setFormData(prev => ({ ...prev, school_id: parsed.school_id || '' }));
    }
  }, []);

  useEffect(() => {
    fetchTrainers();
  }, [user]);

  const fetchTrainers = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/trainers');
      setTrainers(response.data);
    } catch (error) {
      console.error('Failed to fetch trainer registry', error);
      toast.error('Failed to synchronize trainer registry');
    } finally {
      setIsLoading(false);
    }
  };

  const { confirmState, requestConfirm } = useConfirm();

  const handleDelete = async (id: string, name: string) => {
    const ok = await requestConfirm({ 
      title: 'Expunge Trainer Identity', 
      message: `Confirm permanent removal of system access for "${name}"? This action will archive their instructional profile.`, 
      confirmLabel: 'Expunge Identity', 
      variant: 'danger' 
    });
    if (!ok) return;
    try {
      await api.delete(`/trainers/${id}`);
      toast.success('Trainer identity expunged');
      fetchTrainers();
    } catch (error) {
      toast.error('Expunge protocol failed');
    }
  };

  const handleResetPassword = async (trainer: Trainer) => {
    const ok = await requestConfirm({ 
      title: 'Reset Security Key', 
      message: `Confirm password synchronization for "${trainer.full_name}"? A temporary protocol will be established.`, 
      confirmLabel: 'Synchronize', 
      variant: 'warning' 
    });
    if (!ok) return;
    try {
      // Note: Assuming backend has a reset-password endpoint for trainers or users
      await api.put(`/users/${trainer.id}/reset-password`);
      toast.success('Security key synchronized');
    } catch (error) {
      toast.error('Sync protocol failure');
    }
  };

  const handleEdit = (trainer: Trainer) => {
    setEditingId(trainer.id);
    setFormData({
      first_name: trainer.first_name || '',
      last_name: trainer.last_name || '',
      email: trainer.email || '',
      password: '',
      school_id: trainer.school_id || user?.school_id || '',
      is_active: trainer.is_active
    });
    setShowModal(true);
  };

  const handleSaveTrainer = async (e: React.FormEvent) => {
    e.preventDefault();

    const finalData = {
      ...formData,
      school_id: formData.school_id || null
    };

    if (user?.utype !== 'admin') {
      finalData.school_id = user?.school_id || null;
    }

    try {
      if (editingId) {
        await api.put(`/trainers/${editingId}`, finalData);
        toast.success('Trainer profile updated');
      } else {
        await api.post('/trainers', finalData);
        toast.success('New trainer registered in faculty!');
      }
      setShowModal(false);
      resetForm();
      fetchTrainers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Protocol failure. Please audit inputs.');
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      first_name: '',
      last_name: '',
      email: '',
      password: '',
      school_id: user?.school_id || '',
      is_active: true
    });
  };

  const filteredTrainers = trainers.filter(t =>
    t.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredTrainers.length / pageSize);
  const paginatedTrainers = filteredTrainers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  useEscapeKey(() => setShowModal(false), showModal);

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-12">
      
      {/* Title & Stats Briefing */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-2">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight text-gradient bg-clip-text">Institutional Trainer Registry</h2>
          <p className="text-sm text-slate-500 font-medium italic mt-1">Real-time faculty enrollment and credential verification.</p>
        </div>
        
        <div className="flex items-center gap-4">
           <div className="px-5 py-2.5 bg-indigo-50/50 border border-indigo-100 rounded-full flex items-center gap-3 shadow-sm group">
              <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(79,70,229,0.4)]"></div>
              <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-widest">{filteredTrainers.length} Authorized Trainers</span>
           </div>
        </div>
      </div>

      {/* Search & Action Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="relative w-full sm:w-96 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 w-4 h-4 group-focus-within:text-indigo-500 transition-colors" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filter by faculty name or email terminal..."
            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm text-slate-900 focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/5 transition-all shadow-sm placeholder:text-slate-600"
          />
        </div>
        <button 
          onClick={() => { resetForm(); setShowModal(true); }} 
          className="ag-btn ag-btn-primary !rounded-full px-8 py-3.5 shadow-lg group hover:scale-[1.02] active:scale-95 transition-all"
        >
          <UserPlus className="w-4 h-4 group-hover:rotate-12 transition-transform" />
          <span className="font-bold tracking-wide">Enroll New Faculty</span>
        </button>
      </div>

      {/* Registry Table */}
      <div className="ag-table-container shadow-premium border-slate-100/50 rounded-[32px] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="ag-table">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="pl-8 py-5 text-[10px] uppercase tracking-[0.2em] text-slate-400 font-black">Identity Profiling</th>
                <th className="py-5 text-[10px] uppercase tracking-[0.2em] text-slate-400 font-black">Designation</th>
                <th className="py-5 text-[10px] uppercase tracking-[0.2em] text-slate-400 font-black">Access Status</th>
                <th className="pr-8 py-5 text-right text-[10px] uppercase tracking-[0.2em] text-slate-400 font-black">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="py-32 text-center">
                    <div className="w-12 h-12 border-2 border-indigo-500/10 border-t-indigo-500 rounded-full animate-spin mx-auto mb-6"></div>
                    <p className="text-slate-600 text-[10px] font-black uppercase tracking-[0.3em] animate-pulse">Mobilizing Faculty Registry...</p>
                  </td>
                </tr>
              ) : paginatedTrainers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-32 text-center">
                    <div className="max-w-sm mx-auto opacity-40 group">
                       <Search className="w-16 h-16 mx-auto text-slate-700 mb-6 group-hover:scale-110 transition-transform" />
                       <h3 className="text-lg font-bold text-slate-900 tracking-tight">No Matches Found</h3>
                       <p className="text-slate-500 text-sm font-medium mt-2">No results matched your faculty search criteria.</p>
                       <button onClick={() => setSearchTerm('')} className="mt-6 text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] hover:underline">Clear Search Filter</button>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedTrainers.map((trainer) => (
                  <tr key={trainer.id} className="group hover:bg-slate-50/30 transition-all cursor-default">
                    <td className="pl-8 py-6">
                      <div className="flex items-center gap-5">
                        <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-700 font-black text-xs shadow-sm group-hover:bg-indigo-50 group-hover:text-indigo-600 group-hover:border-indigo-100 transition-all uppercase ring-2 ring-transparent group-hover:ring-indigo-500/5">
                           {(trainer.first_name?.[0] || 'T')}{(trainer.last_name?.[0] || '')}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-slate-900 tracking-tight leading-none mb-1.5">{trainer.full_name}</span>
                          <span className="text-[11px] text-slate-500 font-bold tracking-tight lowercase flex items-center gap-1.5 opacity-80">
                             <Mail className="w-3 h-3 text-slate-400" />
                             {trainer.email}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-6">
                       <span className="px-3 py-1.5 bg-indigo-50/80 text-indigo-700 text-[10px] font-black uppercase tracking-widest rounded-lg border border-indigo-100/50 shadow-[0_2px_4px_rgba(79,70,229,0.05)]">
                          TRAINER
                       </span>
                    </td>
                    <td className="py-6">
                       <div className={`inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.15em] border ${trainer.is_active ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${trainer.is_active ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse' : 'bg-slate-400'}`} />
                          {trainer.is_active ? 'Active Access' : 'Deauthorized'}
                       </div>
                    </td>
                    <td className="pr-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-0 translate-x-4">
                        <button 
                          onClick={() => handleEdit(trainer)} 
                          className="w-10 h-10 flex items-center justify-center rounded-2xl bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 hover:border-indigo-100 transition-all shadow-sm hover:shadow-md active:scale-90"
                          title="Refine Profile"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleResetPassword(trainer)} 
                          className="w-10 h-10 flex items-center justify-center rounded-2xl bg-white border border-slate-200 text-slate-600 hover:text-amber-600 hover:bg-amber-50 hover:border-amber-100 transition-all shadow-sm hover:shadow-md active:scale-90"
                          title="Reset Security Key"
                        >
                          <Key className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(trainer.id, trainer.full_name)} 
                          className="w-10 h-10 flex items-center justify-center rounded-2xl bg-white border border-slate-200 text-slate-600 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-100 transition-all shadow-sm hover:shadow-md active:scale-90"
                          title="Expunge Trainer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={filteredTrainers.length}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
        />
      </div>

      {/* Trainer Registry Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-6 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-xl rounded-[32px] shadow-premium animate-in zoom-in-95 duration-300 overflow-hidden border border-slate-100">
             <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                <div>
                   <h2 className="text-xl font-bold text-slate-900 tracking-tight">{editingId ? 'Edit Faculty Profile' : 'Establish New Faculty'}</h2>
                   <p className="text-xs text-slate-500 font-medium mt-1">Configure instructional credentials and access protocols.</p>
                </div>
                <button onClick={() => setShowModal(false)} className="w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-100 transition-all shadow-sm">
                   <X className="w-5 h-5" />
                </button>
             </div>

             <form onSubmit={handleSaveTrainer} className="p-8 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                       <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-2.5 ml-1 block">Legal First Name</label>
                       <div className="relative">
                         <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                         <input type="text" required value={formData.first_name} onChange={e => setFormData({ ...formData, first_name: e.target.value })} className="w-full pl-11 pr-4 py-3 bg-white border border-slate-300 rounded-md focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all outline-none text-sm font-medium text-slate-900 shadow-sm" />
                       </div>
                    </div>
                    <div>
                       <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-2.5 ml-1 block">Family Surname</label>
                       <div className="relative">
                         <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                         <input type="text" required value={formData.last_name} onChange={e => setFormData({ ...formData, last_name: e.target.value })} className="w-full pl-11 pr-4 py-3 bg-white border border-slate-300 rounded-md focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all outline-none text-sm font-medium text-slate-900 shadow-sm" />
                       </div>
                    </div>
                </div>                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div>
                        <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-2.5 ml-1 block">Official Email Terminal</label>
                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                          <input type="email" required value={formData.email} disabled={!!editingId} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full pl-11 pr-4 py-3 bg-white border border-slate-300 rounded-md focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all outline-none text-sm font-medium text-slate-900 shadow-sm disabled:opacity-50" />
                        </div>
                     </div>
                     {!editingId && (
                       <div>
                         <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-2.5 ml-1 block">Secure Access Key</label>
                         <div className="relative">
                           <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                           <input type="password" required value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} className="w-full pl-11 pr-4 py-3 bg-white border border-slate-300 rounded-md focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all outline-none text-sm font-medium text-slate-900 shadow-sm" />
                         </div>
                       </div>
                     )}
                 </div>


                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="ag-btn ag-btn-outline grow !rounded-2xl py-4 !font-bold uppercase tracking-widest text-[10px]"
                  >
                    Abort
                  </button>
                  <button
                    type="submit"
                    className="ag-btn ag-btn-primary grow !rounded-2xl py-4 !font-bold shadow-lg"
                  >
                    {editingId ? 'Push Manifest Updates' : 'Commit Enrollment'}
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

export default CreateStaff;
