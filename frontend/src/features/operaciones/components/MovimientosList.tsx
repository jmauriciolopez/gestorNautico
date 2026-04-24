import { useState } from 'react';
import {
  MapPin, Loader2, Calendar, ArrowRight, ArrowLeft,
  History, FileText, Trash2, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { Movimiento, useMovimientosPaginados } from '../hooks/useOperaciones';
import { NuevoMovimientoModal } from './NuevoMovimientoModal';
import { ActionMenu } from '../../../shared/components/ActionMenu';
import { useConfirm } from '../../../shared/hooks/useConfirm';

const PAGE_SIZE = 20;

export function MovimientosList() {
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const confirm = useConfirm();

  const { query, deleteMovimiento } = useMovimientosPaginados(page, PAGE_SIZE);
  const { data, isLoading, isFetching } = query;
  const movimientos: Movimiento[] = data?.data ?? [];
  const totalPages = data?.totalPages ?? 1;
  const total = data?.total ?? 0;

  const handleDelete = async (mov: Movimiento) => {
    const confirmed = await confirm({
      title: 'Eliminar Movimiento',
      message: `¿Eliminar el movimiento de "${mov.embarcacion?.nombre}" del ${new Date(mov.fecha).toLocaleDateString('es-AR')}? Esta acción no se puede deshacer.`,
      confirmText: 'Eliminar',
      variant: 'danger',
    });
    
    if (confirmed) {
      try {
        await deleteMovimiento.mutateAsync(mov.id);
        // Si la página quedó vacía (y no es la primera), retroceder
        if (movimientos.length === 1 && page > 1) {
          setPage(p => p - 1);
        }
      } catch (e) {
        // El error ya lo maneja la mutación con toast
        console.error(e);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
        <p className="mt-4 text-[var(--text-secondary)] font-black uppercase text-[10px] tracking-widest">
          Auditando Bitácora Histórica...
        </p>
      </div>
    );
  }

  return (
    <div className="p-12 space-y-10">
      {/* Lista */}
      <div className={`grid grid-cols-1 gap-4 transition-opacity duration-200 ${isFetching ? 'opacity-60 pointer-events-none' : 'opacity-100'}`}>
        {movimientos.map((mov) => (
          <div
            key={mov.id}
            className="group relative bg-[var(--bg-secondary)]/20 hover:bg-[var(--bg-secondary)]/40 rounded-[2.5rem] border border-[var(--border-primary)]/40 hover:border-amber-500/30 transition-all duration-500 overflow-hidden"
          >
            <div className={`absolute top-0 left-0 w-1.5 h-full ${mov.tipo === 'entrada' ? 'bg-indigo-600' : 'bg-emerald-600'}`} />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 pl-8 relative z-10">
              {/* Info */}
              <div className="flex items-center gap-6">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border-2 shrink-0 ${
                  mov.tipo === 'entrada'
                    ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'
                    : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                }`}>
                  {mov.tipo === 'entrada' ? <ArrowRight className="w-6 h-6" /> : <ArrowLeft className="w-6 h-6" />}
                </div>

                <div>
                  <div className="flex items-center gap-3 mb-1.5">
                    <span className="text-lg font-black text-[var(--text-primary)] group-hover:text-amber-500 transition-colors uppercase tracking-tight">
                      {mov.embarcacion?.nombre}
                    </span>
                    <span className="text-[9px] font-black px-2.5 py-1 bg-[var(--bg-primary)] text-[var(--text-secondary)] rounded-lg border border-[var(--border-primary)] tracking-[0.2em] uppercase">
                      {mov.embarcacion?.matricula}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2 text-[10px] text-[var(--text-muted)] font-black uppercase tracking-widest bg-[var(--bg-primary)]/40 px-3 py-1.5 rounded-xl border border-[var(--border-primary)]/40">
                      <Calendar className="w-3.5 h-3.5 text-amber-500" />
                      {new Date(mov.fecha).toLocaleString('es-AR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase px-3 py-1.5 rounded-xl border border-[var(--border-primary)]/40 bg-[var(--bg-primary)]/40">
                      <MapPin className="w-3.5 h-3.5 text-amber-500" />
                      {mov.espacio
                        ? <span className="text-amber-500">{mov.espacio.rack?.codigo || 'R'}-{mov.espacio.numero}</span>
                        : <span className="text-emerald-500">Sector Agua</span>
                      }
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 self-end md:self-center shrink-0">
                {mov.observaciones && (
                  <button
                    onClick={() => setExpandedId(expandedId === mov.id ? null : mov.id)}
                    className="flex items-center gap-2 px-4 py-2 text-[9px] font-black text-[var(--text-muted)] hover:text-amber-500 uppercase tracking-widest bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-xl transition-all"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    Notas
                  </button>
                )}
                <ActionMenu
                  items={[
                    {
                      label: mov.observaciones ? 'Ver / Ocultar Notas' : 'Sin notas',
                      icon: FileText,
                      onClick: () => setExpandedId(expandedId === mov.id ? null : mov.id),
                    },
                    {
                      label: 'Eliminar Registro',
                      icon: Trash2,
                      variant: 'danger' as const,
                      onClick: () => handleDelete(mov),
                    },
                  ]}
                />
              </div>
            </div>

            {/* Notas expandibles */}
            {expandedId === mov.id && mov.observaciones && (
              <div className="px-8 pb-6 border-t border-[var(--border-secondary)] ml-6">
                <div className="bg-[var(--bg-secondary)]/40 border border-[var(--border-secondary)] rounded-2xl px-5 py-4 mt-4">
                  <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] mb-2">
                    Anotaciones de Bitácora
                  </p>
                  <p className="text-sm text-[var(--text-secondary)] font-medium italic leading-relaxed">
                    {mov.observaciones}
                  </p>
                </div>
              </div>
            )}
          </div>
        ))}

        {movimientos.length === 0 && (
          <div className="py-32 text-center bg-[var(--bg-secondary)]/10 rounded-[3rem] border-2 border-dashed border-[var(--border-primary)]/40">
            <div className="w-24 h-24 rounded-[2.5rem] bg-[var(--bg-secondary)] border border-[var(--border-primary)] flex items-center justify-center mx-auto mb-8 text-[var(--text-muted)] shadow-inner">
              <History className="w-12 h-12 opacity-20" />
            </div>
            <h4 className="text-[var(--text-primary)] font-black text-xl uppercase tracking-tight">Sin Actividad</h4>
            <p className="text-[var(--text-secondary)] text-xs font-black uppercase tracking-[0.25em] mt-3 opacity-60">
              La bitácora de movimientos se encuentra vacía.
            </p>
          </div>
        )}
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-6 border-t border-[var(--border-secondary)]">
          <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">
            Página {page} de {totalPages} · {total} registros
          </p>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1 || isFetching}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-secondary)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] transition-all disabled:opacity-30 disabled:cursor-not-allowed active:scale-95"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">Anterior</span>
            </button>

            {/* Páginas */}
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                let p: number;
                if (totalPages <= 7) {
                  p = i + 1;
                } else if (page <= 4) {
                  p = i + 1;
                } else if (page >= totalPages - 3) {
                  p = totalPages - 6 + i;
                } else {
                  p = page - 3 + i;
                }
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    disabled={isFetching}
                    className={`w-9 h-9 rounded-xl text-[10px] font-black transition-all active:scale-90 ${
                      p === page
                        ? 'bg-amber-500 text-white shadow-lg shadow-amber-900/30'
                        : 'bg-[var(--bg-elevated)] border border-[var(--border-secondary)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)]'
                    }`}
                  >
                    {p}
                  </button>
                );
              })}
            </div>

            <button
              disabled={page >= totalPages || isFetching}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-secondary)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] transition-all disabled:opacity-30 disabled:cursor-not-allowed active:scale-95"
            >
              <span className="text-[10px] font-black uppercase tracking-widest">Siguiente</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <NuevoMovimientoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={async (data) => {
          await createMovimiento.mutateAsync(data);
          setIsModalOpen(false);
          setPage(1); // Volver a la primera página para ver el registro recién creado
        }}
      />
    </div>
  );
}
