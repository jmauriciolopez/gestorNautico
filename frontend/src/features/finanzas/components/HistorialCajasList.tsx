import { Calendar, Eye } from 'lucide-react';
import { Caja } from '../hooks/useFinanzas';

interface HistorialCajasListProps {
  cajas: Caja[];
  isLoading: boolean;
  onVerDetalle: (caja: Caja) => void;
}

export function HistorialCajasList({ cajas, isLoading, onVerDetalle }: HistorialCajasListProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-[var(--border-primary)]/60 bg-[var(--bg-secondary)]/20">
            <th className="px-8 py-5 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em]">Cierre / Fecha</th>
            <th className="px-8 py-5 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em]">Saldo Inicial</th>
            <th className="px-8 py-5 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em]">Recaudación</th>
            <th className="px-8 py-5 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em]">Diferencia / Arqueo</th>
            <th className="px-8 py-5 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] text-right">Saldo Final</th>
            <th className="px-8 py-5"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/40">
          {isLoading ? (
            <tr><td colSpan={6} className="px-8 py-20 text-center text-slate-600 font-bold bg-[var(--bg-secondary)]/20">Auditando cierres anteriores...</td></tr>
          ) : cajas.length === 0 ? (
            <tr><td colSpan={6} className="px-8 py-20 text-center text-slate-600 font-bold bg-[var(--bg-secondary)]/20">No se detectaron cierres históricos registrados.</td></tr>
          ) : (
            cajas.map((caja) => {
              const totalRecaudado = caja.pagos?.reduce((sum, p) => sum + Number(p.monto), 0) || 0;
              const totalEsperado = Number(caja.saldoInicial) + totalRecaudado;
              const diferencia = Number(caja.saldoFinal || 0) - totalEsperado;
              const isExacto = Math.abs(diferencia) < 0.01;

              return (
                <tr key={caja.id} className="group hover:bg-slate-800/30 transition-all cursor-default">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center border border-slate-700">
                        <Calendar className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-tight">
                          {new Date(caja.fechaApertura).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
                        </span>
                        <span className="text-[10px] text-slate-600 font-black uppercase tracking-widest mt-0.5">ESTADO: {caja.estado}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-[11px] text-[var(--text-secondary)] font-bold">
                    ${Number(caja.saldoInicial).toLocaleString()}
                  </td>
                  <td className="px-8 py-5 text-[11px] text-emerald-500/80 font-bold">
                    + ${totalRecaudado.toLocaleString()}
                  </td>
                  <td className="px-8 py-5">
                    {caja.estado === 'CERRADA' ? (
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border ${isExacto
                        ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400'
                        : 'bg-rose-500/5 border-rose-500/20 text-rose-400'
                        }`}>
                        <span className="text-[9px] font-black uppercase tracking-widest">
                          {isExacto ? 'Cuadrado' : `Dif: $${diferencia.toLocaleString()}`}
                        </span>
                      </div>
                    ) : (
                      <span className="text-[9px] font-black uppercase text-slate-700 tracking-widest italic">En curso...</span>
                    )}
                  </td>
                  <td className="px-8 py-5 text-right font-black text-[var(--text-primary)] text-sm">
                    ${(caja.saldoFinal || 0).toLocaleString()}
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button
                      onClick={() => onVerDetalle(caja)}
                      className="bg-slate-800 hover:bg-slate-700 text-[var(--text-secondary)] hover:text-[var(--text-primary)] p-2 rounded-xl transition-all active:scale-90 flex items-center gap-2 ml-auto"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
