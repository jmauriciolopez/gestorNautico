import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, X, CreditCard, Banknote, Landmark, Smartphone, Loader2 } from 'lucide-react';

interface LiquidarFacturaModalProps {
  factura: any;
  onClose: () => void;
  onConfirm: (metodoPago: string) => void;
  isProcessing?: boolean;
}

const METODOS = [
  { id: 'EFECTIVO', label: 'Efectivo', icon: Banknote, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  { id: 'TRANSFERENCIA', label: 'Transferencia', icon: Landmark, color: 'text-sky-400', bg: 'bg-sky-500/10' },
  { id: 'TARJETA', label: 'Tarjeta Crédito/Débito', icon: CreditCard, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
  { id: 'VIRTUAL', label: 'Billetera Virtual', icon: Smartphone, color: 'text-purple-400', bg: 'bg-purple-500/10' },
];

export const LiquidarFacturaModal: React.FC<LiquidarFacturaModalProps> = ({ factura, onClose, onConfirm, isProcessing }) => {
  const [selected, setSelected] = useState('EFECTIVO');

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md bg-[#0a0a0f] border border-slate-800/50 rounded-[2.5rem] shadow-2xl overflow-hidden"
      >
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-black text-white uppercase tracking-tight">Liquidar Factura</h2>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Total: $ {Number(factura.total).toLocaleString()}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 text-slate-500 hover:text-white transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 ml-1">Seleccione Medio de Pago</p>
          
          <div className="grid gap-3">
            {METODOS.map((m) => (
              <button
                key={m.id}
                onClick={() => setSelected(m.id)}
                className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                  selected === m.id 
                    ? 'bg-white/5 border-indigo-500/50 shadow-lg shadow-indigo-500/5' 
                    : 'bg-transparent border-slate-800/50 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-xl ${m.bg} ${m.color}`}>
                    <m.icon className="w-5 h-5" />
                  </div>
                  <span className={`text-xs font-black uppercase tracking-widest ${selected === m.id ? 'text-white' : 'text-slate-500'}`}>
                    {m.label}
                  </span>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                  selected === m.id ? 'border-indigo-500 bg-indigo-500' : 'border-slate-800'
                }`}>
                  {selected === m.id && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
              </button>
            ))}
          </div>

          <button
            disabled={isProcessing}
            onClick={() => onConfirm(selected)}
            className="w-full mt-8 py-5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-2xl font-black uppercase tracking-[0.2em] transition-all active:scale-95 shadow-xl shadow-emerald-900/20 flex items-center justify-center gap-3"
          >
            {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
            Confirmar Liquidación
          </button>
        </div>
      </motion.div>
    </div>
  );
};
