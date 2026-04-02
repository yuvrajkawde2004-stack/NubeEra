import { useState, useEffect } from 'react';
import { Search, Edit, Trash2, Mail, GraduationCap, Award, X, Lock, ChevronDown, User as UserIcon, Building } from 'lucide-react';
import { toast } from 'sonner';
import api from '../services/api';
import ConfirmModal from '../components/ConfirmModal';
import Pagination from '../components/Pagination';
import { useConfirm } from '../hooks/useConfirm';
import { useEscapeKey } from '../hooks/useEscapeKey';

interface Teacher {
  id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  employee_id: string;
  specialization?: string;
  qualification?: string;
  is_active: boolean;
  school_id: string;
  school_name: string;
}

const Teachers: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
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
    employee_id: '',
    specialization: '',
    qualification: '',
    school_id: '',
    is_active: true
  });
  const [schools, setSchools] = useState<any[]>([]);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      setUser(parsed);
      setFormData(prev => ({ ...prev, school_id: parsed.school_id || '' }));
    }
  }, []);

  useEffect(() => {
    fetchTeachers();
    if (user?.utype === 'admin') {
      fetchSchools();
    }
  }, [user]);

  const fetchSchools = async () => {
    try {
      const resp = await api.get('/schools');
      setSchools(resp.data);
    } catch (e) {
      console.error(e);
    }
  }

  const fetchTeachers = async () => {
    try {
      const response = await api.get('/trainers');
      setTeachers(response.data);
    } catch (error) {
      console.error('Failed to fetch teachers', error);
      toast.error('Failed to synchronize trainer registry');
    } finally {
      setIsLoading(false);
    }
  };

  const { confirmState, requestConfirm } = useConfirm();

  const handleDelete = async (id: string, name: string) => {
    const ok = await requestConfirm({ 
      title: 'Deauthorize Trainer', 
      message: `Confirm removal of system access for "${name}"? This action will archive their instructional profile.`, 
      confirmLabel: 'Archive Trainer', 
      variant: 'danger' 
    });
    if (!ok) return;
    try {
      await api.delete(`/trainers/${id}`);
      toast.success('Trainer deauthorized');
      fetchTeachers();
    } catch (error) {
      toast.error('Deauthorization protocol failed');
    }
  };

  const handleEdit = (teacher: Teacher) => {
    setEditingId(teacher.id);
    setFormData({
      first_name: teacher.first_name,
      last_name: teacher.last_name,
      email: teacher.email,
      password: '',
      employee_id: teacher.employee_id,
      specialization: teacher.specialization || '',
      qualification: teacher.qualification || '',
      school_id: teacher.school_id || user?.school_id || '',
      is_active: teacher.is_active
    });
    setShowModal(true);
  };

  const handleSaveTeacher = async (e: React.FormEvent) => {
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
        toast.success('Trainer added to faculty!');
      }
      setShowModal(false);
      resetForm();
      fetchTeachers();
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
      employee_id: '',
      specialization: '',
      qualification: '',
      school_id: user?.school_id || '',
      is_active: true
    });
  };

  const filteredTeachers = teachers.filter(teacher =>
    teacher.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredTeachers.length / pageSize);
  const paginatedTeachers = filteredTeachers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  useEscapeKey(() => setShowModal(false), showModal);

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-12">
      
      {/* Search & Action Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="relative w-full sm:w-96 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 w-4 h-4 group-focus-within:text-indigo-500 transition-colors" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by faculty name or email..."
            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm text-slate-900 focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/5 transition-all shadow-sm placeholder:text-slate-600"
          />
        </div>
        <button 
          onClick={() => { resetForm(); setShowModal(true); }} 
          className="ag-btn ag-btn-primary !rounded-full px-6 shadow-md"
        >
          <GraduationCap className="w-4 h-4" />
          <span>Register Trainer</span>
        </button>
      </div>

      {/* Teachers Table Container */}
      <div className="ag-table-container shadow-premium border-slate-100">
        <div className="overflow-x-auto">
          <table className="ag-table">
            <thead>
              <tr>
                <th></th>
                <th></th>
                <th></th>
                <th></th>
                <th className="text-right"></th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-24 text-center">
                    <div className="w-10 h-10 border-2 border-indigo-500/10 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-600 text-[10px] font-bold uppercase tracking-[0.2em]">Mobilizing faculty registry...</p>
                  </td>
                </tr>
              ) : paginatedTeachers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-24 text-center">
                    <div className="max-w-xs mx-auto opacity-40">
                       <Search className="w-12 h-12 mx-auto text-slate-700 mb-4" />
                       <p className="text-slate-500 text-sm font-medium">No results matched your faculty search.</p>
                       <button onClick={() => setSearchTerm('')} className="mt-4 text-[10px] font-bold text-indigo-600 uppercase tracking-widest hover:underline">Clear Search Filter</button>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedTeachers.map((teacher) => (
                  <tr key={teacher.id} className="group">
                    <td>
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-600 font-bold text-[10px] shadow-sm group-hover:bg-indigo-50 group-hover:text-indigo-600 group-hover:border-indigo-100 transition-all uppercase">
                           {(teacher.first_name?.[0] || '')}{(teacher.last_name?.[0] || '')}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-900 tracking-tight">{teacher.full_name}</span>
                          <span className="text-[11px] text-slate-500 font-medium mt-0.5">{teacher.email}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 text-slate-600 text-[10px] font-bold uppercase tracking-widest rounded-lg border border-slate-100 group-hover:border-indigo-100 group-hover:bg-indigo-50/30 group-hover:text-indigo-600 transition-all">
                        {teacher.employee_id}
                      </div>
                    </td>
                    <td>
                      <div className="flex flex-col">
                        <span className="text-xs text-slate-700 font-bold uppercase tracking-tight">{teacher.specialization || 'Core Faculty'}</span>
                        <span className="text-[10px] text-slate-600 font-bold uppercase italic mt-0.5 tracking-wider">{teacher.qualification || 'Certified Expert'}</span>
                      </div>
                    </td>
                    <td>
                       <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border ${teacher.is_active ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${teacher.is_active ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 'bg-slate-300'}`} />
                          {teacher.is_active ? 'Active Status' : 'Deauthorized'}
                       </div>
                    </td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-0 translate-x-4">
                        <button 
                          onClick={() => handleEdit(teacher)} 
                          className="w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 hover:border-indigo-100 transition-all shadow-sm"
                          title="Refine Profile"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(teacher.id, teacher.full_name)} 
                          className="w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-100 transition-all shadow-sm"
                          title="Deauthorize Faculty"
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
          totalItems={filteredTeachers.length}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
        />
      </div>

      {/* Trainer Configuration Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-6 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-3xl rounded-[32px] shadow-premium animate-in zoom-in-95 duration-300 overflow-hidden border border-slate-100">
             <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight">{editingId ? 'Refine Trainer Profile' : 'Enroll New Faculty'}</h2>
                  <p className="text-xs text-slate-500 font-medium mt-1">Configure instructional identifiers and access protocols.</p>
                </div>
                <button onClick={() => setShowModal(false)} className="w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-100 transition-all shadow-sm">
                   <X className="w-5 h-5" />
                </button>
             </div>

             <form onSubmit={handleSaveTeacher} className="p-8 space-y-8 max-h-[75vh] overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div>
                      <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-2.5 ml-1 block">Given Name</label>
                      <div className="relative">
                        <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-700" />
                        <input type="text" required value={formData.first_name} onChange={e => setFormData({ ...formData, first_name: e.target.value })} className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:border-indigo-500 focus:bg-white transition-all outline-none text-sm font-medium text-slate-900" />
                      </div>
                   </div>
                   <div>
                      <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-2.5 ml-1 block">Family Name</label>
                      <div className="relative">
                        <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-700" />
                        <input type="text" required value={formData.last_name} onChange={e => setFormData({ ...formData, last_name: e.target.value })} className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:border-indigo-500 focus:bg-white transition-all outline-none text-sm font-medium text-slate-900" />
                      </div>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div>
                      <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-2.5 ml-1 block">Instructional Email</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-700" />
                        <input type="email" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:border-indigo-500 focus:bg-white transition-all outline-none text-sm font-medium text-slate-900" />
                      </div>
                   </div>
                   <div>
                      <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-2.5 ml-1 block">Faculty ID Code</label>
                      <div className="relative">
                        <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-700" />
                        <input type="text" required value={formData.employee_id} onChange={e => setFormData({ ...formData, employee_id: e.target.value })} className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:border-indigo-500 focus:bg-white transition-all outline-none text-sm font-bold text-slate-700 tracking-widest disabled:opacity-50" disabled={!!editingId} />
                      </div>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div>
                      <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-2.5 ml-1 block">Core Specialization</label>
                      <div className="relative">
                        <Award className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-700" />
                        <input type="text" value={formData.specialization} onChange={e => setFormData({ ...formData, specialization: e.target.value })} className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:border-indigo-500 focus:bg-white transition-all outline-none text-sm font-medium text-slate-900" placeholder="e.g. Cognitive Neural Networks" />
                      </div>
                   </div>
                   <div>
                      <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-2.5 ml-1 block">Professional Credential</label>
                      <div className="relative">
                        <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-700" />
                        <input type="text" value={formData.qualification} onChange={e => setFormData({ ...formData, qualification: e.target.value })} className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:border-indigo-500 focus:bg-white transition-all outline-none text-sm font-medium text-slate-900" placeholder="e.g. PhD in Architecture" />
                      </div>
                   </div>
                </div>

                {!editingId && (
                  <div>
                    <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-2.5 ml-1 block">Establish Access Key</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-700" />
                      <input type="password" required value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:border-indigo-500 focus:bg-white transition-all outline-none text-sm font-medium text-slate-900" placeholder="••••••••" />
                    </div>
                  </div>
                )}

                {user?.utype === 'admin' && (
                  <div>
                    <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-2.5 ml-1 block">Institutional Hub</label>
                    <div className="relative group">
                      <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-700 group-focus-within:text-indigo-500 transition-colors" />
                      <select
                        required
                        value={formData.school_id}
                        onChange={e => setFormData({ ...formData, school_id: e.target.value })}
                        className="w-full pl-11 pr-10 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:border-indigo-500 focus:bg-white transition-all outline-none text-sm font-bold text-slate-700 appearance-none cursor-pointer"
                      >
                        <option value="">Authorize Hub</option>
                        {schools.map(school => (
                          <option key={school.id} value={school.id}>{school.name}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 pointer-events-none" />
                    </div>
                  </div>
                )}

                <div className="flex gap-4 pt-4 border-t border-slate-50 mt-4">
                  <button type="button" onClick={() => setShowModal(false)} className="ag-btn ag-btn-outline grow !rounded-2xl py-4 !font-bold uppercase tracking-widest text-[10px]">Decline</button>
                  <button type="submit" className="ag-btn ag-btn-primary grow !rounded-2xl py-4 !font-bold shadow-lg">
                    {editingId ? 'Push Manifest Updates' : 'Commit Faculty Registration'}
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

export default Teachers;
