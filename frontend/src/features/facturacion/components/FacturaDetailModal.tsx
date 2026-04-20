import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-presence';
import { FileText, X, History, Download, Mail, Calendar, User, CreditCard, ChevronRight, Clock, Info, CheckCircle2, AlertCircle } from 'lucide-react';

interface FacturaDetailModalProps {
  factura: any;
  onClose: () => void;
  onSendEmail: () => void;
}

export const FacturaDetailModal: React.FC<FacturaDetailModalProps> = ({ factura, onClose, onSendEmail }) => {
  const [activeTab, setActiveTab] = useState<'general' | 'audit'>('general');
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [isLoadingAudit, setIsLoadingAudit] = useState(false);

  useEffect(() => {
    if (activeTab === 'audit') {
      fetchAuditLogs();
    }
  }, [activeTab]);

  const fetchAuditLogs = async () => {
    setIsLoadingAudit(true);
    try {
      const token = localStorage.getItem('token');
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';
      // Buscamos notificaciones recientes y filtramos por el número de factura
      const response = await fetch(`${baseUrl}/notificaciones?limit=50`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        const logs = data.filter((n: any) => 
          n.mensaje?.includes(factura.numero) || n.titulo?.includes(factura.numero)
        );
        setAuditLogs(logs);
      }
    } catch (error) {
      console.error('Error fetching audit logs:', error);
    } finally {
      setIsLoadingAudit(false);
    }
  };

  const downloadPdf = async () => {
    try {
      const token = localStorage.getItem('token');
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';
      const response = await fetch(`${baseUrl}/facturas/${factura.id}/pdf`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Error al generar PDF');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `factura-${factura.numero}.pdf`;
      a.click();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl bg-[#0a0a0f] border border-slate-800/50 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header con Tabs */}
        <div className="px-10 pt-10 pb-6 border-b border-slate-800/30">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-3xl bg-indigo-500/10 text-indigo-400 group border border-indigo-500/20 shadow-[0_0_20px_rgba(99,102,241,0.1)]">
                <FileText className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-white uppercase tracking-tight">Detalle de Factura</h2>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">{factura.numero}</span>
                  <div className="w-1 h-1 rounded-full bg-slate-700" />
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{factura.cliente?.nombre}</span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-3 rounded-2xl bg-white/5 text-slate-500 hover:text-white hover:bg-white/10 transition-all active:scale-90"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-white/5 border border-white/5 w-fit">
            <button
              onClick={() => setActiveTab('general')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTab === 'general' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              General
            </button>
            <button
              onClick={() => setActiveTab('audit')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTab === 'audit' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              Audit Trail
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-10">
          <AnimatePresence mode="wait">
            {activeTab === 'general' ? (
              <motion.div
                key="general"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-10"
              >
                {/* Info Grid */}
                <div className="grid grid-cols-4 gap-8">
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                      <Calendar className="w-3 h-3 text-indigo-400" /> Emisión
                    </p>
                    <p className="text-sm font-black text-white">{new Date(factura.fechaEmision).toLocaleDateString('es-AR')}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                      <CreditCard className="w-3 h-3 text-emerald-400" /> Estado
                    </p>
                    <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg ${
                      factura.estado === 'PAGADA' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                    }`}>
                      {factura.estado}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                      <User className="w-3 h-3 text-sky-400" /> Cliente ID
                    </p>
                    <p className="text-sm font-black text-white">{factura.cliente?.id}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                      <Info className="w-3 h-3 text-indigo-400" /> Total
                    </p>
                    <p className="text-lg font-black text-indigo-400">$ {Number(factura.total).toLocaleString()}</p>
                  </div>
                </div>

                {/* Cargos Table */}
                <div className="space-y-4">
                  <h3 className="text-xs font-black text-white uppercase tracking-[0.2em] flex items-center gap-3">
                    Items de Facturación
                    <div className="h-px flex-1 bg-slate-800/50" />
                  </h3>
                  <div className="bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden shadow-inner">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-white/5 border-b border-slate-800">
                          <th className="px-8 py-5 text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Concepto</th>
                          <th className="px-8 py-5 text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Tipo</th>
                          <th className="px-8 py-5 text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] text-right">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/50">
                        {factura.cargos?.map((cargo: any) => (
                          <tr key={cargo.id} className="hover:bg-white/5 transition-colors group">
                            <td className="px-8 py-5">
                              <p className="text-xs font-black text-white uppercase tracking-tight group-hover:text-indigo-400 transition-colors">{cargo.descripcion}</p>
                              {cargo.observaciones && <p className="text-[9px] text-slate-500 font-bold mt-1 italic">{cargo.observaciones}</p>}
                            </td>
                            <td className="px-8 py-5 text-[10px] text-slate-400 font-black uppercase tracking-widest">{cargo.tipo}</td>
                            <td className="px-8 py-5 text-right text-sm font-black text-white">$ {Number(cargo.monto).toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="audit"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {isLoadingAudit ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest animate-pulse">Consultando bitácora...</p>
                  </div>
                ) : auditLogs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 rounded-[2rem] border border-dashed border-slate-800">
                    <History className="w-12 h-12 text-slate-700 opacity-20" />
                    <div>
                      <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Sin registros de actividad</p>
                      <p className="text-[9px] text-slate-600 font-bold mt-1">Los eventos automáticos aparecerán aquí.</p>
                    </div>
                  </div>
                ) : (
                  <div className="relative pl-8 space-y-8 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-800 shadow-xl">
                    {auditLogs.map((log) => (
                      <div key={log.id} className="relative">
                        <div className={`absolute -left-[30px] top-1 p-1.5 rounded-full z-10 border-4 border-[#0a0a0f] shadow-lg ${
                          log.tipo === 'EXITO' ? 'bg-emerald-500 shadow-emerald-500/20' : 
                          log.tipo === 'INFO' ? 'bg-indigo-500 shadow-indigo-500/20' : 'bg-slate-700 shadow-slate-700/20'
                        }`}>
                          {log.tipo === 'EXITO' ? <CheckCircle2 className="w-3 h-3 text-white" /> : 
                           log.tipo === 'ERROR' ? <AlertCircle className="w-3 h-3 text-white" /> : <Clock className="w-3 h-3 text-white" />}
                        </div>
                        <div className="bg-[#12121a]/50 p-6 rounded-3xl border border-slate-800/50 hover:border-slate-700 transition-all group">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-[11px] font-black text-white uppercase tracking-widest group-hover:text-indigo-400 transition-colors">{log.titulo}</h4>
                            <span className="text-[9px] font-bold text-slate-600 flex items-center gap-2">
                              <Clock className="w-3 h-3" />
                              {new Date(log.createdAt).toLocaleString('es-AR')}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 leading-relaxed font-medium uppercase tracking-tight">{log.mensaje}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Actions */}
        <div className="px-10 py-8 bg-white/[0.02] border-t border-slate-800/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <button
              onClick={downloadPdf}
              className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-white/5 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all active:scale-95 group"
            >
              <Download className="w-4 h-4 text-indigo-400 group-hover:-translate-y-0.5 transition-transform" />
              Descargar PDF
            </button>
            <button
              onClick={onSendEmail}
              className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500 transition-all active:scale-95 shadow-xl shadow-indigo-600/20 group"
            >
              <Mail className="w-4 h-4 group-hover:skew-x-6 transition-transform" />
              Enviar Email
            </button>
          </div>
          
          <button
            onClick={onClose}
            className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-colors py-2 px-4"
          >
            Cerrar Ventana
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </motion.div>
    </div>
  );
};
