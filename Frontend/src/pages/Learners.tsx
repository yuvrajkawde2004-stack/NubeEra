import { useState, useEffect } from 'react';
import { Search, Edit, Trash2, X, Zap, User as UserIcon, Mail, Phone, Lock, RefreshCw, Users } from 'lucide-react';
import { toast } from 'sonner';
import api from '../services/api';
import ConfirmModal from '../components/ConfirmModal';
import Pagination from '../components/Pagination';
import { useConfirm } from '../hooks/useConfirm';
import { useEscapeKey } from '../hooks/useEscapeKey';

interface Learner {
  id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  learner_id: string;
  phone?: string;
  is_active: boolean;
  enrollment_date?: string;
}

const Learners: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const isStaffOrTrainer = user?.utype !== 'learner' && user?.utype !== 'student';

  const [learners, setLearners] = useState<Learner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) setUser(JSON.parse(savedUser));
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data } = await api.get('/learners');
      setLearners(data);
    } catch (error: any) {
      console.error('Critical registry synchronization failure:', error);
      const status = error?.response?.status;
      if (status === 500) {
        toast.error('Internal System Error: The registry logic encountered a conflict. Our engineers have been alerted.');
      } else {
        toast.error('Failed to synchronize learner registry. Connection unstable.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    learner_id: '',
    phone: '',
    password: '',
    is_active: true
  });

  const handleSaveLearner = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formData
    };

    try {
      if (editingId) {
        await api.put(`/learners/${editingId}`, payload);
        toast.success('Learner profile updated');
      } else {
        await api.post('/learners', payload);
        toast.success('New learner enrolled in system');
      }
      setShowModal(false);
      resetForm();
      fetchData();
    } catch (error: any) {
       toast.error(error?.response?.data?.message || 'Protocol failure. Please audit your inputs.');
    }
  };

  const { confirmState, requestConfirm } = useConfirm();

  const handleDelete = async (id: string, name: string) => {
    const ok = await requestConfirm({ 
      title: 'Deauthorize Access', 
      message: `Confirm removal of system access for "${name}"? This action will archive their learning trajectory.`, 
      confirmLabel: 'Archive Access', 
      variant: 'danger' 
    });
    if (!ok) return;
    try {
      await api.delete(`/learners/${id}`);
      toast.success('Resident deauthorized');
      fetchData();
    } catch (error) {
      toast.error('Deauthorization protocol failed');
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      first_name: '',
      last_name: '',
      email: '',
      learner_id: `L-${Math.floor(1000 + Math.random() * 9000)}`,
      phone: '',
      password: '',
      is_active: true
    });
  };

  const filteredLearners = learners.filter(l =>
    l.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.learner_id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredLearners.length / pageSize);
  const paginatedLearners = filteredLearners.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  useEffect(() => { setCurrentPage(1); }, [searchTerm, pageSize]);

  useEscapeKey(() => setShowModal(false), showModal);

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-12">
      
      {/* Statistical Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 border-b border-slate-100">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
             <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                <Users className="w-6 h-6" />
             </div>
             <h1 className="text-3xl font-black text-slate-900 tracking-tight">Active Learners</h1>
          </div>
          <p className="text-slate-500 font-medium pl-15">
            Monitoring <span className="text-indigo-600 font-bold">{learners.filter(l => l.is_active).length} active</span> nodes across the enterprise registry.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => { setIsLoading(true); fetchData(); }} 
            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 text-xs font-bold uppercase tracking-widest hover:bg-slate-50 hover:text-indigo-600 transition-all shadow-sm active:scale-95"
            disabled={isLoading}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-indigo-500' : ''}`} />
            <span>Refresh Registry</span>
          </button>
          
          {isStaffOrTrainer && (
            <button 
              onClick={() => { resetForm(); setShowModal(true); }} 
              className="ag-btn ag-btn-primary !rounded-xl !px-6 shadow-xl shadow-indigo-100"
            >
              <Zap className="w-4 h-4" />
              <span>Enroll New Intelligence</span>
            </button>
          )}
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="relative w-full sm:w-96 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 w-4 h-4 group-focus-within:text-indigo-500 transition-colors" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, email or learner ID..."
            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm text-slate-900 focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/5 transition-all shadow-sm placeholder:text-slate-600"
          />
        </div>
      </div>

      {/* Learners Table container */}
      <div className="ag-table-container shadow-premium border-slate-100">
        <div className="overflow-x-auto">
          <table className="ag-table">
            <thead>
              <tr>
                <th></th>
                <th></th>
                <th></th>
                <th className="text-right"></th>
              </tr>
            </thead>
            <tbody>
               {isLoading ? (
                 <tr>
                   <td colSpan={4} className="py-24 text-center">
                     <div className="w-10 h-10 border-2 border-indigo-500/10 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4"></div>
                     <p className="text-slate-600 text-[10px] font-bold uppercase tracking-[0.2em]">Mobilizing registry...</p>
                   </td>
                 </tr>
                ) : paginatedLearners.length === 0 ? (
                 <tr>
                   <td colSpan={4} className="py-24 text-center">
                     <div className="max-w-xs mx-auto opacity-40">
                       <Search className="w-12 h-12 mx-auto text-slate-700 mb-4" />
                       <p className="text-slate-500 text-sm font-medium">No learners found matching your criteria.</p>
                       <button onClick={() => setSearchTerm('')} className="mt-4 text-[10px] font-bold text-indigo-600 uppercase tracking-widest hover:underline">Reset Search Hub</button>
                     </div>
                   </td>
                 </tr>
                ) : (
                paginatedLearners.map((l) => (
                  <tr key={l.id} className="group">
                    <td>
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-600 font-bold text-[10px] shadow-sm group-hover:bg-indigo-50 group-hover:text-indigo-600 group-hover:border-indigo-100 transition-all uppercase">
                           {(l.first_name?.[0] || '')}{(l.last_name?.[0] || '')}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-900 tracking-tight">{l.full_name}</span>
                          <span className="text-[11px] text-slate-500 font-medium mt-0.5">{l.email}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 text-slate-600 text-[10px] font-bold uppercase tracking-widest rounded-lg border border-slate-100 group-hover:border-indigo-100 group-hover:bg-indigo-50/30 group-hover:text-indigo-600 transition-all">
                        {l.learner_id}
                      </div>
                    </td>
                    <td>
                       <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border ${l.is_active ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${l.is_active ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 'bg-slate-300'}`} />
                          {l.is_active ? 'Active Path' : 'Suspended'}
                       </div>
                    </td>
                    <td className="text-right">
                      {isStaffOrTrainer && (
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-0 translate-x-4">
                          <button 
                            onClick={() => { setEditingId(l.id); setFormData({ ...l, learner_id: l.learner_id, password: '' } as any); setShowModal(true); }} 
                            className="w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 hover:border-indigo-100 transition-all shadow-sm"
                            title="Refine Profile"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(l.id, l.full_name)} 
                            className="w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-100 transition-all shadow-sm"
                            title="Deauthorize Access"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <Pagination currentPage={currentPage} totalPages={totalPages} pageSize={pageSize} totalItems={filteredLearners.length} onPageChange={setCurrentPage} onPageSizeChange={setPageSize} />
      </div>

      {/* Learner Profile Configuration Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-6 animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-2xl rounded-[32px] shadow-premium animate-in zoom-in-95 duration-300 overflow-hidden border border-slate-100">
             <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight">{editingId ? 'Refine Learner Profile' : 'Enroll New Intelligence'}</h2>
                  <p className="text-xs text-slate-500 font-medium mt-1">Configure identity parameters and access credentials.</p>
                </div>
                <button onClick={() => setShowModal(false)} className="w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-100 transition-all shadow-sm">
                   <X className="w-5 h-5" />
                </button>
             </div>
             <form onSubmit={handleSaveLearner} className="p-8 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
                      <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-3 ml-1 block">Given Name</label>
                      <div className="relative">
                        <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input type="text" required value={formData.first_name} onChange={e => setFormData({...formData, first_name: e.target.value})} className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 transition-all outline-none text-sm font-medium text-slate-900" placeholder="Enter first name" />
                      </div>
                   </div>
                   <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
                      <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-3 ml-1 block">Family Name</label>
                      <div className="relative">
                        <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input type="text" required value={formData.last_name} onChange={e => setFormData({...formData, last_name: e.target.value})} className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 transition-all outline-none text-sm font-medium text-slate-900" placeholder="Enter last name" />
                      </div>
                   </div>
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
                   <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-3 ml-1 block">Email Address</label>
                   <div className="relative">
                     <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                     <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 transition-all outline-none text-sm font-medium text-slate-900" placeholder="Enter email address" />
                   </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
                      <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-3 ml-1 block">Password</label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input type="password" required={!editingId} value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 transition-all outline-none text-sm font-medium text-slate-900" placeholder={editingId ? '••••••••' : 'Enter password'} />
                      </div>
                   </div>
                   <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
                      <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-3 ml-1 block">Contact No.</label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 transition-all outline-none text-sm font-medium text-slate-900" placeholder="+1 (000) 000-0000" />
                      </div>
                   </div>
                </div>
                
                 <div className="flex gap-4 pt-4">
                    <button type="button" onClick={() => setShowModal(false)} className="ag-btn ag-btn-outline grow !rounded-2xl py-4 !font-bold uppercase tracking-widest text-[10px]">Abandon</button>
                    <button type="submit" className="ag-btn ag-btn-primary grow !rounded-2xl py-4 !font-bold shadow-lg">
                       {editingId ? 'Push Profile Updates' : 'Commit Enrollment'}
                    </button>
                 </div>
             </form>
           </div>
        </div>
      )}
      
      <ConfirmModal 
        open={confirmState.open} 
        title={confirmState.title ?? 'Confirm Action'} 
        message={confirmState.message ?? ''} 
        confirmLabel={confirmState.confirmLabel} 
        cancelLabel={confirmState.cancelLabel} 
        variant={confirmState.variant as any} 
        onConfirm={() => confirmState.resolve?.(true)} 
        onCancel={() => confirmState.resolve?.(false)} 
      />
    </div>
  );
};

export default Learners;
