import React, { useState } from 'react';
import { httpClient } from '../../../shared/api/HttpClient';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, X, Send, AlertCircle, CheckCircle2, Loader2, ChevronRight } from 'lucide-react';

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
      await httpClient.post(`/facturas/${factura.id}/send-email`, { email });
      setStatus('success');
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 2000);
    } catch (error: any) {
      setErrorMessage(error.response?.data?.message || error.message || 'Error al enviar el email');
      setStatus('error');
    } finally {
      setIsSending(false);
    }
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
        className="w-full max-w-md bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-[2.5rem] shadow-2xl overflow-hidden relative z-10"
      >
        <div className="px-8 pt-8 pb-6">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-3xl bg-[var(--accent-primary-soft)] text-[var(--accent-primary)] border border-[var(--accent-primary-ring)] shadow-sm">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-black text-[var(--text-primary)] uppercase tracking-tight">Enviar Factura</h2>
                <p className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-widest mt-1">Factura N° {factura.numero}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] rounded-xl transition-all"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <AnimatePresence mode="wait">
            {status === 'success' ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-12 text-center"
              >
                <div className="inline-flex p-6 rounded-full bg-[var(--accent-teal-soft)] text-[var(--accent-teal)] mb-6 border border-[var(--accent-teal-soft)] shadow-sm">
                  <CheckCircle2 className="w-12 h-12" />
                </div>
                <h3 className="text-lg font-black text-[var(--text-primary)] uppercase tracking-widest">¡Enviado con Éxito!</h3>
                <p className="text-[10px] text-[var(--text-muted)] font-bold mt-2 uppercase tracking-tight">La factura ha sido procesada y enviada.</p>
              </motion.div>
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-8"
              >
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] ml-1">
                    Email de Destino
                  </label>
                  <div className="relative group">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="ejemplo@correo.com"
                      className="w-full bg-[var(--bg-secondary)]/50 border border-[var(--border-primary)] focus:border-[var(--accent-primary)] rounded-2xl px-6 py-5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-disabled)] outline-none transition-all group-hover:bg-[var(--bg-secondary)] font-mono"
                    />
                    {!factura.cliente?.email && email && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                        <span className="text-[9px] font-black text-[var(--accent-amber)] uppercase tracking-widest bg-[var(--accent-amber-soft)] px-2 py-1 rounded-lg border border-[var(--accent-amber-soft)]">
                          Nuevo
                        </span>
                      </div>
                    )}
                  </div>
                  {!factura.cliente?.email && (
                    <p className="text-[9px] text-[var(--text-disabled)] font-bold ml-1 italic leading-relaxed">
                      * El email será guardado automáticamente en el registro del cliente al completar el envío.
                    </p>
                  )}
                </div>

                {status === 'error' && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 p-4 rounded-2xl bg-[var(--accent-red-soft)] border border-[var(--accent-red-soft)] text-[var(--accent-red)]"
                  >
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <p className="text-[10px] font-bold uppercase tracking-widest">{errorMessage}</p>
                  </motion.div>
                )}

                <div className="pt-2">
                  <button
                    disabled={isSending}
                    onClick={handleSend}
                    className="w-full py-5 bg-[var(--accent-primary)] hover:brightness-110 disabled:opacity-50 text-white rounded-[1.5rem] font-black uppercase tracking-[0.2em] transition-all active:scale-95 shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-4 group"
                  >
                    {isSending ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Procesando...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5 group-hover:skew-x-12 transition-transform" />
                        <span>Enviar Comprobante</span>
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        <div className="px-8 py-6 bg-[var(--bg-secondary)]/50 border-t border-[var(--border-secondary)] flex justify-center">
           <button
            onClick={onClose}
            className="flex items-center gap-2 text-[9px] font-black text-[var(--text-disabled)] uppercase tracking-widest hover:text-[var(--text-muted)] transition-colors"
          >
            Volver al listado
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </motion.div>
    </div>,
    document.body
  );
};
