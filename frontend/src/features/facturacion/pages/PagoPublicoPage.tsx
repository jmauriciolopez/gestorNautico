import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  CreditCard, 
  Calendar, 
  Hash, 
  User, 
  ChevronRight, 
  Send, 
  CheckCircle2,
  AlertCircle,
  Download,
  Info
} from 'lucide-react';
import { useFacturaPublica, useReportarPagoPublico } from '../hooks/useFacturasPublicas';
import { toast } from 'react-hot-toast';

export const PagoPublicoPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const { data: factura, isLoading, error } = useFacturaPublica(token);
  const reportarMutation = useReportarPagoPublico();

  const [form, setForm] = useState({
    idComprobante: '',
    fechaPago: new Date().toISOString().split('T')[0],
    medioPago: '',
    observaciones: ''
  });

  const [enviado, setEnviado] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    try {
      await reportarMutation.mutateAsync({
        token,
        ...form
      });
      setEnviado(true);
      toast.success('Pago reportado con éxito');
    } catch (err) {
      // toast already handled by HttpClient interceptor if configured, 
      // but let's be safe
      console.error(err);
    }
  };

  const handleDownloadPdf = () => {
    if (!token) return;
    const url = `${import.meta.env.VITE_API_URL}/facturas/public/${token}/pdf`;
    window.open(url, '_blank');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0b1020]">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (error || !factura) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0b1020] p-4">
        <div className="glass p-8 rounded-[32px] max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Factura no encontrada</h1>
          <p className="text-slate-400 mb-6">
            No pudimos encontrar la factura solicitada. Por favor, verifique el link enviado.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b1020] py-12 px-4 sm:px-6 lg:px-8 font-['Outfit'] text-slate-200">
      <div className="max-w-4xl mx-auto">
        
        {/* Header con Logo o Nombre */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-12"
        >
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <span className="p-2 bg-indigo-600/20 rounded-xl">
                <CreditCard className="w-8 h-8 text-indigo-400" />
              </span>
              Pago de Factura
            </h1>
            <p className="text-slate-400 mt-1">Portal de autogestión para clientes</p>
          </div>
          <div className="hidden sm:block text-right">
            <span className="text-sm font-semibold text-indigo-400 bg-indigo-500/10 px-4 py-2 rounded-full border border-indigo-500/20">
              {factura.estado === 'PENDIENTE' ? 'Pendiente de Pago' : 'Informada / Pagada'}
            </span>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          
          {/* Lado Izquierdo: Detalles de la Factura */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2 space-y-6"
          >
            <div className="bento-card p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5">
                <FileText className="w-24 h-24" />
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-slate-400">
                  <Hash className="w-4 h-4" />
                  <span className="text-sm font-medium">Factura #{factura.numero}</span>
                </div>
                
                <div className="py-2">
                  <span className="text-slate-400 text-xs uppercase tracking-widest font-bold">Total a Pagar</span>
                  <div className="kpi-value text-indigo-400 mt-1">
                    ${Number(factura.total).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5 space-y-3">
                  <div className="flex items-center gap-3">
                    <User className="w-4 h-4 text-slate-500" />
                    <span className="text-sm text-slate-300">{factura.clienteNombre}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-slate-500" />
                    <span className="text-sm text-slate-300">Emisión: {new Date(factura.fechaEmision).toLocaleDateString()}</span>
                  </div>
                </div>

                <button 
                  onClick={handleDownloadPdf}
                  className="w-full btn btn-secondary mt-4 group"
                >
                  <Download className="w-4 h-4 mr-2 group-hover:animate-bounce" />
                  Ver PDF Completo
                </button>
              </div>
            </div>

            <div className="bento-card p-6 bg-indigo-600/5 border-indigo-500/20">
              <h3 className="text-sm font-bold flex items-center gap-2 mb-4 text-indigo-300">
                <Info className="w-4 h-4" />
                Detalle de Conceptos
              </h3>
              <div className="space-y-3">
                {factura.cargos.map((cargo, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span className="text-slate-400">{cargo.descripcion}</span>
                    <span className="font-semibold">${Number(cargo.monto).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Lado Derecho: Formulario de Pago */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-3"
          >
            <AnimatePresence mode="wait">
              {!enviado ? (
                <motion.div 
                  key="form"
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="glass p-8 rounded-[40px] shadow-premium"
                >
                  <h2 className="text-xl font-bold mb-6">Informar Transferencia</h2>
                  
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 ml-1">
                        ID de Comprobante / Transacción
                      </label>
                      <input 
                        required
                        type="text"
                        placeholder="Ej: 245896321"
                        className="input-ui h-12"
                        value={form.idComprobante}
                        onChange={e => setForm({...form, idComprobante: e.target.value})}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 ml-1">
                          Fecha de Pago
                        </label>
                        <input 
                          required
                          type="date"
                          className="input-ui h-12"
                          value={form.fechaPago}
                          onChange={e => setForm({...form, fechaPago: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 ml-1">
                          Medio de Pago
                        </label>
                        <select 
                          required
                          className="select-ui h-12"
                          value={form.medioPago}
                          onChange={e => setForm({...form, medioPago: e.target.value})}
                        >
                          <option value="">Seleccione...</option>
                          <option value="Transferencia Bancaria">Transferencia Bancaria</option>
                          <option value="Mercado Pago">Mercado Pago</option>
                          <option value="Efectivo / Depósito">Efectivo / Depósito</option>
                          <option value="Otro">Otro</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 ml-1">
                        Observaciones adicionales (opcional)
                      </label>
                      <textarea 
                        className="textarea-ui"
                        placeholder="Algún detalle que debamos saber..."
                        value={form.observaciones}
                        onChange={e => setForm({...form, observaciones: e.target.value})}
                      />
                    </div>

                    <button 
                      disabled={reportarMutation.isPending}
                      type="submit"
                      className="w-full btn btn-primary h-14 text-lg shadow-lg shadow-indigo-500/20"
                    >
                      {reportarMutation.isPending ? (
                        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity }} className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
                      ) : (
                        <>
                          Enviar Reporte de Pago
                          <Send className="w-5 h-5 ml-2" />
                        </>
                      )}
                    </button>
                  </form>
                </motion.div>
              ) : (
                <motion.div 
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="glass p-12 rounded-[40px] text-center"
                >
                  <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-4">¡Reporte Recibido!</h2>
                  <p className="text-slate-400 max-w-sm mx-auto mb-8">
                    Tu información ha sido enviada correctamente. El administrador de la guardería revisará los datos y actualizará el estado de tu factura en breve.
                  </p>
                  <div className="p-4 bg-white/5 rounded-2xl text-left space-y-2 mb-8">
                    <p className="text-xs text-slate-500 font-bold uppercase">Datos del reporte:</p>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Comprobante:</span>
                      <span className="text-white font-medium">{form.idComprobante}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Fecha:</span>
                      <span className="text-white font-medium">{new Date(form.fechaPago).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => setEnviado(false)}
                    className="btn btn-ghost"
                  >
                    ¿Necesitas corregir algo? Haz click aquí
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Footer info */}
        <div className="mt-16 text-center text-slate-500 text-xs">
          <p>© {new Date().getFullYear()} Gestor Náutico - Conectando Guarderías y Clientes</p>
        </div>
      </div>
    </div>
  );
};
