import React, { useState, useEffect, useCallback } from 'react';
import { httpClient } from '../../../shared/api/HttpClient';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, X, History, Download, Mail, User, Clock, Info, CheckCircle2, AlertCircle, Anchor, Hash, DollarSign, BadgeCheck, Receipt, ChevronRight } from 'lucide-react';

interface FacturaDetailModalProps {
  factura: any;
  onClose: () => void;
  onSendEmail: () => void;
}

export const FacturaDetailModal: React.FC<FacturaDetailModalProps> = ({ factura, onClose, onSendEmail }) => {
  const [activeTab, setActiveTab] = useState<'general' | 'audit'>('general');
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [isLoadingAudit, setIsLoadingAudit] = useState(false);

  const fetchAuditLogs = useCallback(async () => {
    setIsLoadingAudit(true);
    try {
      const data = await httpClient.get<any[]>('/notificaciones?limit=50');
      const logs = data.filter((n: any) =>
        n.mensaje?.includes(factura.numero) || n.titulo?.includes(factura.numero)
      );
      setAuditLogs(logs);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
    } finally {
      setIsLoadingAudit(false);
    }
  }, [factura.numero]);

  useEffect(() => {
    if (activeTab === 'audit') {
      fetchAuditLogs();
    }
  }, [activeTab, fetchAuditLogs]);

  const downloadPdf = async () => {
    try {
      const blob = await httpClient.get<Blob>(`/facturas/${factura.id}/pdf`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `factura-${factura.numero}.pdf`;
      a.click();
    } catch (error) {
      console.error(error);
    }
  };

  const isEmitida = factura.estado === 'EMITIDA' || factura.estado === 'PENDIENTE';
  const stateBg = isEmitida ? 'bg-[var(--accent-amber-soft)]' : 'bg-[var(--accent-teal-soft)]';
  const stateText = isEmitida ? 'text-[var(--accent-amber)]' : 'text-[var(--accent-teal)]';

  const getEmbarcacionName = () => {
    if (factura.embarcacion?.nombre) return factura.embarcacion.nombre;
    if (factura.cliente?.embarcaciones?.[0]?.nombre) return factura.cliente.embarcaciones[0].nombre;
    
    const cargoConBarco = factura.cargos?.find((c: any) => c.descripcion?.includes(' - '));
    if (cargoConBarco) {
      const parts = cargoConBarco.descripcion.split(' - ');
      return parts[parts.length - 1].trim();
    }
    
    return 'N/A';
  };

  const getCleanDescription = (desc: string) => {
    if (!desc) return '';
    if (desc.includes(' - ')) {
      const parts = desc.split(' - ');
      return parts.slice(0, -1).join(' - ').trim();
    }
    return desc;
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
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 30, scale: 0.95 }}
        className="w-full max-w-4xl bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-[2.5rem] shadow-2xl overflow-y-auto max-h-[calc(100vh-2rem)] flex flex-col relative z-10 custom-scrollbar"
      >
        {/* ───── HEADER ───── */}
        <div className="px-10 pt-10 pb-6 border-b border-[var(--border-secondary)]">
          <div className="flex items-start justify-between mb-8">
            <div className="flex items-center gap-5">
              <div className="p-4 rounded-3xl bg-[var(--accent-primary-soft)] text-[var(--accent-primary)] border border-[var(--accent-primary-ring)] shadow-sm shrink-0">
                <Receipt className="w-8 h-8" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-2xl font-black text-[var(--text-primary)] uppercase tracking-tight leading-none">
                    {factura.numero}
                  </h2>
                  <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl border ${stateBg} ${stateText}`}>
                    {factura.estado}
                  </span>
                </div>
                <p className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-widest">
                  {factura.cliente?.nombre} · {new Date(factura.fechaEmision).toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' })}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-3 rounded-2xl bg-[var(--bg-elevated)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] transition-all active:scale-90 shrink-0"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* KPI Strip */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Total', value: `$ ${Number(factura.total).toLocaleString('es-AR')}`, icon: DollarSign, color: 'var(--accent-primary)' },
              { label: 'Cliente', value: factura.cliente?.nombre || '—', icon: User, color: 'var(--accent-purple)' },
              { label: 'Embarcación', value: getEmbarcacionName(), icon: Anchor, color: 'var(--accent-teal)' },
              { label: 'Conceptos', value: `${factura.cargos?.length || 0} ítem${(factura.cargos?.length || 0) !== 1 ? 's' : ''}`, icon: Hash, color: 'var(--accent-amber)' },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="bg-[var(--bg-primary)] border border-[var(--border-secondary)] rounded-2xl px-5 py-4 flex items-center gap-3">
                <div className="p-2 rounded-xl shrink-0" style={{ background: `color-mix(in srgb, ${color} 12%, transparent)` }}>
                  <Icon className="w-4 h-4" style={{ color }} />
                </div>
                <div className="min-w-0">
                  <p className="text-[8px] font-black text-[var(--text-disabled)] uppercase tracking-[0.2em]">{label}</p>
                  <p className="text-xs font-black text-[var(--text-primary)] truncate">{value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-secondary)] w-fit">
            {([
              { key: 'general', label: 'General', Icon: FileText },
              { key: 'audit', label: 'Audit Trail', Icon: History },
            ] as const).map(({ key, label, Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === key
                    ? 'bg-[var(--accent-primary)] text-white shadow-lg'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]'
                  }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* ───── CONTENT ───── */}
        <div className="flex-1 overflow-y-auto p-10 bg-[var(--bg-primary)]/30">
          <AnimatePresence mode="wait">
            {activeTab === 'general' ? (
              <motion.div
                key="general"
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 16 }}
                transition={{ duration: 0.18 }}
                className="space-y-8"
              >
                {/* Items Table */}
                <div className="space-y-4">
                  <h3 className="text-[10px] font-black text-[var(--text-primary)] uppercase tracking-[0.2em] flex items-center gap-3">
                    <BadgeCheck className="w-4 h-4 text-[var(--accent-primary)]" />
                    Conceptos Facturados
                    <div className="h-px flex-1 bg-[var(--border-secondary)]" />
                  </h3>

                  <div className="border border-[var(--border-primary)] rounded-3xl overflow-hidden">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-[var(--bg-secondary)]/60 border-b border-[var(--border-primary)]">
                          <th className="px-7 py-4 text-[9px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em]">Concepto</th>
                          <th className="px-7 py-4 text-[9px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em]">Tipo</th>
                          <th className="px-7 py-4 text-[9px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] text-right">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--border-secondary)]">
                        {factura.cargos?.length > 0 ? factura.cargos.map((cargo: any, idx: number) => (
                          <tr key={cargo.id ?? idx} className="hover:bg-[var(--bg-secondary)]/30 transition-colors group">
                            <td className="px-7 py-4">
                              <p className="text-xs font-black text-[var(--text-primary)] uppercase tracking-tight group-hover:text-[var(--accent-primary)] transition-colors">
                                {getCleanDescription(cargo.descripcion)}
                              </p>
                              {cargo.observaciones && (
                                <p className="text-[9px] text-[var(--text-muted)] font-medium mt-0.5 italic">{cargo.observaciones}</p>
                              )}
                            </td>
                            <td className="px-7 py-4">
                              <span className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest bg-[var(--bg-elevated)] px-2 py-1 rounded-lg">
                                {cargo.tipo || '—'}
                              </span>
                            </td>
                            <td className="px-7 py-4 text-right">
                              <span className="text-sm font-black text-[var(--text-primary)] tabular-nums">
                                $ {Number(cargo.monto).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                              </span>
                            </td>
                          </tr>
                        )) : (
                          <tr>
                            <td colSpan={3} className="px-7 py-14 text-center text-[10px] text-[var(--text-disabled)] font-bold uppercase tracking-widest">
                              Sin conceptos registrados
                            </td>
                          </tr>
                        )}
                      </tbody>
                      {(factura.cargos?.length ?? 0) > 0 && (
                        <tfoot>
                          <tr className="bg-[var(--accent-primary-soft)] border-t-2 border-[var(--accent-primary-ring)]">
                            <td colSpan={2} className="px-7 py-4 text-[10px] font-black text-[var(--accent-primary)] uppercase tracking-widest">
                              Total Facturado
                            </td>
                            <td className="px-7 py-4 text-right text-base font-black text-[var(--accent-primary)] tabular-nums">
                              $ {Number(factura.total).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                            </td>
                          </tr>
                        </tfoot>
                      )}
                    </table>
                  </div>
                </div>

                {/* Observaciones */}
                {factura.observaciones && (
                  <div className="space-y-3">
                    <h3 className="text-[10px] font-black text-[var(--text-primary)] uppercase tracking-[0.2em] flex items-center gap-3">
                      <Info className="w-4 h-4 text-[var(--accent-purple)]" />
                      Observaciones
                      <div className="h-px flex-1 bg-[var(--border-secondary)]" />
                    </h3>
                    <div className="bg-[var(--bg-secondary)]/30 border border-[var(--border-secondary)] rounded-2xl px-6 py-5">
                      <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{factura.observaciones}</p>
                    </div>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="audit"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.18 }}
                className="space-y-6"
              >
                {isLoadingAudit ? (
                  <div className="flex flex-col items-center justify-center py-24 gap-4">
                    <div className="w-10 h-10 border-4 border-[var(--accent-primary-ring)] border-t-[var(--accent-primary)] rounded-full animate-spin" />
                    <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest animate-pulse">Consultando bitácora...</p>
                  </div>
                ) : auditLogs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-24 text-center space-y-4 rounded-[2rem] border border-dashed border-[var(--border-secondary)]">
                    <History className="w-12 h-12 text-[var(--text-disabled)] opacity-30" />
                    <div>
                      <p className="text-[11px] font-black text-[var(--text-muted)] uppercase tracking-widest">Sin registros de actividad</p>
                      <p className="text-[9px] text-[var(--text-disabled)] font-bold mt-1">Los eventos de esta factura aparecerán aquí.</p>
                    </div>
                  </div>
                ) : (
                  <div className="relative pl-8 space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-[var(--border-secondary)]">
                    {auditLogs.map((log) => (
                      <div key={log.id} className="relative">
                        <div className={`absolute -left-[30px] top-1.5 p-1.5 rounded-full z-10 border-4 border-[var(--bg-surface)] shadow-lg ${log.tipo === 'EXITO' ? 'bg-[var(--success)]' :
                            log.tipo === 'INFO' ? 'bg-[var(--info)]' : 'bg-[var(--text-disabled)]'
                          }`}>
                          {log.tipo === 'EXITO'
                            ? <CheckCircle2 className="w-3 h-3 text-white" />
                            : log.tipo === 'ERROR'
                              ? <AlertCircle className="w-3 h-3 text-white" />
                              : <Clock className="w-3 h-3 text-white" />}
                        </div>
                        <div className="bg-[var(--bg-secondary)]/40 p-6 rounded-3xl border border-[var(--border-secondary)] hover:border-[var(--border-primary)] transition-all group">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-[11px] font-black text-[var(--text-primary)] uppercase tracking-widest group-hover:text-[var(--accent-primary)] transition-colors">
                              {log.titulo}
                            </h4>
                            <span className="text-[9px] font-bold text-[var(--text-muted)] flex items-center gap-1.5 shrink-0 ml-4">
                              <Clock className="w-3 h-3" />
                              {new Date(log.createdAt).toLocaleString('es-AR')}
                            </span>
                          </div>
                          <p className="text-[10px] text-[var(--text-secondary)] leading-relaxed">{log.mensaje}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ───── FOOTER ───── */}
        <div className="px-10 py-7 border-t border-[var(--border-secondary)] bg-[var(--bg-secondary)]/40 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={downloadPdf}
              className="flex items-center gap-2.5 px-7 py-3.5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-secondary)] text-[var(--text-primary)] text-[10px] font-black uppercase tracking-widest hover:bg-[var(--bg-card-hover)] transition-all active:scale-95 group shadow-sm"
            >
              <Download className="w-4 h-4 text-[var(--accent-primary)] group-hover:-translate-y-0.5 transition-transform" />
              Descargar PDF
            </button>
            <button
              onClick={onSendEmail}
              className="flex items-center gap-2.5 px-7 py-3.5 rounded-2xl bg-[var(--accent-primary)] text-white text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all active:scale-95 shadow-lg group"
            >
              <Mail className="w-4 h-4 group-hover:skew-x-6 transition-transform" />
              Enviar Email
            </button>
          </div>

          <button
            onClick={onClose}
            className="flex items-center gap-1.5 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest hover:text-[var(--text-primary)] transition-colors"
          >
            Cerrar
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </motion.div>
    </div>,
    document.body
  );
};
