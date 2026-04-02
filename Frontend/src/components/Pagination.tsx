import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
}) => {
  if (totalItems === 0) return null;

  const pageSizes = [10, 20, 30, 50, 100];
  
  // Calculate range of data currently shown
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-6 py-6 px-8 bg-white/80 backdrop-blur-md border-t border-slate-100 transition-all">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
           <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest hidden lg:inline">Records per cycle:</span>
           <div className="relative group">
              <select
                value={pageSize}
                onChange={(e) => onPageSizeChange(Number(e.target.value))}
                className="bg-slate-50 border border-slate-100 rounded-xl px-3 py-1.5 text-[10px] font-bold text-slate-700 outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/5 transition-all cursor-pointer appearance-none min-w-[70px] text-center shadow-sm"
              >
                {pageSizes.map(size => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
              <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                 <ChevronRight className="w-3 h-3 rotate-90" />
              </div>
           </div>
        </div>
        <div className="h-4 w-px bg-slate-100 mx-2"></div>
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
           Showing <span className="text-slate-900 font-extrabold">{startItem}—{endItem}</span> of <span className="text-indigo-600 font-extrabold">{totalItems}</span>
        </span>
      </div>

      <div className="flex items-center gap-2 bg-slate-50/50 p-1.5 rounded-2xl border border-slate-100 shadow-inner">
        <div className="flex items-center">
           <button
             onClick={() => onPageChange(1)}
             disabled={currentPage === 1}
             className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-600 hover:text-indigo-600 hover:bg-white disabled:opacity-30 disabled:hover:bg-transparent transition-all shadow-sm hover:shadow-md"
             title="First Logic Node"
           >
             <ChevronsLeft className="w-4 h-4" />
           </button>
           
           <button
             onClick={() => onPageChange(currentPage - 1)}
             disabled={currentPage === 1}
             className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-600 hover:text-indigo-600 hover:bg-white disabled:opacity-30 disabled:hover:bg-transparent transition-all shadow-sm hover:shadow-md"
             title="Previous Node"
           >
             <ChevronLeft className="w-4 h-4" />
           </button>
        </div>

        <div className="flex items-center gap-2 mx-1.5">
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter(pageNum => {
              if (totalPages <= 5) return true;
              if (pageNum === 1 || pageNum === totalPages) return true;
              return Math.abs(pageNum - currentPage) <= 1;
            })
            .map((pageNum, idx, arr) => {
              const showEllipsis = idx > 0 && pageNum - arr[idx - 1] > 1;
              return (
                <React.Fragment key={pageNum}>
                  {showEllipsis && <span className="text-slate-400 font-bold px-1.5 text-[10px] tracking-widest">...</span>}
                  <button
                    onClick={() => onPageChange(pageNum)}
                    className={`min-w-[40px] h-10 flex items-center justify-center rounded-xl text-[10px] font-black tracking-widest transition-all shadow-sm ${
                      currentPage === pageNum
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                        : 'bg-white text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 border border-slate-100 hover:border-indigo-100'
                    }`}
                  >
                    {pageNum}
                  </button>
                </React.Fragment>
              );
            })
          }
        </div>

        <div className="flex items-center">
           <button
             onClick={() => onPageChange(currentPage + 1)}
             disabled={currentPage === totalPages}
             className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-600 hover:text-indigo-600 hover:bg-white disabled:opacity-30 disabled:hover:bg-transparent transition-all shadow-sm hover:shadow-md"
             title="Next Node"
           >
             <ChevronRight className="w-4 h-4" />
           </button>

           <button
             onClick={() => onPageChange(totalPages)}
             disabled={currentPage === totalPages}
             className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-600 hover:text-indigo-600 hover:bg-white disabled:opacity-30 disabled:hover:bg-transparent transition-all"
             title="Final Node"
           >
             <ChevronsRight className="w-4 h-4" />
           </button>
        </div>
      </div>
    </div>
  );
};

export default Pagination;
