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
      onClose();
    } catch (error) {
      console.error(`Error al ${type === 'ABRIR' ? 'abrir' : 'cerrar'} caja:`, error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isOpening = type === 'ABRIR';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" 
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-slate-800/60 bg-slate-900/50">
          <div>
            <h3 className="text-xl font-extrabold text-white flex items-center gap-3">
              {isOpening ? (
                <Unlock className="w-6 h-6 text-emerald-500" />
              ) : (
                <Lock className="w-6 h-6 text-rose-500" />
              )}
              {isOpening ? 'Apertura de Caja' : 'Cierre de Caja'}
            </h3>
            <p className="text-slate-400 text-sm mt-1">
              {isOpening ? 'Inicia la jornada financiera.' : 'Finaliza el turno y asienta el saldo.'}
            </p>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="p-2 bg-slate-950 text-slate-400 hover:text-white rounded-xl border border-slate-800 active:scale-95 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          
          <div className="bg-slate-950/50 p-6 rounded-2xl border border-slate-800/50 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <Landmark className="w-3.5 h-3.5" />
                {isOpening ? 'Saldo Inicial' : 'Saldo de Cierre'}
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tighter ${isOpening ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                {type}
              </span>
            </div>

            <div className="relative">
              <DollarSign className={`absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 ${isOpening ? 'text-emerald-500' : 'text-rose-500'} opacity-50`} />
              <input
                type="number"
                required
                autoFocus
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-14 pr-5 py-6 text-3xl text-white placeholder:text-slate-800 focus:outline-none focus:border-indigo-500 transition-all font-black"
                value={monto}
                onChange={e => setMonto(parseFloat(e.target.value))}
                placeholder="0.00"
              />
            </div>
            
            {!isOpening && (
              <div className="flex items-center gap-2 text-xs text-slate-500 px-1 italic">
                <ArrowRightLeft className="w-3 h-3" />
                Saldo calculado según movimientos: ${currentBalance.toLocaleString()}
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-2xl transition-all active:scale-95"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`flex-[2] px-8 py-4 ${isOpening ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20' : 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/20'} disabled:opacity-50 text-white font-black rounded-2xl transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2`}
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                isOpening ? 'Abrir Caja' : 'Cerrar Caja'
              )}
            </button>
          </div>

          <p className="text-[10px] text-center text-slate-600 uppercase tracking-widest font-bold">
            Esta acción es irreversible una vez confirmada.
          </p>
        </form>
      </div>
    </div>
  );
}
