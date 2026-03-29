import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, X, HelpCircle } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  options: {
    title?: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'primary' | 'danger';
  };
  onClose: (value: boolean) => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({ isOpen, options, onClose }) => {
  const isDanger = options.variant === 'danger';
  
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => onClose(false)}
            className="absolute inset-0 bg-[var(--modal-overlay)] backdrop-blur-sm"
          />
          
          {/* Dialog Container */}
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-md overflow-hidden rounded-3xl modal-glass border-t border-white/10"
          >
            {/* Header Accent */}
            <div className={`h-1.5 w-full ${isDanger ? 'bg-red-500' : 'bg-[var(--accent-primary)]'} opacity-50`} />
            
            <div className="p-8">
              <div className="flex items-start gap-4">
                <div className={`flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center ${isDanger ? 'bg-red-500/10 text-red-400' : 'bg-indigo-500/10 text-indigo-400'}`}>
                  {isDanger ? <AlertCircle className="w-6 h-6" /> : <HelpCircle className="w-6 h-6" />}
                </div>
                
                <div className="flex-1">
                  <h3 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
                    {options.title || (isDanger ? '¿Estás seguro?' : 'Confirmar Acción')}
                  </h3>
                  <p className="mt-2 text-sm text-[var(--text-secondary)] leading-relaxed">
                    {options.message}
                  </p>
                </div>

                <button 
                  onClick={() => onClose(false)}
                  className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-10 flex items-center justify-end gap-3">
                <button
                  onClick={() => onClose(false)}
                  className="px-5 py-2.5 text-sm font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all rounded-xl hover:bg-white/5"
                >
                  {options.cancelText || 'Cancelar'}
                </button>
                
                <button
                  autoFocus
                  onClick={() => onClose(true)}
                  className={`px-6 py-2.5 text-sm font-black uppercase tracking-widest rounded-xl transition-all shadow-lg ${
                    isDanger 
                      ? 'bg-red-500/80 hover:bg-red-600 text-white shadow-red-500/20' 
                      : 'bg-[var(--accent-primary)] hover:opacity-90 text-white shadow-indigo-500/20'
                  }`}
                >
                  {options.confirmText || (isDanger ? 'Eliminar' : 'Confirmar')}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
