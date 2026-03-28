import { FileText, CheckCircle2, Clock, XCircle, Loader2, MoreVertical, ExternalLink } from 'lucide-react';
import { Factura } from '../hooks/useFacturas';

interface FacturasListProps {
  facturas: Factura[];
  isLoading: boolean;
  onUpdateEstado?: (id: number, estado: Factura['estado']) => void;
}

export function FacturasList({ facturas, isLoading, onUpdateEstado }: FacturasListProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 bg-[var(--bg-secondary)]/20">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
        <p className="mt-4 text-[var(--text-secondary)] font-black uppercase text-[10px] tracking-widest">Sincronizando Facturador...</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-[var(--border-primary)]/60 bg-[var(--bg-secondary)]/20">
            <th className="px-8 py-5 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em]">Nº Comprobante / ID</th>
            <th className="px-8 py-5 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em]">Cliente / Receptor</th>
            <th className="px-8 py-5 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em]">Emisión</th>
            <th className="px-8 py-5 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em]">Estado Fiscal</th>
            <th className="px-8 py-5 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] text-right">Monto Bruto</th>
            <th className="px-8 py-5"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/40">
          {facturas.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-8 py-24 text-center">
                <div className="w-16 h-16 rounded-[2rem] bg-[var(--bg-secondary)] border border-[var(--border-primary)] flex items-center justify-center mx-auto mb-4 text-slate-700">
                  <FileText className="w-8 h-8" />
                </div>
                <p className="text-slate-600 font-black uppercase text-[10px] tracking-widest">No se hallaron facturas en el registro actual.</p>
              </td>
            </tr>
          ) : (
            facturas.map((factura) => (
              <tr key={factura.id} className="group hover:bg-slate-800/30 transition-all cursor-default">
                <td className="px-8 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                      <FileText className="w-4 h-4 text-indigo-400" />
                    </div>
                    <div>
                      <span className="font-mono font-black text-[var(--text-primary)] group-hover:text-indigo-400 transition-colors uppercase tracking-tight">{factura.numero}</span>
                      <p className="text-[9px] text-slate-600 font-black uppercase tracking-widest mt-0.5">ID: {factura.id}</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-5">
                  <span className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-tight">{factura.cliente?.nombre}</span>
                </td>
                <td className="px-8 py-5 text-[11px] text-[var(--text-secondary)] font-black uppercase">
                  {new Date(factura.fechaEmision).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
                </td>
                <td className="px-8 py-5">
                  {factura.estado === 'PAGADA' ? (
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                      <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Liquidada</span>
                    </div>
                  ) : factura.estado === 'PENDIENTE' ? (
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20">
                      <div className="w-1 h-1 rounded-full bg-amber-500 animate-pulse" />
                      <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest">Adeudada</span>
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-rose-500/10 border border-rose-500/20">
                      <div className="w-1 h-1 rounded-full bg-rose-500" />
                      <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest">Anulada</span>
                    </div>
                  )}
                </td>
                <td className="px-8 py-5 text-right font-black text-[var(--text-primary)] text-sm">
                  ${Number(factura.total).toLocaleString()}
                </td>
                <td className="px-8 py-5 text-right">
                  <div className="flex items-center justify-end gap-2 outline-none">
                    {factura.estado === 'PENDIENTE' && onUpdateEstado && (
                      <div className="flex items-center gap-3 mr-4">
                        <button
                          onClick={() => onUpdateEstado(factura.id, 'PAGADA')}
                          className="bg-emerald-600/10 hover:bg-emerald-600 text-emerald-500 hover:text-[var(--text-primary)] px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all active:scale-95"
                        >
                          Liquidar
                        </button>
                        <button
                          onClick={() => onUpdateEstado(factura.id, 'ANULADA')}
                          className="text-rose-600 hover:text-rose-400 text-[9px] font-black uppercase tracking-widest transition-colors"
                        >
                          Anular
                        </button>
                      </div>
                    )}
                    <button className="p-2 text-slate-700 hover:text-[var(--text-primary)] transition-colors">
                      <ExternalLink className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-slate-700 hover:text-[var(--text-primary)] transition-colors">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
