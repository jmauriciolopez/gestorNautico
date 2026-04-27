import { useState } from 'react';
import { CreditCard, FileText, CheckCircle, ExternalLink, ChevronLeft, ChevronRight, Loader2, Receipt } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { ActionMenu } from '../../../shared/components/ActionMenu';
import { CargoDetailModal } from './CargoDetailModal';
import { useCargosPaginados, Cargo } from '../hooks/useFinanzas';

const PAGE_SIZE = 20;

interface CargosListProps {
  onCobrar?: (cargo: Cargo) => void;
}

export function CargosList({ onCobrar }: CargosListProps) {
  const [page, setPage] = useState(1);
  const [selectedCargo, setSelectedCargo] = useState<Cargo | null>(null);

  const { query } = useCargosPaginados(page, PAGE_SIZE);
  const { data, isLoading, isFetching } = query;
  const cargos: Cargo[] = data?.data ?? [];
  const totalPages = data?.totalPages ?? 1;
  const total = data?.total ?? 0;

  const extractVesselName = (cargo: Cargo) => {
    if (!cargo.descripcion) return 'GENERAL';
    const parts = cargo.descripcion.split(/ - |: /);
    if (parts.length > 1) return parts[1];
    return cargo.descripcion;
  };

  return (
    <>
      <div className={`overflow-x-auto transition-opacity duration-200 ${isFetching && !isLoading ? 'opacity-60' : 'opacity-100'}`}>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[var(--border-primary)]/60 bg-[var(--bg-secondary)]/20">
              <th className="px-8 py-5 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em]">Cliente / Deudor</th>
              <th className="px-8 py-5 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em]">Concepto de Cargo</th>
              <th className="px-8 py-5 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em]">Emisión</th>
              <th className="px-8 py-5 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em]">Estado</th>
              <th className="px-8 py-5 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] text-right">Monto Neto</th>
              <th className="px-8 py-5 sticky right-0 bg-[var(--bg-surface)] backdrop-blur-md z-20 border-b border-[var(--border-secondary)]"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-secondary)]">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-8 py-24 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                    <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Sincronizando registros...</span>
                  </div>
                </td>
              </tr>
            ) : cargos.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-8 py-24 text-center">
                  <div className="flex flex-col items-center gap-4 max-w-sm mx-auto">
                    <div className="w-16 h-16 rounded-[2rem] bg-[var(--bg-secondary)] flex items-center justify-center border border-[var(--border-primary)] shadow-inner">
                      <Receipt className="w-8 h-8 text-[var(--text-muted)] opacity-20" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-xs font-black text-[var(--text-primary)] uppercase tracking-widest">Sin Cargos Pendientes</h4>
                      <p className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-tighter">
                        El motor financiero no ha detectado obligaciones de pago activas en este periodo.
                      </p>
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              cargos.map((cargo) => (
                <tr
                  key={cargo.id}
                  onClick={() => setSelectedCargo(cargo)}
                  className="group hover:bg-[var(--bg-card-hover)] transition-all cursor-pointer"
                >
                  <td className="px-8 py-5">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-[var(--text-primary)] group-hover:text-[var(--accent-primary)] transition-colors uppercase tracking-tight">
                        {cargo.cliente?.nombre || 'S/D'}
                      </span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[9px] font-black uppercase text-[var(--accent-primary)] bg-[var(--accent-primary-soft)] px-2 py-0.5 rounded border border-[var(--accent-primary-ring)] tracking-widest">
                          {extractVesselName(cargo)}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-xs text-[var(--text-secondary)] font-medium leading-relaxed max-w-xs">{cargo.descripcion}</td>
                  <td className="px-8 py-5 text-[11px] text-[var(--text-secondary)] font-black uppercase">
                    {cargo.fechaEmision && !isNaN(new Date(cargo.fechaEmision).getTime()) ? (
                      new Date(cargo.fechaEmision).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })
                    ) : (
                      <span className="opacity-50 italic">S/F</span>
                    )}
                  </td>
                  <td className="px-8 py-5">
                    {cargo.pagado ? (
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[var(--accent-teal-soft)] border border-[var(--accent-teal-soft)]">
                        <div className="w-1 h-1 rounded-full bg-[var(--accent-teal)] animate-pulse" />
                        <span className="text-[9px] font-black text-[var(--accent-teal)] uppercase tracking-widest">Liquidado</span>
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[var(--accent-amber-soft)] border border-[var(--accent-amber-soft)]">
                        <div className="w-1 h-1 rounded-full bg-[var(--accent-amber)] animate-pulse" />
                        <span className="text-[9px] font-black text-[var(--accent-amber)] uppercase tracking-widest">Pendiente</span>
                      </div>
                    )}
                  </td>
                  <td className="px-8 py-5 text-right font-black text-[var(--text-primary)] text-sm whitespace-nowrap">
                    ${Number(cargo.monto).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                  </td>
                  <td
                    className="px-8 py-5 text-right sticky right-0 bg-[var(--bg-surface)] group-hover:bg-[var(--bg-card-hover)] backdrop-blur-md z-10 shadow-[-12px_0_8px_-8px_var(--border-primary)] transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {!cargo.pagado ? (
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onCobrar?.(cargo)}
                          className="bg-[var(--accent-primary-soft)] hover:bg-[var(--accent-primary)] text-[var(--accent-primary)] hover:text-white px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 flex items-center gap-2 border border-[var(--accent-primary-ring)]"
                        >
                          <CreditCard className="w-3 h-3" />
                          Cobrar
                        </button>
                        <ActionMenu
                          items={[
                            { label: 'Ver Detalle', icon: FileText, onClick: () => setSelectedCargo(cargo) },
                            { label: 'Marcar Pagado (Manual)', icon: CheckCircle, onClick: () => onCobrar?.(cargo) },
                          ]}
                        />
                      </div>
                    ) : (
                      <ActionMenu
                        items={[
                          { label: 'Ver Detalle', icon: FileText, onClick: () => setSelectedCargo(cargo) },
                          { label: 'Imprimir Recibo', icon: ExternalLink, onClick: () => toast('Generando recibo...', { icon: '📄' }) },
                        ]}
                      />
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-8 py-5 border-t border-[var(--border-secondary)]">
          <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">
            Página {page} de {totalPages} · {total} cargos
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

      {selectedCargo && (
        <CargoDetailModal
          cargo={selectedCargo}
          onClose={() => setSelectedCargo(null)}
          onCobrar={onCobrar}
        />
      )}
    </>
  );
}
