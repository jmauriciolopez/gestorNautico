import { useState } from 'react';
import { FileText, Loader2, MoreVertical, ExternalLink, ChevronDown, ChevronRight, Anchor } from 'lucide-react';
import { Factura } from '../hooks/useFacturas';
import { RoleGuard } from '../../../components/auth/RoleGuard';
import { Role } from '../../../types';

interface FacturasListProps {
  facturas: Factura[];
  isLoading: boolean;
  onUpdateEstado?: (id: number, estado: Factura['estado']) => void;
}

const TIPO_COLORS: Record<string, string> = {
  AMARRE:        'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  MANTENIMIENTO: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  SERVICIOS:     'bg-teal-500/10 text-teal-400 border-teal-500/20',
  OTROS:         'bg-slate-500/10 text-slate-400 border-slate-500/20',
};

export function FacturasList({ facturas, isLoading, onUpdateEstado }: FacturasListProps) {
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  const toggle = (id: number) =>
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); } else { next.add(id); }
      return next;
    });

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
            <th className="px-4 py-5 w-8" />
            <th className="px-6 py-5 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em]">Nº Comprobante</th>
            <th className="px-6 py-5 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em]">Cliente</th>
            <th className="px-6 py-5 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em]">Emisión</th>
            <th className="px-6 py-5 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em]">Estado</th>
            <th className="px-6 py-5 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] text-right">Total</th>
            <th className="px-6 py-5" />
          </tr>
        </thead>
        <tbody>
          {facturas.length === 0 ? (
            <tr>
              <td colSpan={7} className="px-8 py-24 text-center">
                <div className="w-16 h-16 rounded-[2rem] bg-[var(--bg-secondary)] border border-[var(--border-primary)] flex items-center justify-center mx-auto mb-4 text-slate-700">
                  <FileText className="w-8 h-8" />
                </div>
                <p className="text-slate-600 font-black uppercase text-[10px] tracking-widest">No se hallaron facturas en el registro actual.</p>
              </td>
            </tr>
          ) : (
            facturas.map((factura) => {
              const isOpen = expanded.has(factura.id);
              const cargos = factura.cargos ?? [];

              return (
                <>
                  {/* ── Fila principal ── */}
                  <tr
                    key={factura.id}
                    onClick={() => toggle(factura.id)}
                    className="group hover:bg-slate-800/30 transition-all cursor-pointer border-b border-slate-800/40"
                  >
                    {/* Expand toggle */}
                    <td className="pl-4 pr-2 py-5 text-slate-600 group-hover:text-indigo-400 transition-colors">
                      {isOpen
                        ? <ChevronDown className="w-4 h-4" />
                        : <ChevronRight className="w-4 h-4" />}
                    </td>

                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                          <FileText className="w-4 h-4 text-indigo-400" />
                        </div>
                        <div>
                          <span className="font-mono font-black text-[var(--text-primary)] group-hover:text-indigo-400 transition-colors uppercase tracking-tight">{factura.numero}</span>
                          <p className="text-[9px] text-slate-600 font-black uppercase tracking-widest mt-0.5">
                            {cargos.length} cargo{cargos.length !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-5">
                      <span className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-tight">{factura.cliente?.nombre}</span>
                    </td>

                    <td className="px-6 py-5 text-[11px] text-[var(--text-secondary)] font-black uppercase">
                      {new Date(factura.fechaEmision).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>

                    <td className="px-6 py-5">
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

                    <td className="px-6 py-5 text-right font-black text-[var(--text-primary)] text-sm">
                      ${Number(factura.total).toLocaleString()}
                    </td>

                    <td className="px-6 py-5 text-right" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        {factura.estado === 'PENDIENTE' && onUpdateEstado && (
                          <RoleGuard allowedRoles={[Role.ADMIN, Role.SUPERADMIN]}>
                            <div className="flex items-center gap-3 mr-2">
                              <button
                                onClick={() => onUpdateEstado(factura.id, 'PAGADA')}
                                className="bg-emerald-600/10 hover:bg-emerald-600 text-emerald-500 hover:text-white px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all active:scale-95"
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
                          </RoleGuard>
                        )}
                        <button
                          onClick={async () => {
                            try {
                              const token = localStorage.getItem('token');
                              const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3002';
                              const response = await fetch(`${baseUrl}/facturas/${factura.id}/pdf`, {
                                headers: { 'Authorization': `Bearer ${token}` }
                              });
                              if (!response.ok) throw new Error(`Error ${response.status}`);
                              const blob = await response.blob();
                              const url = window.URL.createObjectURL(blob);
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = `factura-${factura.numero}.pdf`;
                              document.body.appendChild(a);
                              a.click();
                              a.remove();
                              window.URL.revokeObjectURL(url);
                            } catch (error) {
                              console.error('Error al descargar PDF:', error);
                            }
                          }}
                          className="p-2 text-slate-700 hover:text-indigo-400 transition-colors"
                          title="Descargar PDF"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-slate-700 hover:text-[var(--text-primary)] transition-colors">
                          <ExternalLink className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-slate-700 hover:text-[var(--text-primary)] transition-colors">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* ── Fila de detalle expandible ── */}
                  {isOpen && (
                    <tr key={`${factura.id}-detail`} className="bg-slate-900/40">
                      <td colSpan={7} className="px-0 py-0">
                        <div className="mx-6 my-3 rounded-2xl border border-slate-700/50 overflow-hidden">
                          {cargos.length === 0 ? (
                            <p className="px-6 py-4 text-[10px] text-slate-600 font-black uppercase tracking-widest">Sin cargos asociados</p>
                          ) : (
                            <table className="w-full text-left border-collapse">
                              <thead>
                                <tr className="bg-slate-800/60 border-b border-slate-700/50">
                                  <th className="px-5 py-3 text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Concepto</th>
                                  <th className="px-5 py-3 text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Tipo</th>
                                  <th className="px-5 py-3 text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Vencimiento</th>
                                  <th className="px-5 py-3 text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Estado</th>
                                  <th className="px-5 py-3 text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] text-right">Importe</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-800/60">
                                {cargos.map(cargo => (
                                  <tr key={cargo.id} className="hover:bg-slate-800/30 transition-colors">
                                    <td className="px-5 py-3">
                                      <div className="flex items-center gap-2">
                                        <Anchor className="w-3 h-3 text-slate-600 shrink-0" />
                                        <span className="text-xs text-[var(--text-primary)] font-medium">{cargo.descripcion}</span>
                                      </div>
                                    </td>
                                    <td className="px-5 py-3">
                                      <span className={`inline-flex px-2 py-0.5 rounded-md border text-[9px] font-black uppercase tracking-widest ${TIPO_COLORS[cargo.tipo] ?? TIPO_COLORS.OTROS}`}>
                                        {cargo.tipo}
                                      </span>
                                    </td>
                                    <td className="px-5 py-3 text-[10px] text-[var(--text-secondary)] font-black uppercase">
                                      {cargo.fechaVencimiento
                                        ? new Date(cargo.fechaVencimiento).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })
                                        : '—'}
                                    </td>
                                    <td className="px-5 py-3">
                                      {cargo.pagado ? (
                                        <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Pagado</span>
                                      ) : (
                                        <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest">Pendiente</span>
                                      )}
                                    </td>
                                    <td className="px-5 py-3 text-right font-black text-[var(--text-primary)] text-sm">
                                      ${Number(cargo.monto).toLocaleString()}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
