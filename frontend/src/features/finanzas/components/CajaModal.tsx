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
      <div className="bg-[var(--modal-glass-bg)] border border-[var(--border-primary)] w-full max-w-md rounded-[3rem] shadow-[0_32px_128px_-16px_rgba(0,0,0,0.5)] overflow-y-auto max-h-[calc(100vh-2rem)] transform animate-in slide-in-from-bottom-8 duration-500 custom-scrollbar">

        {/* Header */}
        <div className={`px-10 pt-10 pb-8 border-b border-[var(--border-primary)] flex justify-between items-start bg-gradient-to-br from-transparent to-transparent ${isOpening ? 'from-emerald-500/10' : 'from-rose-500/10'}`}>
          <div className="flex items-center gap-5">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-all duration-500 shadow-inner ${isOpening ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-rose-500/10 border-rose-500/20 text-rose-500'
              }`}>
              {isOpening ? <Unlock className="w-7 h-7" /> : <Lock className="w-7 h-7" />}
            </div>
            <div>
              <h3 className="text-2xl font-black text-[var(--text-primary)] uppercase tracking-tight">
                {isOpening ? 'Apertura Fiscal' : 'Cierre de Caja'}
              </h3>
              <p className="text-[10px] text-[var(--text-secondary)] font-black uppercase tracking-[0.25em] mt-1 opacity-60">Tesorería y flujos de efectivo</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-[var(--bg-primary)] rounded-full text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all active:scale-90 border border-transparent hover:border-[var(--border-primary)]">
            <X className="w-6 h-6" />
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
                className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-2xl pl-12 sm:pl-14 pr-5 py-4 sm:py-6 text-2xl sm:text-4xl text-[var(--text-primary)] focus:outline-none focus:border-indigo-500 transition-all font-black tabular-nums"
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

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-8 py-4 border border-[var(--border-primary)] text-[var(--text-secondary)] font-black text-[10px] uppercase tracking-[0.25em] rounded-2xl hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)] transition-all order-2 sm:order-1"
            >
              Cerrar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`flex-[2] px-8 py-4 ${isOpening ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/40' : 'bg-rose-600 hover:bg-rose-500 shadow-rose-900/40'} disabled:opacity-50 text-white font-black rounded-2xl text-[10px] uppercase tracking-[0.3em] shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-3 order-1 sm:order-2`}
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                isOpening ? <><ArrowRightLeft className="w-4 h-4" /> Confirmar Apertura</> : <><Lock className="w-4 h-4" /> Ejecutar Cierre</>
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
