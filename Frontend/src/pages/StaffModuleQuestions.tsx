import { useState, useEffect } from 'react';
import { Trash2, Search, List, CheckCircle, Layout } from 'lucide-react';
import { toast } from 'sonner';
import api from '../services/api';
import Pagination from '../components/Pagination';
import ConfirmModal from '../components/ConfirmModal';
import { useConfirm } from '../hooks/useConfirm';

interface QuestionData {
  id: string;
  exam_id: string;
  exam_title?: string;
  module_id?: string;
  module_name?: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
  is_active: boolean;
}

const StaffModuleQuestions: React.FC = () => {
  const [questions, setQuestions] = useState<QuestionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const questionsRes = await api.get('/questions');
      setQuestions(questionsRes.data);
    } catch (error) {
       console.error('Data loading failure', error);
       toast.error('Failed to synchronize assessment bank');
    } finally {
      setLoading(false);
    }
  };

  const { confirmState, requestConfirm } = useConfirm();

  const handleDelete = async (id: string) => {
    const ok = await requestConfirm({ 
      title: 'Expunge Question', 
      message: 'Confirm permanent removal of this question from the bank? This action will archive this logic node.', 
      confirmLabel: 'Expunge', 
      variant: 'danger' 
    });
    if (!ok) return;
    try {
      await api.delete(`/questions/${id}`);
      toast.success('Question expunged');
      fetchData();
    } catch {
      toast.error('Expunge protocol failed');
    }
  };

  const filteredQuestions = questions.filter(q =>
    q.question_text?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    q.module_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredQuestions.length / pageSize);
  const paginatedQuestions = filteredQuestions.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  useEffect(() => { setCurrentPage(1); }, [searchTerm]);

  return (
    <div className="space-y-10 animate-in fade-in duration-1000 pb-16">
      
      {/* Header & Toggle Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex flex-col gap-1">
           <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Assessment Registry</h2>
           <p className="text-sm text-slate-500 font-medium">Review and manage instructional query logic bank.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-center">
           <div className="flex p-1.5 bg-slate-50 border border-slate-100 rounded-2xl shadow-sm">
               <div className="flex items-center gap-2 px-6 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest bg-white text-indigo-600 shadow-sm border border-slate-100">
                   <List className="w-3.5 h-3.5" /> <span>Registry</span>
               </div>
           </div>
           
          <div className="relative w-full sm:w-80 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 w-4 h-4 group-focus-within:text-indigo-500 transition-colors" />
              <input 
                type="text" 
                value={searchTerm} 
                onChange={e => setSearchTerm(e.target.value)} 
                placeholder="Filter logic bank..." 
                className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm text-slate-900 focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/5 transition-all shadow-sm placeholder:text-slate-600" 
              />
          </div>
        </div>
      </div>

      <div className="ag-table-container shadow-premium border-slate-100">
        <div className="overflow-x-auto">
          <table className="ag-table">
            <thead>
              <tr>
                <th>Track</th>
                <th>Instructional Query</th>
                <th>Verified Result</th>
                <th className="text-right">Controls</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                  <tr>
                    <td colSpan={4} className="py-24 text-center">
                      <div className="w-10 h-10 border-2 border-indigo-500/10 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4"></div>
                      <p className="text-slate-600 text-[10px] font-bold uppercase tracking-[0.2em]">Synching bank...</p>
                    </td>
                  </tr>
              ) : paginatedQuestions.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-24 text-center">
                      <div className="max-w-xs mx-auto opacity-40">
                          <Layout className="w-12 h-12 mx-auto text-slate-800 mb-6" />
                          <p className="text-slate-500 text-sm font-medium">No instructional queries identified.</p>
                      </div>
                    </td>
                  </tr>
              ) : (
                paginatedQuestions.map((q) => (
                  <tr key={q.id} className="group">
                    <td>
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-50 rounded-lg border border-slate-100 text-[10px] font-bold text-slate-600 group-hover:bg-indigo-50 group-hover:text-indigo-600 group-hover:border-indigo-100 transition-all uppercase tracking-widest">
                          {q.module_name || 'Global'}
                        </div>
                    </td>
                    <td>
                        <div className="text-sm font-bold text-slate-900 tracking-tight line-clamp-2 max-w-xl group-hover:text-indigo-600 transition-colors">{q.question_text}</div>
                    </td>
                    <td>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-[9px] font-bold text-emerald-600 uppercase tracking-widest">
                          <CheckCircle className="w-3 h-3" /> Option {q.correct_answer}
                        </div>
                    </td>
                    <td className="text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
                          <button 
                            onClick={() => handleDelete(q.id)} 
                            className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-50 text-slate-600 hover:text-rose-600 hover:bg-rose-50 border border-transparent transition-all shadow-sm"
                            title="Expunge Node"
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
        <Pagination currentPage={currentPage} totalPages={totalPages} pageSize={pageSize} totalItems={filteredQuestions.length} onPageChange={setCurrentPage} onPageSizeChange={setPageSize} />
      </div>
      <ConfirmModal open={confirmState.open} title={confirmState.title ?? 'Confirm Protocol'} message={confirmState.message ?? ''} confirmLabel={confirmState.confirmLabel} cancelLabel={confirmState.cancelLabel} variant={confirmState.variant as any} onConfirm={() => confirmState.resolve?.(true)} onCancel={() => confirmState.resolve?.(false)} />
    </div>
  );
};

export default StaffModuleQuestions;
