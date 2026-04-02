import React, { useState, useEffect } from 'react';
import { Inbox, Search, CheckCircle, Trash2, Building, Mail } from 'lucide-react';
import api from '../services/api';
import Pagination from '../components/Pagination';
import ConfirmModal from '../components/ConfirmModal';
import { useConfirm } from '../hooks/useConfirm';
import { toast } from 'sonner';

const PendingTeachers: React.FC = () => {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchPending = async () => {
    setLoading(true);
    try {
      const response = await api.get('/trainers');
      // Filter for pending/inactive teachers if API supports it
      const pending = response.data.filter((t: any) => !t.is_active);
      setTeachers(pending);
    } catch (error) {
      console.error('Failed to fetch pending teachers', error);
      toast.error('Failed to synchronize request queue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const { confirmState, requestConfirm } = useConfirm();

  const handleApprove = async (teacher: any) => {
    const ok = await requestConfirm({
      title: 'Authorize Access',
      message: `Confirm identity verification for "${teacher.full_name}"? This will mobilize their instructional profile.`,
      confirmLabel: 'Authorize',
      variant: 'info'
    });
    if (!ok) return;

    try {
      await api.put(`/trainers/${teacher.id}`, {
        ...teacher,
        is_active: true,
        password: 'defaultPassword123' 
      });
      toast.success('Identity authorized successfully');
      fetchPending();
    } catch (error) {
      toast.error('Authorization protocol failure');
    }
  };

  const handleRemove = async (teacher: any) => {
    const ok = await requestConfirm({
      title: 'Decline Request',
      message: `Permanently expunge the request from "${teacher.full_name}"?`,
      confirmLabel: 'Expunge',
      variant: 'danger'
    });
    if (!ok) return;

    try {
      await api.delete(`/trainers/${teacher.id}`);
      toast.success('Request expunged');
      fetchPending();
    } catch (error) {
      toast.error('Expunge protocol failed');
    }
  };

  const filteredTeachers = teachers.filter((teacher: any) =>
    teacher.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.school_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredTeachers.length / pageSize);
  const paginatedTeachers = filteredTeachers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-12">
      
      {/* Title & Action Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-2">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Identity Verification Log</h2>
          <p className="text-sm text-slate-500 font-medium">Review and synchronize new instructional credentials.</p>
        </div>
        
        <div className="flex items-center gap-4">
           <div className="px-5 py-2.5 bg-indigo-50 border border-indigo-100 rounded-full flex items-center gap-3 shadow-sm">
              <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(79,70,229,0.5)]"></div>
              <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-widest">{filteredTeachers.length} Active Requests</span>
           </div>
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
            placeholder="Filter pending request queue..."
            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm text-slate-900 focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/5 transition-all shadow-sm placeholder:text-slate-600"
          />
        </div>
      </div>

      {/* Requests Table Container */}
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
                    <p className="text-slate-600 text-[10px] font-bold uppercase tracking-[0.2em]">Mobilizing request stream...</p>
                  </td>
                </tr>
              ) : filteredTeachers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-24 text-center">
                    <div className="flex flex-col items-center max-w-sm mx-auto">
                      <div className="w-20 h-20 bg-slate-50 rounded-[32px] flex items-center justify-center mb-6 border border-slate-100 shadow-inner">
                        <Inbox className="w-10 h-10 text-slate-800" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 tracking-tight">System Synchronized</h3>
                      <p className="text-slate-500 text-xs mt-2 font-medium">The verification queue is currently empty. No active access requests require intervention.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedTeachers.map((teacher: any, idx: number) => (
                    <tr key={idx} className="group">
                      <td>
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100 group-hover:bg-indigo-50 group-hover:border-indigo-100 transition-all overflow-hidden shadow-sm">
                            <img
                              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${teacher.email || teacher.full_name}`}
                              className="w-full h-full object-cover p-1"
                              alt=""
                            />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 transition-colors text-sm tracking-tight">{teacher.full_name}</p>
                            <p className="text-[10px] text-indigo-600 uppercase font-bold tracking-widest mt-1">Awaiting Authorization</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                           <Mail className="w-3.5 h-3.5 text-slate-700" />
                           <span className="text-[11px] text-slate-600 font-medium">{teacher.email}</span>
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                           <Building className="w-3.5 h-3.5 text-slate-700" />
                           <span className="text-xs text-slate-700 font-bold uppercase tracking-tight">{teacher.school_name || 'Global Grid'}</span>
                        </div>
                      </td>
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-0 translate-x-4">
                           <button
                             onClick={() => handleApprove(teacher)}
                             className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-emerald-600 hover:text-slate-900 transition-all border border-emerald-100 shadow-sm"
                           >
                             <CheckCircle className="w-3.5 h-3.5" />
                             Authorize
                           </button>
                           <button
                             onClick={() => handleRemove(teacher)}
                             className="w-9 h-9 flex items-center justify-center bg-white text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all border border-slate-200 hover:border-rose-100 shadow-sm"
                             title="Expunge Request"
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

export default PendingTeachers;
