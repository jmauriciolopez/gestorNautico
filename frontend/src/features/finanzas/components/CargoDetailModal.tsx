import React from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import {
  X, FileText, DollarSign, Calendar, User, CreditCard,
  CheckCircle2, Anchor, ChevronRight, Hash
} from 'lucide-react';

interface CargoDetailModalProps {
  cargo: any;
  onClose: () => void;
  onCobrar?: (cargo: any) => void;
}

export const CargoDetailModal: React.FC<CargoDetailModalProps> = ({ cargo, onClose, onCobrar }) => {
  const isPendiente = !cargo.pagado;

  // Extrae nombre de embarcación — prioriza el objeto, luego parsea la descripción
  const extractVesselName = (): string => {
    if (cargo.embarcacion?.nombre) return cargo.embarcacion.nombre;
    if (cargo.cliente?.embarcaciones?.[0]?.nombre) return cargo.cliente.embarcaciones[0].nombre;
    if (!cargo.descripcion) return 'N/A';
    const parts = cargo.descripcion.split(/ - | — |: /);
    if (parts.length > 1) return parts[parts.length - 1].trim();
    return 'N/A';
  };

  // Solo el concepto (sin el sufijo " - Embarcación X")
  const extractConcept = (): string => {
    if (!cargo.descripcion) return '—';
    const parts = cargo.descripcion.split(/ - | — /);
    return parts[0].trim();
  };

  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-[var(--modal-overlay)] backdrop-blur-md"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-lg bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col relative z-10"
      >
        {/* Header */}
        <div className="px-8 pt-8 pb-6 border-b border-[var(--border-secondary)]">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-3xl bg-[var(--accent-primary-soft)] text-[var(--accent-primary)] border border-[var(--accent-primary-ring)] shadow-sm shrink-0">
                <FileText className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-xl font-black text-[var(--text-primary)] uppercase tracking-tight leading-tight">
                  Detalle del Cargo
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-xl border ${
                    isPendiente
                      ? 'bg-[var(--accent-amber-soft)] text-[var(--accent-amber)]'
                      : 'bg-[var(--accent-teal-soft)] text-[var(--accent-teal)]'
                  }`}>
                    {isPendiente ? 'Pendiente' : 'Liquidado'}
                  </span>
                  {cargo.tipo && (
                    <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-xl bg-[var(--bg-elevated)] text-[var(--text-muted)] border border-[var(--border-secondary)]">
                      {cargo.tipo}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2.5 rounded-2xl bg-[var(--bg-elevated)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] transition-all active:scale-90 shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* KPI Strip */}
        <div className="grid grid-cols-2 gap-3 px-8 pt-6">
          {[
            {
              label: 'Monto',
              value: `$ ${Number(cargo.monto).toLocaleString('es-AR', { minimumFractionDigits: 2 })}`,
              icon: DollarSign,
              color: 'var(--accent-primary)',
            },
            {
              label: 'Emisión',
              value: new Date(cargo.fechaEmision).toLocaleDateString('es-AR', {
                day: '2-digit', month: 'short', year: 'numeric',
              }),
              icon: Calendar,
              color: 'var(--accent-purple)',
            },
            {
              label: 'Cliente',
              value: cargo.cliente?.nombre || '—',
              icon: User,
              color: 'var(--accent-teal)',
            },
            {
              label: 'Embarcación',
              value: extractVesselName(),
              icon: Anchor,
              color: 'var(--accent-amber)',
            },
          ].map(({ label, value, icon: Icon, color }) => (
            <div
              key={label}
              className="flex items-center gap-3 bg-[var(--bg-primary)] border border-[var(--border-secondary)] rounded-2xl px-5 py-4"
            >
              <div
                className="p-2 rounded-xl shrink-0"
                style={{ background: `color-mix(in srgb, ${color} 12%, transparent)` }}
              >
                <Icon className="w-4 h-4" style={{ color }} />
              </div>
              <div className="min-w-0">
                <p className="text-[8px] font-black text-[var(--text-disabled)] uppercase tracking-[0.2em]">{label}</p>
                <p className="text-xs font-black text-[var(--text-primary)] truncate">{value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Concepto — sin la parte de embarcación */}
        <div className="px-8 pt-6 pb-2 space-y-2">
          <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em]">Concepto</p>
          <div className="bg-[var(--bg-secondary)]/40 border border-[var(--border-secondary)] rounded-2xl px-5 py-4">
            <p className="text-sm font-medium text-[var(--text-secondary)] leading-relaxed">
              {extractConcept()}
            </p>
          </div>
        </div>

        {/* Observaciones */}
        {cargo.observaciones && (
          <div className="px-8 pt-4 pb-2 space-y-2">
            <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em]">Observaciones</p>
            <div className="bg-[var(--bg-secondary)]/40 border border-[var(--border-secondary)] rounded-2xl px-5 py-4">
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed italic">{cargo.observaciones}</p>
            </div>
          </div>
        )}

        {/* Factura vinculada */}
        {cargo.facturaId && (
          <div className="px-8 pt-4 pb-2">
            <div className="flex items-center gap-3 bg-[var(--accent-primary-soft)] border border-[var(--accent-primary-ring)] rounded-2xl px-5 py-4">
              <Hash className="w-4 h-4 text-[var(--accent-primary)] shrink-0" />
              <div>
                <p className="text-[8px] font-black text-[var(--accent-primary)] uppercase tracking-widest">Vinculado a factura</p>
                <p className="text-sm font-black text-[var(--text-primary)]">{cargo.factura?.numero || `#${cargo.facturaId}`}</p>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-8 py-7 mt-4 border-t border-[var(--border-secondary)] bg-[var(--bg-secondary)]/40 flex items-center justify-between gap-3">
          <div>
            {isPendiente && onCobrar && (
              <button
                onClick={() => { onCobrar(cargo); onClose(); }}
                className="flex items-center gap-2.5 px-7 py-3.5 rounded-2xl bg-[var(--accent-primary)] text-white text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all active:scale-95 shadow-lg"
              >
                <CreditCard className="w-4 h-4" />
                Registrar Cobro
              </button>
            )}
            {!isPendiente && (
              <div className="flex items-center gap-2 text-[var(--accent-teal)]">
                <CheckCircle2 className="w-5 h-5" />
                <span className="text-[10px] font-black uppercase tracking-widest">Cargo liquidado</span>
              </div>
            )}
          </div>

          <button
            onClick={onClose}
            className="flex items-center gap-1.5 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest hover:text-[var(--text-primary)] transition-colors"
          >
            Cerrar
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </motion.div>
    </div>,
    document.body
  );
};
