import { Lock, Unlock, Landmark, CreditCard, ChevronRight } from 'lucide-react';

export interface CajaResumen {
  id: number;
  fecha: string;
  saldoInicial: number;
  totalRecaudado: number;
  totalGastado: number;
  estado: 'ABIERTA' | 'CERRADA';
}

interface CajaResumenCardProps {
  caja: CajaResumen | undefined;
  isLoading: boolean;
  onAbrir: () => void;
  onCerrar: () => void;
}

export function CajaResumenCard({ caja, isLoading, onAbrir, onCerrar }: CajaResumenCardProps) {
  const isAbierta = caja?.estado === 'ABIERTA';
  const saldoActual = (caja?.saldoInicial || 0) + (caja?.totalRecaudado || 0) - (caja?.totalGastado || 0);

  if (isLoading) {
    return (
      <div className="h-44 flex items-center justify-center bg-[var(--bg-secondary)]/50 backdrop-blur-xl rounded-[2rem] border border-[var(--border-primary)]/60 animate-pulse">
        <span className="text-slate-600 font-black uppercase text-[10px] tracking-widest">Sincronizando Estado de Bóveda...</span>
      </div>
    );
  }

  return (
    <div className="group relative bg-[#0f172a]/80 backdrop-blur-xl p-8 rounded-[2rem] border border-[var(--border-primary)]/60 shadow-2xl overflow-hidden transition-all duration-500 hover:border-blue-500/30">

      {/* Glow background effect */}
      <div className={`absolute -top-24 -right-24 w-64 h-64 rounded-full blur-[100px] transition-all duration-1000 ${isAbierta ? 'bg-emerald-500/10' : 'bg-rose-500/10'}`} />

      <div className="relative flex flex-col md:flex-row justify-between items-center gap-8">

        <div className="flex gap-6 items-center flex-1">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border transition-all duration-500 ${isAbierta
            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.1)]'
            : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
            }`}>
            {isAbierta ? <Unlock className="w-8 h-8" /> : <Lock className="w-8 h-8" />}
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-black uppercase tracking-widest ${isAbierta ? 'text-emerald-500' : 'text-rose-500'}`}>
                Caja {isAbierta ? 'Operativa' : 'Bloqueada'}
              </span>
              <span className="text-slate-700">•</span>
              <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)]">
                ID SESIÓN: {caja?.id || '---'}
              </span>
            </div>
            <h3 className="text-2xl font-black text-[var(--text-primary)] flex items-center gap-1">
              <span className="text-[var(--text-secondary)]">$</span>
              {saldoActual.toLocaleString()}
            </h3>
            <p className="text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-wider">Disponibilidad en Efectivo</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
          <div className="p-4 bg-[var(--bg-secondary)]/50 rounded-2xl border border-[var(--border-primary)]/60 hover:border-slate-700 transition-colors">
            <div className="flex items-center gap-2 mb-1.5">
              <Landmark className="w-3 h-3 text-[var(--text-secondary)]" />
              <span className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest">Base Inicial</span>
            </div>
            <p className="text-sm font-bold text-[var(--text-primary)]">${(caja?.saldoInicial || 0).toLocaleString()}</p>
          </div>
          <div className="p-4 bg-[var(--bg-secondary)]/50 rounded-2xl border border-[var(--border-primary)]/60 hover:border-slate-700 transition-colors">
            <div className="flex items-center gap-2 mb-1.5">
              <CreditCard className="w-3 h-3 text-blue-400" />
              <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest">Cobros Hoy</span>
            </div>
            <p className="text-sm font-bold text-emerald-400">+ ${(caja?.totalRecaudado || 0).toLocaleString()}</p>
          </div>
        </div>

        <div className="shrink-0 w-full md:w-auto">
          {isAbierta ? (
            <button
              onClick={onCerrar}
              className="w-full md:w-auto group/btn flex items-center justify-center gap-3 bg-white text-black px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all hover:bg-rose-500 hover:text-[var(--text-primary)] active:scale-95 shadow-xl shadow-white/5"
            >
              Arquear y Cerrar
              <ChevronRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
            </button>
          ) : (
            <button
              onClick={onAbrir}
              className="w-full md:w-auto group/btn flex items-center justify-center gap-3 bg-blue-600 text-[var(--text-primary)] px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all hover:bg-blue-500 active:scale-95 shadow-xl shadow-blue-900/40"
            >
              Aperturar Caja
              <ChevronRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
