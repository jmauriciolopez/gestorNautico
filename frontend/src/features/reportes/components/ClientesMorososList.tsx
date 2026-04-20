import { AlertTriangle, Phone, Mail } from 'lucide-react';
import type { ClienteMoroso } from '../hooks/useReportes';

interface Props {
  data: ClienteMoroso[];
  isLoading: boolean;
}

function Atrasobadge({ dias }: { dias: number }) {
  if (dias > 60) return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-500/15 border border-red-500/30 text-[9px] font-black text-red-400 uppercase tracking-widest">
      <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />{dias}d
    </span>
  );
  if (dias > 30) return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-orange-500/15 border border-orange-500/30 text-[9px] font-black text-orange-400 uppercase tracking-widest">
      <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />{dias}d
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-[9px] font-black text-amber-400 uppercase tracking-widest">
      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />{dias}d
    </span>
  );
}

export function ClientesMorososList({ data, isLoading }: Props) {
  const totalDeuda = data.reduce((s, c) => s + Number(c.totalDeuda), 0);

  return (
    <div>
      {/* Resumen */}
      {!isLoading && data.length > 0 && (
        <div className="grid grid-cols-3 gap-4 p-6 border-b border-[var(--border-primary)]">
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4">
            <p className="text-[9px] font-black text-red-400 uppercase tracking-widest mb-1">Clientes morosos</p>
            <p className="text-2xl font-black text-[var(--text-primary)]">{data.length}</p>
          </div>
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4">
            <p className="text-[9px] font-black text-red-400 uppercase tracking-widest mb-1">Deuda total</p>
            <p className="text-2xl font-black text-[var(--text-primary)]">${totalDeuda.toLocaleString()}</p>
          </div>
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4">
            <p className="text-[9px] font-black text-amber-400 uppercase tracking-widest mb-1">Atraso máximo</p>
            <p className="text-2xl font-black text-[var(--text-primary)]">{data[0]?.diasMaxAtraso ?? 0}d</p>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[var(--border-primary)]/60 bg-[var(--bg-secondary)]/20">
              <th className="px-6 py-4 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em]">Cliente</th>
              <th className="px-6 py-4 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em]">Contacto</th>
              <th className="px-6 py-4 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] text-center">Cargos</th>
              <th className="px-6 py-4 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] text-center">Atraso</th>
              <th className="px-6 py-4 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em]">Venc. más antiguo</th>
              <th className="px-6 py-4 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] text-right">Deuda total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/40">
            {isLoading ? (
              <tr><td colSpan={6} className="px-6 py-20 text-center text-slate-600 font-bold">Cargando...</td></tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-20 text-center">
                  <div className="flex flex-col items-center gap-3 opacity-40">
                    <AlertTriangle className="w-8 h-8 text-emerald-500" />
                    <p className="text-sm font-black text-[var(--text-secondary)] uppercase tracking-widest">Sin clientes morosos</p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map(c => (
                <tr key={c.clienteId} className="group hover:bg-slate-800/30 transition-all">
                  <td className="px-6 py-4">
                    <p className="text-sm font-black text-[var(--text-primary)] uppercase tracking-tight">{c.nombre}</p>
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-0.5">ID #{c.clienteId}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      {c.email && <span className="flex items-center gap-1.5 text-[10px] text-[var(--text-secondary)]"><Mail className="w-3 h-3" />{c.email}</span>}
                      {c.telefono && <span className="flex items-center gap-1.5 text-[10px] text-[var(--text-secondary)]"><Phone className="w-3 h-3" />{c.telefono}</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-sm font-black text-[var(--text-primary)]">{c.cantidadCargos}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Atrasobadge dias={c.diasMaxAtraso} />
                  </td>
                  <td className="px-6 py-4 text-[11px] text-[var(--text-secondary)] font-black uppercase">
                    {new Date(c.fechaVencimientoMasAntigua).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-6 py-4 text-right font-black text-red-400 text-sm">
                    ${Number(c.totalDeuda).toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
