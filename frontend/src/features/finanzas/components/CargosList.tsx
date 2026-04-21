import React, { useState } from 'react';
import { CreditCard, FileText, CheckCircle, ExternalLink } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { ActionMenu } from '../../../shared/components/ActionMenu';
import { CargoDetailModal } from './CargoDetailModal';

export interface Cargo {
  id: number;
  descripcion: string;
  monto: number;
  fechaEmision: string;
  pagado: boolean;
  tipo?: string;
  observaciones?: string;
  facturaId?: number;
  factura?: any;
  embarcacion?: any;
  cliente: {
    id: number;
    nombre: string;
    embarcaciones?: any[];
  };
}

interface CargosListProps {
  cargos: Cargo[];
  isLoading: boolean;
  onCobrar?: (cargo: Cargo) => void;
}

export function CargosList({ cargos, isLoading, onCobrar }: CargosListProps) {
  const [selectedCargo, setSelectedCargo] = useState<Cargo | null>(null);

  const extractVesselName = (cargo: Cargo) => {
    if (!cargo.descripcion) return 'GENERAL';
    const parts = cargo.descripcion.split(/ - |: /);
    if (parts.length > 1) return parts[1];
    return cargo.descripcion;
  };

  return (
    <>
      <div className="overflow-x-auto">
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
              <tr><td colSpan={6} className="px-8 py-20 text-center text-[var(--text-muted)] font-bold bg-[var(--bg-secondary)]/20">Sincronizando registros...</td></tr>
            ) : cargos.length === 0 ? (
              <tr><td colSpan={6} className="px-8 py-20 text-center text-[var(--text-muted)] font-bold bg-[var(--bg-secondary)]/20">No se detectaron cargos pendientes.</td></tr>
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
                    {new Date(cargo.fechaEmision).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
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
                          { label: 'Imprimir Recibo', icon: ExternalLink, onClick: () => toast.info('Generando recibo...') },
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

      {/* Modal de Detalle */}
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
