import { useState, useEffect } from 'react';
import { X, Landmark, DollarSign, Loader2, ArrowRightLeft, Lock, Unlock } from 'lucide-react';

interface CajaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (monto: number) => Promise<void>;
  type: 'ABRIR' | 'CERRAR';
  currentBalance?: number;
}

export function CajaModal({ isOpen, onClose, onConfirm, type, currentBalance = 0 }: CajaModalProps) {
  const [monto, setMonto] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (type === 'CERRAR') {
        setMonto(currentBalance);
      } else {
        setMonto(0);
      }
    }
  }, [isOpen, type, currentBalance]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onConfirm(monto);
    } catch {
      // El error ya fue manejado por el caller con toast
    } finally {
      setIsSubmitting(false);
    }
  };

  const isOpening = type === 'ABRIR';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[var(--bg-primary)]/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)]/60 w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden transform animate-in slide-in-from-bottom-8 duration-500">

        <div className="px-8 pt-8 pb-6 border-b border-[var(--border-primary)]/60 flex justify-between items-start">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-all duration-500 ${isOpening ? 'bg-emerald-600/10 border-emerald-500/20 text-emerald-500' : 'bg-rose-600/10 border-rose-500/20 text-rose-500'
              }`}>
              {isOpening ? <Unlock className="w-6 h-6" /> : <Lock className="w-6 h-6" />}
            </div>
            <div>
              <h3 className="text-xl font-black text-[var(--text-primary)] uppercase tracking-tight">
                {isOpening ? 'Apertura Fiscal' : 'Cierre de Caja'}
              </h3>
              <p className="text-xs text-[var(--text-secondary)] font-bold uppercase tracking-widest mt-0.5">Tesorería y flujos de efectivo</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[var(--bg-primary)] rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">

          <div className="bg-[var(--bg-primary)]/40 p-6 rounded-2xl border border-[var(--border-primary)]/60 space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest flex items-center gap-2">
                <Landmark className="w-3.5 h-3.5" />
                {isOpening ? 'Fondo inicial de caja' : 'Saldo final auditado'}
              </label>
              <div className={`px-2 py-0.5 rounded border text-[9px] font-black uppercase tracking-widest ${isOpening ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-rose-500/10 border-rose-500/20 text-rose-500'
                }`}>
                MODO: {type}
              </div>
            </div>

            <div className="relative">
              <DollarSign className={`absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 ${isOpening ? 'text-emerald-500' : 'text-rose-500'} opacity-30`} />
              <input
                type="number"
                required
                autoFocus
                className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-2xl pl-14 pr-5 py-6 text-4xl text-[var(--text-primary)] focus:outline-none focus:border-indigo-500 transition-all font-black tabular-nums"
                value={monto}
                onChange={e => setMonto(parseFloat(e.target.value))}
                placeholder="0.00"
              />
            </div>

            {!isOpening && (
              <div className="flex items-center justify-between text-[10px] text-[var(--text-secondary)] px-1 font-black uppercase tracking-widest">
                <span className="flex items-center gap-2">
                  <ArrowRightLeft className="w-3 h-3" />
                  Balance Contable:
                </span>
                <span className="text-[var(--text-primary)]">${currentBalance.toLocaleString()}</span>
              </div>
            )}
          </div>

          <div className="flex gap-4 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3.5 border border-[var(--border-primary)] text-[var(--text-secondary)] font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-[var(--bg-primary)] hover:text-[var(--text-primary)] transition-all underline-offset-4"
            >
              Cerrar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`flex-[2] px-8 py-3.5 ${isOpening ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/40' : 'bg-rose-600 hover:bg-rose-500 shadow-rose-900/40'} disabled:opacity-50 text-[var(--text-primary)] font-black rounded-xl text-xs uppercase tracking-[0.2em] shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3`}
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin text-[var(--text-primary)]" />
              ) : (
                isOpening ? 'Confirmar Apertura' : 'Ejecutar Cierre'
              )}
            </button>
          </div>

          <p className="text-[10px] text-center text-[var(--text-secondary)]/60 uppercase tracking-widest font-black leading-relaxed italic">
            Esta operación generará un asiento irreversible en el historial contable de tesorería.
          </p>
        </form>
      </div>
    </div>
  );
}
