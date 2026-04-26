import React, { useState } from 'react';
import { FileText, Loader2, ChevronDown, ChevronRight, Anchor, Mail, Edit3, Trash2, CheckCircle, XCircle, ChevronLeft, Wallet } from 'lucide-react';
import { Factura, useFacturasPaginadas } from '../hooks/useFacturas';
import { ActionMenu } from '../../../shared/components/ActionMenu';
import { FacturaDetailModal } from './FacturaDetailModal';
import { FacturaEditModal } from './FacturaEditModal';
import { FacturaEmailModal } from './FacturaEmailModal';
import { LiquidarFacturaModal } from './LiquidarFacturaModal';
import { toast } from 'react-hot-toast';
import { useConfirm } from '../../../shared/hooks/useConfirm';

const PAGE_SIZE = 20;

const TIPO_COLORS: Record<string, string> = {
  AMARRE:        'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  MANTENIMIENTO: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  SERVICIOS:     'bg-teal-500/10 text-teal-400 border-teal-500/20',
  OTROS:         'bg-[var(--bg-elevated)] text-[var(--text-muted)] border-[var(--border-secondary)]',
};

export function FacturasList({ filters }: { filters: { search?: string; startDate?: string; endDate?: string } }) {
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [selectedFactura, setSelectedFactura] = useState<Factura | null>(null);
  const [activeModal, setActiveModal] = useState<'detail' | 'edit' | 'email' | 'liquidar' | null>(null);
  const confirm = useConfirm();

  // Reset page when filters change
  React.useEffect(() => {
    setPage(1);
  }, [filters.search, filters.startDate, filters.endDate]);

  const { query, updateEstadoFactura, deleteFactura } = useFacturasPaginadas(page, PAGE_SIZE, filters);
  const { data, isLoading, isFetching } = query;
  const facturas: Factura[] = data?.data ?? [];
  const totalPages = data?.totalPages ?? 1;
  const total = data?.total ?? 0;

  const toggle = (id: number) =>
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); } else { next.add(id); }
      return next;
    });

  const handleLiquidar = (factura: Factura) => {
    setSelectedFactura(factura);
    setActiveModal('liquidar');
  };

  const handleConfirmarLiquidar = async (facturaId: number, metodoPago: string) => {
    try {
      await updateEstadoFactura.mutateAsync({ id: facturaId, estado: 'PAGADA', metodoPago });
      toast.success('Factura liquidada correctamente');
      setActiveModal(null);
      setSelectedFactura(null);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Error al liquidar la factura';
      toast.error(msg);
    }
  };

  const handleAnular = async (factura: Factura) => {
    const confirmed = await confirm({
      title: 'Anular Factura',
      message: `¿Está seguro de que desea anular la factura ${factura.numero}? Esta acción no se puede deshacer.`,
      confirmText: 'Anular',
      variant: 'danger',
    });
    if (!confirmed) return;
    try {
      await updateEstadoFactura.mutateAsync({ id: factura.id, estado: 'ANULADA' });
      toast.success('Factura anulada');
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Error al anular la factura';
      toast.error(msg);
    }
  };

  const handleDelete = async (factura: Factura) => {
    const confirmed = await confirm({
      title: 'Eliminar Factura',
      message: `¿Eliminar definitivamente la factura ${factura.numero}? Los cargos vinculados quedarán sin factura.`,
      confirmText: 'Eliminar',
      variant: 'danger',
    });
    if (!confirmed) return;
    try {
      await deleteFactura.mutateAsync(factura.id);
      toast.success('Factura eliminada');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Error al eliminar');
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 bg-[var(--bg-secondary)]/20">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
        <p className="mt-4 text-[var(--text-secondary)] font-black uppercase text-[10px] tracking-widest">Sincronizando Facturador...</p>
      </div>
    );
  }

  return (
    <>
      <div className={`overflow-x-auto transition-opacity duration-200 ${isFetching && !isLoading ? 'opacity-60' : 'opacity-100'}`}>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[var(--border-primary)]/60 bg-[var(--bg-secondary)]/20">
              <th className="px-4 py-5 w-8" />
              <th className="px-6 py-5 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em]">Nº Comprobante</th>
              <th className="px-6 py-5 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em]">Cliente</th>
              <th className="px-6 py-5 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em]">Emisión</th>
              <th className="px-6 py-5 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em]">Estado</th>
              <th className="px-6 py-5 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] text-right">Total</th>
              <th className="px-6 py-5 sticky right-0 bg-[var(--bg-surface)] backdrop-blur-md z-20 border-b border-[var(--border-secondary)]" />
            </tr>
          </thead>
          <tbody>
            {facturas.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-8 py-24 text-center">
                  <div className="w-16 h-16 rounded-[2rem] bg-[var(--bg-secondary)] border border-[var(--border-primary)] flex items-center justify-center mx-auto mb-4 text-[var(--text-muted)]">
                    <FileText className="w-8 h-8" />
                  </div>
                  <p className="text-[var(--text-muted)] font-black uppercase text-[10px] tracking-widest">No se hallaron facturas en el registro actual.</p>
                </td>
              </tr>
            ) : (
              facturas.map((factura) => {
                const isOpen = expanded.has(factura.id);
                const cargos = factura.cargos ?? [];

                return (
                  <React.Fragment key={factura.id}>
                    {/* Fila principal */}
                    <tr
                      onClick={() => toggle(factura.id)}
                      className="group hover:bg-[var(--bg-card-hover)] transition-all cursor-pointer border-b border-[var(--border-secondary)]"
                    >
                      <td className="pl-4 pr-2 py-5 text-[var(--text-muted)] group-hover:text-indigo-400 transition-colors">
                        {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                            <FileText className="w-4 h-4 text-indigo-400" />
                          </div>
                          <div>
                            <span className="font-mono font-black text-[var(--text-primary)] group-hover:text-indigo-400 transition-colors uppercase tracking-tight">
                              {factura.numero}
                            </span>
                            <p className="text-[9px] text-[var(--text-muted)] font-black uppercase tracking-widest mt-0.5">
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
                        {factura.estado === 'PENDIENTE' && factura.pagoIdComprobante && (
                          <div className="mt-2 flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/20 w-fit">
                            <Wallet className="w-2.5 h-2.5 text-indigo-400" />
                            <span className="text-[8px] font-black text-indigo-400 uppercase tracking-widest">Pago Informado</span>
                          </div>
                        )}
                      </td>

                      <td className="px-6 py-5 text-right font-black text-[var(--text-primary)] text-sm">
                        ${Number(factura.total).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                      </td>

                      <td
                        className="px-6 py-5 text-right sticky right-0 bg-[var(--bg-surface)] group-hover:bg-[var(--bg-card-hover)] backdrop-blur-md z-10 shadow-[-12px_0_8px_-8px_var(--border-primary)] transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ActionMenu
                          items={[
                            {
                              label: 'Ver Detalle',
                              icon: FileText,
                              onClick: () => { setSelectedFactura(factura); setActiveModal('detail'); }
                            },
                            {
                              label: 'Enviar por Email',
                              icon: Mail,
                              onClick: () => { setSelectedFactura(factura); setActiveModal('email'); }
                            },
                            {
                              label: 'Editar / Agregar Items',
                              icon: Edit3,
                              onClick: () => { setSelectedFactura(factura); setActiveModal('edit'); }
                            },
                            ...(factura.estado === 'PENDIENTE' ? [
                              {
                                label: 'Liquidar Factura',
                                icon: CheckCircle,
                                variant: 'success' as const,
                                onClick: () => handleLiquidar(factura),
                              },
                              {
                                label: 'Anular Factura',
                                icon: XCircle,
                                variant: 'danger' as const,
                                onClick: () => handleAnular(factura),
                              },
                            ] : []),
                            {
                              label: 'Eliminar',
                              icon: Trash2,
                              variant: 'danger' as const,
                              onClick: () => handleDelete(factura),
                            },
                          ]}
                        />
                      </td>
                    </tr>

                    {/* Fila expandible de cargos */}
                    {isOpen && (
                      <tr key={`${factura.id}-detail`} className="bg-[var(--bg-secondary)]/40">
                        <td colSpan={7} className="px-0 py-0">
                          <div className="mx-6 my-3 rounded-2xl border border-[var(--border-secondary)] overflow-hidden">
                            {cargos.length === 0 ? (
                              <p className="px-6 py-4 text-[10px] text-[var(--text-muted)] font-black uppercase tracking-widest">Sin cargos asociados</p>
                            ) : (
                              <table className="w-full text-left border-collapse">
                                <thead>
                                  <tr className="bg-[var(--bg-elevated)] border-b border-[var(--border-secondary)]">
                                    <th className="px-5 py-3 text-[9px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em]">Concepto</th>
                                    <th className="px-5 py-3 text-[9px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em]">Tipo</th>
                                    <th className="px-5 py-3 text-[9px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em]">Vencimiento</th>
                                    <th className="px-5 py-3 text-[9px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em]">Estado</th>
                                    <th className="px-5 py-3 text-[9px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] text-right">Importe</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-[var(--border-secondary)]">
                                  {cargos.map(cargo => (
                                    <tr key={cargo.id} className="hover:bg-[var(--bg-card-hover)] transition-colors">
                                      <td className="px-5 py-3">
                                        <div className="flex items-center gap-2">
                                          <Anchor className="w-3 h-3 text-[var(--text-muted)] shrink-0" />
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
                                        ${Number(cargo.monto).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
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
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-8 py-5 border-t border-[var(--border-secondary)]">
          <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">
            Página {page} de {totalPages} · {total} facturas
          </p>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1 || isFetching}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-secondary)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] transition-all disabled:opacity-30 disabled:cursor-not-allowed active:scale-95"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">Anterior</span>
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                const p = totalPages <= 7 ? i + 1
                  : page <= 4 ? i + 1
                  : page >= totalPages - 3 ? totalPages - 6 + i
                  : page - 3 + i;
                return (
                  <button key={p} onClick={() => setPage(p)} disabled={isFetching}
                    className={`w-9 h-9 rounded-xl text-[10px] font-black transition-all active:scale-90 ${p === page
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/30'
                      : 'bg-[var(--bg-elevated)] border border-[var(--border-secondary)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)]'
                    }`}
                  >{p}</button>
                );
              })}
            </div>
            <button
              disabled={page >= totalPages || isFetching}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-secondary)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] transition-all disabled:opacity-30 disabled:cursor-not-allowed active:scale-95"
            >
              <span className="text-[10px] font-black uppercase tracking-widest">Siguiente</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Modales */}
      {activeModal === 'detail' && selectedFactura && (
        <FacturaDetailModal
          factura={selectedFactura}
          onClose={() => setActiveModal(null)}
          onSendEmail={() => setActiveModal('email')}
        />
      )}
      {activeModal === 'edit' && selectedFactura && (
        <FacturaEditModal
          factura={selectedFactura}
          onClose={() => setActiveModal(null)}
          onSuccess={() => setActiveModal(null)}
        />
      )}
      {activeModal === 'email' && selectedFactura && (
        <FacturaEmailModal
          factura={selectedFactura}
          onClose={() => setActiveModal(null)}
          onSuccess={() => setActiveModal(null)}
        />
      )}
      {activeModal === 'liquidar' && selectedFactura && (
        <LiquidarFacturaModal
          factura={selectedFactura}
          isPending={updateEstadoFactura.isPending}
          onConfirm={handleConfirmarLiquidar}
          onClose={() => { setActiveModal(null); setSelectedFactura(null); }}
        />
      )}
    </>
  );
}
