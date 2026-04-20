import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, X, Send, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

interface FacturaEmailModalProps {
  factura: any;
  onClose: () => void;
  onSuccess: () => void;
}

export const FacturaEmailModal: React.FC<FacturaEmailModalProps> = ({ factura, onClose, onSuccess }) => {
  const [email, setEmail] = useState(factura.cliente?.email || '');
  const [isSending, setIsSending] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSend = async () => {
    if (!email) {
      setErrorMessage('Por favor ingrese un email válido');
      setStatus('error');
      return;
    }

    setIsSending(true);
    setStatus('idle');
    
    try {
      const token = localStorage.getItem('token');
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';
      
      const response = await fetch(`${baseUrl}/facturas/${factura.id}/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ email })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al enviar el email');
      }

      setStatus('success');
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 2000);
    } catch (error: any) {
      setErrorMessage(error.message);
      setStatus('error');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden"
      >
        <div className="px-8 pt-8 pb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-black text-white uppercase tracking-tight">Enviar Factura</h2>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Factura N° {factura.numero}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-500 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {status === 'success' ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="py-8 text-center"
            >
              <div className="inline-flex p-4 rounded-full bg-emerald-500/10 text-emerald-500 mb-4 border border-emerald-500/20">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <p className="text-sm font-black text-white uppercase tracking-widest">Enviado con Éxito</p>
              <p className="text-[10px] text-slate-500 font-bold mt-2">La factura ha sido enviada al cliente.</p>
            </motion.div>
          ) : (
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">
                  Email del Cliente
                </label>
                <div className="relative group">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ejemplo@correo.com"
                    className="w-full bg-slate-800/50 border border-slate-700/50 focus:border-indigo-500/50 rounded-2xl px-5 py-4 text-sm text-white placeholder:text-slate-600 outline-none transition-all group-hover:bg-slate-800"
                  />
                  {!factura.cliente?.email && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                      <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest bg-amber-500/10 px-2 py-1 rounded-lg border border-amber-500/20">
                        Nuevo
                      </span>
                    </div>
                  )}
                </div>
                {!factura.cliente?.email && (
                  <p className="text-[9px] text-slate-500 font-bold ml-1 italic">
                    * El email será guardado automáticamente en la ficha del cliente.
                  </p>
                )}
              </div>

              {status === 'error' && (
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <p className="text-[10px] font-bold uppercase tracking-widest">{errorMessage}</p>
                </div>
              )}

              <button
                disabled={isSending}
                onClick={handleSend}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:hover:bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-[0.2em] transition-all active:scale-95 shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-3"
              >
                {isSending ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Enviando...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>Enviar Ahora</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
