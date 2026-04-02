import { useState, useEffect } from 'react';
import { Key, Edit, X, Search, UserPlus, SlidersHorizontal, Mail, User as UserIcon, ChevronDown, Lock, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import api from '../services/api';
import ConfirmModal from '../components/ConfirmModal';
import Pagination from '../components/Pagination';
import { useConfirm } from '../hooks/useConfirm';
import { useEscapeKey } from '../hooks/useEscapeKey';

interface UserData {
  id: string;
  email: string;
  full_name: string;
  first_name: string;
  last_name: string;
  role: string;
  utype: string;
  phone?: string;
  is_active: boolean;
  created_at: string;
}

const Users: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    role: 'Learner',
    is_active: true
  });

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
  }, []);

  useEffect(() => {
    if (currentUser) {
      fetchUsers();
    }
  }, [currentUser]);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data);
    } catch (error) {
      console.error('User list access failure:', error);
      toast.error('Failed to load portal residents');
    } finally {
      setLoading(false);
    }
  };

  const { confirmState, requestConfirm } = useConfirm();

  const handleResetPassword = async (user: UserData) => {
    const ok = await requestConfirm({ 
      title: 'Reset Security Key', 
      message: `Confirm password synchronization for "${user.full_name || user.email}"? A temporary protocol will be established.`, 
      confirmLabel: 'Synchronize', 
      cancelLabel: 'Abort', 
      variant: 'warning' 
    });
    if (!ok) return;
    try {
      const res = await api.put(`/users/${user.id}/reset-password`);
      toast.success(res.data.message);
    } catch (error) {
      toast.error('Sync protocol failure');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    const ok = await requestConfirm({ 
      title: 'Expunge Identity', 
      message: `Confirm permanent removal of "${name}"? This action will archive all associated learning logic and access paths.`, 
      confirmLabel: 'Expunge', 
      variant: 'danger' 
    });
    if (!ok) return;
    try {
      await api.delete(`/users/${id}`);
      toast.success('Resident expunged from platform');
      fetchUsers();
    } catch (error) {
       toast.error('Expuge protocol failed');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/users/${editingId}`, {
          first_name: formData.first_name,
          last_name: formData.last_name,
          role: formData.role,
          is_active: formData.is_active
        });
        toast.success('Identity profile updated');
      } else {
        await api.post('/users', {
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          password: formData.password,
          role: formData.role
        });
        toast.success('New resident registered');
      }
      setShowModal(false);
      resetForm();
      fetchUsers();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Protocol failure. Please audit inputs.');
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      first_name: '',
      last_name: '',
      email: '',
      password: '',
      role: 'Learner',
      is_active: true
    });
  };

  const filteredUsers = users.filter(u => {
    const matchesRole = !filterRole || u.role.toLowerCase() === filterRole.toLowerCase();
    const matchesSearch = u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         u.email?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesRole && matchesSearch;
  });

  const totalPages = Math.ceil(filteredUsers.length / pageSize);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [filterRole, searchTerm]);

  useEscapeKey(() => setShowModal(false), showModal);

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-12">
      
      {/* Search & Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
          <div className="relative w-full sm:w-96 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 w-4 h-4 group-focus-within:text-indigo-500 transition-colors" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter by identity or terminal email..."
              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm text-slate-900 focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/5 transition-all shadow-sm placeholder:text-slate-600"
            />
          </div>
          <div className="relative w-full sm:w-56 group">
            <SlidersHorizontal className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 w-3.5 h-3.5 group-focus-within:text-indigo-500 transition-colors" />
            <select
              className="w-full pl-11 pr-10 py-3 bg-white border border-slate-200 rounded-2xl text-[10px] font-bold text-slate-600 uppercase tracking-widest outline-none focus:border-indigo-500/50 shadow-sm transition-all cursor-pointer appearance-none"
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
            >
              <option value="">All Designations</option>
              <option value="Staff">System Staff</option>
              <option value="Trainer">Platform Trainer</option>
              <option value="Learner">Active Learner</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-600 pointer-events-none" />
          </div>
        </div>
        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          className="ag-btn ag-btn-primary !rounded-full px-6 shadow-md"
        >
          <UserPlus className="w-4 h-4" />
          <span>Register Add</span>
        </button>
      </div>

      {/* Users Table */}
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
              {loading ? (
                <tr>
                  <td colSpan={4} className="py-24 text-center">
                    <div className="w-10 h-10 border-2 border-indigo-500/10 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-600 text-[10px] font-bold uppercase tracking-[0.2em]">Synchronizing data...</p>
                  </td>
                </tr>
              ) : paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-24 text-center">
                    <div className="max-w-xs mx-auto opacity-40">
                       <Search className="w-12 h-12 mx-auto text-slate-700 mb-4" />
                       <p className="text-slate-500 text-sm font-medium">No results matched your filter criteria.</p>
                       <button onClick={() => {setSearchTerm(''); setFilterRole('');}} className="mt-4 text-[10px] font-bold text-indigo-600 uppercase tracking-widest hover:underline">Clear Filter Loop</button>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((user) => (
                  <tr key={user.id} className="group">
                    <td>
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-600 font-bold text-xs shadow-sm group-hover:bg-indigo-50 group-hover:text-indigo-600 group-hover:border-indigo-100 transition-all">
                          {(user.first_name?.[0] || user.email?.[0]).toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-900 tracking-tight">{user.full_name || (user.first_name + ' ' + user.last_name)}</span>
                          <span className="text-[11px] text-slate-500 font-medium mt-0.5">{user.email}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                         <span className="px-2.5 py-1 bg-indigo-50 text-indigo-600 text-[9px] font-bold uppercase tracking-widest rounded-md border border-indigo-100/50">
                            {user.role}
                         </span>
                      </div>
                    </td>
                    <td>
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border ${user.is_active ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                         <div className={`w-1.5 h-1.5 rounded-full ${user.is_active ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 'bg-slate-300'}`}></div>
                         {user.is_active ? 'Active Access' : 'Deauthorized'}
                      </div>
                    </td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-0 translate-x-4">
                        <button
                          onClick={() => {
                            setEditingId(user.id);
                            setFormData({
                              first_name: user.first_name,
                              last_name: user.last_name,
                              email: user.email,
                              password: '',
                              role: user.role,
                              is_active: user.is_active
                            });
                            setShowModal(true);
                          }}
                          className="w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 hover:border-indigo-100 transition-all shadow-sm"
                          title="Edit Identity"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleResetPassword(user)}
                          className="w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-amber-600 hover:bg-amber-50 hover:border-amber-100 transition-all shadow-sm"
                          title="Reset Security Protocol"
                        >
                          <Key className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(user.id, user.full_name || user.email)}
                          className="w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-100 transition-all shadow-sm"
                          title="Expunge Resident"
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
          totalItems={filteredUsers.length}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
        />
      </div>

      {/* Identity Configuration Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-6 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-xl rounded-[32px] shadow-premium animate-in zoom-in-95 duration-300 overflow-hidden border border-slate-100">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
              <div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">{editingId ? 'Edit Identity Profile' : 'Register New Resident'}</h2>
                <p className="text-xs text-slate-500 font-medium mt-1">Configure access parameters and personal identifiers.</p>
              </div>
              <button onClick={() => setShowModal(false)} className="w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-100 transition-all shadow-sm">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-2.5 ml-1 block">Legal First Name</label>
                  <div className="relative">
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      required
                      value={formData.first_name}
                      onChange={e => setFormData({ ...formData, first_name: e.target.value })}
                      className="w-full pl-11 pr-4 py-3 bg-white border border-slate-300 rounded-md focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all outline-none text-sm font-medium text-slate-900 shadow-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-2.5 ml-1 block">Family Surname</label>
                  <div className="relative">
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      required
                      value={formData.last_name}
                      onChange={e => setFormData({ ...formData, last_name: e.target.value })}
                      className="w-full pl-11 pr-4 py-3 bg-white border border-slate-300 rounded-md focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all outline-none text-sm font-medium text-slate-900 shadow-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-2.5 ml-1 block">Official Email Terminal</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="email"
                      required
                      disabled={!!editingId}
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      className="w-full pl-11 pr-4 py-3 bg-white border border-slate-300 rounded-md focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all outline-none text-sm font-medium text-slate-900 disabled:opacity-50 shadow-sm"
                    />
                  </div>
                </div>
                {!editingId && (
                  <div>
                    <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-2.5 ml-1 block">Secure Access Key</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        type="password"
                        required
                        value={formData.password}
                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                        className="w-full pl-11 pr-4 py-3 bg-white border border-slate-300 rounded-md focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all outline-none text-sm font-medium text-slate-900 shadow-sm"
                        placeholder="Establish initial protocol"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                   <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-2.5 ml-1 block">Platform Designation</label>
                   <div className="relative group">
                     <SlidersHorizontal className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-500 transition-colors" />
                     <select
                       value={formData.role}
                       onChange={e => setFormData({ ...formData, role: e.target.value })}
                       className="w-full pl-11 pr-10 py-3 bg-white border border-slate-300 rounded-md focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all outline-none text-sm font-medium text-slate-900 shadow-sm appearance-none cursor-pointer"
                     >
                       <option value="Learner">Active Learner</option>
                       <option value="Trainer">Platform Trainer</option>
                       <option value="Staff">System Staff</option>
                     </select>
                     <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                   </div>
                </div>
                {editingId && (
                  <div className="flex flex-col justify-end pb-1">
                    <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-3 ml-1 block">Access Status</label>
                    <label className="relative inline-flex items-center cursor-pointer group w-fit">
                      <input 
                        type="checkbox" 
                        checked={formData.is_active} 
                        onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                        className="sr-only peer" 
                      />
                      <div className="w-12 h-6 bg-slate-100 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-200 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500 shadow-inner"></div>
                      <span className="ml-3 text-sm font-bold text-slate-700">{formData.is_active ? 'ENABLED' : 'DEAUTHORIZED'}</span>
                    </label>
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
                  {editingId ? 'Push Manifest Updates' : 'Commit Registration'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        open={confirmState.open}
        title={confirmState.title ?? 'Confirm Protocol'}
        message={confirmState.message ?? ''}
        confirmLabel={confirmState.confirmLabel}
        cancelLabel={confirmState.cancelLabel}
        variant={confirmState.variant}
        onConfirm={() => confirmState.resolve?.(true)}
        onCancel={() => confirmState.resolve?.(false)}
      />
    </div>
  );
};

export default Users;
