import { useState } from 'react';
import { Calendar, Eye, ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import { Caja } from '../hooks/useFinanzas';

interface HistorialCajasListProps {
  cajas: Caja[];
  isLoading: boolean;
  onVerDetalle: (caja: Caja) => void;
}

type SortKey = 'fechaApertura' | 'saldoInicial' | 'recaudacion' | 'saldoFinal';
type SortDir = 'asc' | 'desc';

function SortIcon({ col, sortKey, sortDir }: { col: SortKey; sortKey: SortKey; sortDir: SortDir }) {
  if (col !== sortKey) return <ChevronsUpDown className="w-3 h-3 opacity-30 inline ml-1" />;
  return sortDir === 'asc'
    ? <ChevronUp className="w-3 h-3 inline ml-1 text-indigo-400" />
    : <ChevronDown className="w-3 h-3 inline ml-1 text-indigo-400" />;
}

export function HistorialCajasList({ cajas, isLoading, onVerDetalle }: HistorialCajasListProps) {
  const [sortKey, setSortKey] = useState<SortKey>('fechaApertura');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  const sorted = [...cajas].sort((a, b) => {
    let va: number, vb: number;
    if (sortKey === 'fechaApertura') {
      va = new Date(a.fechaApertura).getTime();
      vb = new Date(b.fechaApertura).getTime();
    } else if (sortKey === 'saldoInicial') {
      va = Number(a.saldoInicial); vb = Number(b.saldoInicial);
    } else if (sortKey === 'recaudacion') {
      va = a.pagos?.reduce((s, p) => s + Number(p.monto), 0) ?? 0;
      vb = b.pagos?.reduce((s, p) => s + Number(p.monto), 0) ?? 0;
    } else {
      va = Number(a.saldoFinal ?? 0); vb = Number(b.saldoFinal ?? 0);
    }
    return sortDir === 'asc' ? va - vb : vb - va;
  });
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-[var(--border-primary)]/60 bg-[var(--bg-secondary)]/20">
            <th className="px-8 py-5 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] cursor-pointer hover:text-[var(--text-primary)]" onClick={() => handleSort('fechaApertura')}>
              Fecha <SortIcon col="fechaApertura" sortKey={sortKey} sortDir={sortDir} />
            </th>
            <th className="px-8 py-5 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] cursor-pointer hover:text-[var(--text-primary)]" onClick={() => handleSort('saldoInicial')}>
              Saldo Inicial <SortIcon col="saldoInicial" sortKey={sortKey} sortDir={sortDir} />
            </th>
            <th className="px-8 py-5 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] cursor-pointer hover:text-[var(--text-primary)]" onClick={() => handleSort('recaudacion')}>
              Recaudación <SortIcon col="recaudacion" sortKey={sortKey} sortDir={sortDir} />
            </th>
            <th className="px-8 py-5 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em]">Diferencia / Arqueo</th>
            <th className="px-8 py-5 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] text-right cursor-pointer hover:text-[var(--text-primary)]" onClick={() => handleSort('saldoFinal')}>
              Saldo Final <SortIcon col="saldoFinal" sortKey={sortKey} sortDir={sortDir} />
            </th>
            <th className="px-8 py-5"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--border-primary)]/40">
          {isLoading ? (
            <tr><td colSpan={6} className="px-8 py-20 text-center text-[var(--text-muted)] font-bold bg-[var(--bg-secondary)]/20">Auditando cierres anteriores...</td></tr>
          ) : sorted.length === 0 ? (
            <tr><td colSpan={6} className="px-8 py-20 text-center text-[var(--text-muted)] font-bold bg-[var(--bg-secondary)]/20">No se detectaron cierres históricos registrados.</td></tr>
          ) : (
            sorted.map((caja) => {
              const totalRecaudado = caja.pagos?.reduce((sum, p) => sum + Number(p.monto), 0) || 0;
              const totalEsperado = Number(caja.saldoInicial) + totalRecaudado;
              const diferencia = Number(caja.saldoFinal || 0) - totalEsperado;
              const isExacto = Math.abs(diferencia) < 0.01;

              return (
                <tr key={caja.id} className="group hover:bg-[var(--bg-card-hover)] transition-all cursor-default">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[var(--bg-elevated)] flex items-center justify-center border border-[var(--border-primary)]">
                        <Calendar className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-tight">
                          {new Date(caja.fechaApertura).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
                        </span>
                        <span className="text-[10px] text-[var(--text-muted)] font-black uppercase tracking-widest mt-0.5">ESTADO: {caja.estado}</span>
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
                      <span className="text-[9px] font-black uppercase text-[var(--text-muted)] tracking-widest italic">En curso...</span>
                    )}
                  </td>
                  <td className="px-8 py-5 text-right font-black text-[var(--text-primary)] text-sm">
                    ${(caja.saldoFinal || 0).toLocaleString()}
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button
                      onClick={() => onVerDetalle(caja)}
                      className="bg-[var(--bg-elevated)] hover:bg-[var(--bg-card-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] p-2 rounded-xl transition-all active:scale-90 flex items-center gap-2 ml-auto"
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
