import { createPortal } from 'react-dom';
import { useState } from 'react';
import { CreditCard, X, Wallet } from 'lucide-react';

const METODOS = [
  { value: 'EFECTIVO', label: 'Efectivo' },
  { value: 'TRANSFERENCIA', label: 'Transferencia' },
  { value: 'TARJETA', label: 'Tarjeta' },
  { value: 'CHEQUE', label: 'Cheque' },
];

interface LiquidarFacturaModalProps {
  factura: any;
  isPending: boolean;
  onConfirm: (facturaId: number, metodoPago: string) => void;
  onClose: () => void;
}

export function LiquidarFacturaModal({
  factura,
  isPending,
  onConfirm,
  onClose,
}: LiquidarFacturaModalProps) {
  // If payment was reported, default to that method if it matches our list, otherwise default to EFECTIVO
  const initialMetodo = factura.pagoMedio && METODOS.some(m => m.value === factura.pagoMedio) 
    ? factura.pagoMedio 
    : 'EFECTIVO';
    
  const [metodoPago, setMetodoPago] = useState(initialMetodo);

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div
        className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-3xl p-8 w-full max-w-sm shadow-2xl animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600/10 border border-emerald-500/20 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-sm font-black text-[var(--text-primary)] uppercase tracking-widest">
                Liquidar Factura
              </h3>
              <p className="text-[10px] text-[var(--text-secondary)] uppercase tracking-widest mt-0.5">
                Seleccioná el método de pago
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] rounded-xl transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-6">
          {METODOS.map((m) => (
            <button
              key={m.value}
              onClick={() => setMetodoPago(m.value)}
              className={`py-3 px-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                metodoPago === m.value
                  ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-900/30'
                  : 'bg-[var(--bg-surface)] border-[var(--border-primary)] text-[var(--text-secondary)] hover:border-emerald-500/40 hover:text-[var(--text-primary)]'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        {factura.pagoIdComprobante && (
          <div className="mb-6 p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Información del Cliente</span>
            </div>
            <div className="space-y-1.5">
              <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">
                ID: <span className="text-[var(--text-primary)] font-black">{factura.pagoIdComprobante}</span>
              </p>
              <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">
                Fecha: <span className="text-[var(--text-primary)] font-black">{new Date(factura.pagoFecha).toLocaleDateString()}</span>
              </p>
              <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">
                Medio: <span className="text-[var(--text-primary)] font-black">{factura.pagoMedio}</span>
              </p>
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-2xl border border-[var(--border-primary)] text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={() => onConfirm(factura.id, metodoPago)}
            disabled={isPending}
            className="flex-1 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50"
          >
            {isPending ? 'Procesando...' : 'Confirmar'}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
