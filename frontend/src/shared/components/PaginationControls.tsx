import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems: number;
  pageSize: number;
}

export function PaginationControls({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  pageSize,
}: PaginationControlsProps) {
  if (totalPages <= 1) return null;

  const startIdx = (currentPage - 1) * pageSize + 1;
  const endIdx = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="px-8 py-5 border-t border-[var(--border-primary)] bg-[var(--bg-primary)]/10 flex items-center justify-between relative z-10 transition-colors duration-300">
      <div className="flex items-center gap-3">
        <span className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest">
          Mostrando <span className="text-[var(--text-primary)] tabular-nums">{startIdx} - {endIdx}</span> de <span className="text-[var(--text-primary)] tabular-nums">{totalItems}</span> registros
        </span>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 bg-[var(--bg-secondary)]/[0.3] border border-[var(--border-primary)] rounded-xl text-[var(--text-secondary)] hover:text-indigo-400 hover:border-indigo-500/50 disabled:opacity-20 disabled:cursor-not-allowed transition-all active:scale-90"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-1">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`min-w-[32px] h-8 rounded-lg text-[10px] font-black transition-all ${
                p === currentPage
                  ? 'bg-indigo-600 text-[var(--text-primary)] shadow-lg shadow-indigo-900/40'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-primary)]/40 hover:text-[var(--text-primary)]'
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 bg-[var(--bg-secondary)]/[0.3] border border-[var(--border-primary)] rounded-xl text-[var(--text-secondary)] hover:text-indigo-400 hover:border-indigo-500/50 disabled:opacity-20 disabled:cursor-not-allowed transition-all active:scale-90"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
