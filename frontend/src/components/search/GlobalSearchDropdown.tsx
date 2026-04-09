import { useNavigate } from 'react-router-dom';
import { Users, Ship, LayoutGrid, Loader2, SearchX } from 'lucide-react';
import type { SearchResults } from '../../hooks/useGlobalSearch';

interface Props {
  results: SearchResults;
  isLoading: boolean;
  hasResults: boolean;
  isActive: boolean;
  onSelect: () => void;
}

export function GlobalSearchDropdown({ results, isLoading, hasResults, isActive, onSelect }: Props) {
  const navigate = useNavigate();

  if (!isActive) return null;

  const go = (path: string) => {
    navigate(path);
    onSelect();
  };

  return (
    <div className="absolute top-full left-0 right-0 mt-2 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-2xl shadow-2xl shadow-black/40 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center gap-3 px-5 py-4 text-[var(--text-secondary)]">
          <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
          <span className="text-xs font-bold uppercase tracking-widest">Buscando...</span>
        </div>
      )}

      {/* No results */}
      {!isLoading && !hasResults && (
        <div className="flex flex-col items-center gap-2 px-5 py-8 text-[var(--text-secondary)]">
          <SearchX className="w-8 h-8 opacity-30" />
          <span className="text-xs font-bold uppercase tracking-widest opacity-60">Sin resultados</span>
        </div>
      )}

      {/* Clientes */}
      {!isLoading && results.clientes.length > 0 && (
        <section>
          <div className="flex items-center gap-2 px-5 py-2.5 bg-[var(--bg-primary)]/40 border-b border-[var(--border-primary)]">
            <Users className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">Clientes</span>
          </div>
          {results.clientes.map((c) => (
            <button
              key={c.id}
              onClick={() => go(`/clientes/editar/${c.id}`)}
              className="w-full flex items-center gap-4 px-5 py-3.5 hover:bg-indigo-600/10 transition-colors group border-b border-[var(--border-primary)]/30 last:border-0 text-left"
            >
              <div className="w-8 h-8 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                <Users className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-[var(--text-primary)] group-hover:text-indigo-400 transition-colors truncate">{c.nombre}</p>
                <p className="text-[10px] text-[var(--text-secondary)] font-mono">{c.dni} {c.email ? `· ${c.email}` : ''}</p>
              </div>
              <span className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest opacity-40 group-hover:opacity-100 transition-opacity shrink-0">Ver →</span>
            </button>
          ))}
        </section>
      )}

      {/* Embarcaciones */}
      {!isLoading && results.embarcaciones.length > 0 && (
        <section>
          <div className="flex items-center gap-2 px-5 py-2.5 bg-[var(--bg-primary)]/40 border-b border-[var(--border-primary)]">
            <Ship className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.2em]">Embarcaciones</span>
          </div>
          {results.embarcaciones.map((e) => (
            <button
              key={e.id}
              onClick={() => go(`/embarcaciones/editar/${e.id}`)}
              className="w-full flex items-center gap-4 px-5 py-3.5 hover:bg-cyan-600/10 transition-colors group border-b border-[var(--border-primary)]/30 last:border-0 text-left"
            >
              <div className="w-8 h-8 rounded-xl bg-cyan-600/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
                <Ship className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-[var(--text-primary)] group-hover:text-cyan-400 transition-colors truncate">{e.nombre}</p>
                <p className="text-[10px] text-[var(--text-secondary)] font-mono">{e.matricula} · {e.tipo}</p>
              </div>
              <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                e.estado === 'EN_AGUA' ? 'text-emerald-400 bg-emerald-500/10' :
                e.estado === 'EN_CUNA' ? 'text-slate-400 bg-slate-500/10' :
                'text-amber-400 bg-amber-500/10'
              }`}>{e.estado}</span>
            </button>
          ))}
        </section>
      )}

      {/* Racks */}
      {!isLoading && results.racks.length > 0 && (
        <section>
          <div className="flex items-center gap-2 px-5 py-2.5 bg-[var(--bg-primary)]/40 border-b border-[var(--border-primary)]">
            <LayoutGrid className="w-3.5 h-3.5 text-violet-400" />
            <span className="text-[10px] font-black text-violet-400 uppercase tracking-[0.2em]">Racks / Cunas</span>
          </div>
          {results.racks.map((r) => (
            <button
              key={r.id}
              onClick={() => go(`/infraestructura?rack=${encodeURIComponent(r.codigo)}`)}
              className="w-full flex items-center gap-4 px-5 py-3.5 hover:bg-violet-600/10 transition-colors group border-b border-[var(--border-primary)]/30 last:border-0 text-left"
            >
              <div className="w-8 h-8 rounded-xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center shrink-0">
                <LayoutGrid className="w-4 h-4 text-violet-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-[var(--text-primary)] group-hover:text-violet-400 transition-colors">{r.codigo}</p>
                <p className="text-[10px] text-[var(--text-secondary)]">Rack #{r.id}</p>
              </div>
              <span className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest opacity-40 group-hover:opacity-100 transition-opacity shrink-0">Ver →</span>
            </button>
          ))}
        </section>
      )}
    </div>
  );
}
