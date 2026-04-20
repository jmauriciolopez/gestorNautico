import { TrendingDown } from 'lucide-react';
import type { MensualidadDescuento } from '../hooks/useReportes';

interface Props {
  data: MensualidadDescuento[];
  isLoading: boolean;
}

export function MensualidadesTable({ data, isLoading }: Props) {
  const totalBase = data.reduce((s, r) => s + Number(r.tarifaBase), 0);
  const totalFinal = data.reduce((s, r) => s + Number(r.totalFinal), 0);
  const totalDescuentos = totalBase - totalFinal;

  return (
    <div>
      {/* Resumen */}
      {!isLoading && data.length > 0 && (
        <div className="grid grid-cols-3 gap-4 p-6 border-b border-[var(--border-primary)]">
          <div className="bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-2xl p-4">
            <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1">Facturación bruta</p>
            <p className="text-2xl font-black text-[var(--text-primary)]">${totalBase.toLocaleString()}</p>
          </div>
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4">
            <p className="text-[9px] font-black text-amber-400 uppercase tracking-widest mb-1">Total descuentos</p>
            <p className="text-2xl font-black text-[var(--text-primary)]">${totalDescuentos.toLocaleString()}</p>
          </div>
          <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-4">
            <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-1">Facturación neta</p>
            <p className="text-2xl font-black text-[var(--text-primary)]">${totalFinal.toLocaleString()}</p>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[var(--border-primary)]/60 bg-[var(--bg-secondary)]/20">
              <th className="px-6 py-4 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em]">Cliente</th>
              <th className="px-6 py-4 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em]">Embarcación</th>
              <th className="px-6 py-4 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em]">Espacio</th>
              <th className="px-6 py-4 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] text-right">Tarifa base</th>
              <th className="px-6 py-4 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] text-right">Desc. cliente</th>
              <th className="px-6 py-4 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] text-right">Desc. embarcación</th>
              <th className="px-6 py-4 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] text-right">Total final</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/40">
            {isLoading ? (
              <tr><td colSpan={7} className="px-6 py-20 text-center text-slate-600 font-bold">Cargando...</td></tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-20 text-center">
                  <div className="flex flex-col items-center gap-3 opacity-40">
                    <TrendingDown className="w-8 h-8 text-[var(--text-muted)]" />
                    <p className="text-sm font-black text-[var(--text-secondary)] uppercase tracking-widest">Sin embarcaciones en cuna</p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map(r => {
                const tieneDescuento = r.descuentoCliente > 0 || r.descuentoEmbarcacion > 0;
                return (
                  <tr key={r.embarcacionId} className="group hover:bg-slate-800/30 transition-all">
                    <td className="px-6 py-4">
                      <p className="text-sm font-black text-[var(--text-primary)] uppercase tracking-tight">{r.clienteNombre}</p>
                      {r.descuentoCliente > 0 && (
                        <span className="text-[9px] font-black text-amber-400 uppercase tracking-widest">
                          {r.descuentoCliente}% desc. cliente
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-black text-[var(--text-primary)]">{r.embarcacionNombre}</p>
                      <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{r.matricula}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-[11px] font-black text-[var(--text-secondary)] uppercase">{r.rack}</p>
                      <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{r.espacio}</p>
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-black text-[var(--text-secondary)]">
                      ${Number(r.tarifaBase).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {r.descuentoCliente > 0 ? (
                        <span className="text-sm font-black text-amber-400">
                          -${Number(r.montoDescCliente).toLocaleString()}
                          <span className="text-[9px] ml-1 opacity-60">({r.descuentoCliente}%)</span>
                        </span>
                      ) : (
                        <span className="text-[var(--text-muted)] text-sm">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {r.descuentoEmbarcacion > 0 ? (
                        <span className="text-sm font-black text-amber-400">
                          -${Number(r.montoDescEmbarcacion).toLocaleString()}
                          <span className="text-[9px] ml-1 opacity-60">({r.descuentoEmbarcacion}%)</span>
                        </span>
                      ) : (
                        <span className="text-[var(--text-muted)] text-sm">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={`text-sm font-black ${tieneDescuento ? 'text-indigo-400' : 'text-[var(--text-primary)]'}`}>
                        ${Number(r.totalFinal).toLocaleString()}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
          {!isLoading && data.length > 0 && (
            <tfoot>
              <tr className="border-t-2 border-[var(--border-primary)] bg-[var(--bg-secondary)]/30">
                <td colSpan={3} className="px-6 py-4 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest">Total</td>
                <td className="px-6 py-4 text-right text-sm font-black text-[var(--text-secondary)]">${totalBase.toLocaleString()}</td>
                <td colSpan={2} className="px-6 py-4 text-right text-sm font-black text-amber-400">-${totalDescuentos.toLocaleString()}</td>
                <td className="px-6 py-4 text-right text-sm font-black text-indigo-400">${totalFinal.toLocaleString()}</td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}
