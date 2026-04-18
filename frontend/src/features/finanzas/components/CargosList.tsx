import { MoreVertical, CreditCard } from 'lucide-react';

export interface Cargo {
  id: number;
  descripcion: string;
  monto: number;
  fechaEmision: string;
  pagado: boolean;
  cliente: {
    id: number;
    nombre: string;
  };
}

interface CargosListProps {
  cargos: Cargo[];
  isLoading: boolean;
  onCobrar?: (cargo: Cargo) => void;
}

export function CargosList({ cargos, isLoading, onCobrar }: CargosListProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-[var(--border-primary)]/60 bg-[var(--bg-secondary)]/20">
            <th className="px-8 py-5 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em]">Cliente / Deudor</th>
            <th className="px-8 py-5 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em]">Concepto de Cargo</th>
            <th className="px-8 py-5 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em]">Emisión</th>
            <th className="px-8 py-5 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em]">Estado</th>
            <th className="px-8 py-5 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] text-right">Monto Neto</th>
            <th className="px-8 py-5"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/40">
          {isLoading ? (
            <tr><td colSpan={6} className="px-8 py-20 text-center text-slate-600 font-bold bg-[var(--bg-secondary)]/20">Sincronizando registros...</td></tr>
          ) : cargos.length === 0 ? (
            <tr><td colSpan={6} className="px-8 py-20 text-center text-slate-600 font-bold bg-[var(--bg-secondary)]/20">No se detectaron cargos pendientes.</td></tr>
          ) : (
            cargos.map((cargo) => (
              <tr key={cargo.id} className="group hover:bg-slate-800/30 transition-all cursor-default">
                <td className="px-8 py-5">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-[var(--text-primary)] group-hover:text-blue-400 transition-colors uppercase tracking-tight">{cargo.cliente?.nombre}</span>
                    <span className="text-[10px] text-slate-600 font-black uppercase tracking-widest mt-0.5">ID RECEPTOR: {cargo.id}</span>
                  </div>
                </td>
                <td className="px-8 py-5 text-xs text-[var(--text-secondary)] font-medium leading-relaxed max-w-xs">{cargo.descripcion}</td>
                <td className="px-8 py-5 text-[11px] text-[var(--text-secondary)] font-black uppercase">
                  {new Date(cargo.fechaEmision).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
                </td>
                <td className="px-8 py-5">
                  {cargo.pagado ? (
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                      <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Liquidado</span>
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20">
                      <div className="w-1 h-1 rounded-full bg-amber-500 animate-pulse" />
                      <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest">Pendiente</span>
                    </div>
                  )}
                </td>
                <td className="px-8 py-5 text-right font-black text-[var(--text-primary)] text-sm">
                  ${Number(cargo.monto).toLocaleString()}
                </td>
                <td className="px-8 py-5 text-right">
                  {!cargo.pagado ? (
                    <button
                      onClick={() => onCobrar?.(cargo)}
                      className="bg-blue-600/10 hover:bg-blue-600 text-blue-400 hover:text-[var(--text-primary)] px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 flex items-center gap-2 ml-auto"
                    >
                      <CreditCard className="w-3 h-3" />
                      Cobrar
                    </button>
                  ) : (
                    <button className="p-2 text-slate-700 hover:text-[var(--text-primary)] transition-colors">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
