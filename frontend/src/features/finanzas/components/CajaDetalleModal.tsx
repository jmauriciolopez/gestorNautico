import { X, Receipt, Clock, CreditCard, ChevronRight } from 'lucide-react';
import { Caja } from '../hooks/useFinanzas';

interface CajaDetalleModalProps {
  caja: Caja | null;
  isOpen: boolean;
  onClose: () => void;
}

export function CajaDetalleModal({ caja, isOpen, onClose }: CajaDetalleModalProps) {
  if (!isOpen || !caja) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[var(--bg-primary)]/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-[#0f172a] border border-[var(--border-primary)]/60 w-full max-w-4xl rounded-[2.5rem] shadow-2xl overflow-hidden transform animate-in slide-in-from-bottom-8 duration-500">

        {/* Header */}
        <div className="px-8 pt-8 pb-6 border-b border-[var(--border-primary)]/60 flex justify-between items-start">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Receipt className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-black text-[var(--text-primary)] uppercase tracking-tight">Auditoría de Caja #{caja.id}</h3>
              <p className="text-xs text-[var(--text-secondary)] font-bold uppercase tracking-widest mt-0.5">
                {caja.estado === 'ABIERTA' ? 'SESIÓN ACTIVA' : 'SOPORTE DE CIERRE FISCAL'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
          {/* Summary Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="bg-[var(--bg-secondary)]/40 p-5 rounded-2xl border border-[var(--border-primary)]/60">
              <span className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] block mb-2">Fondo de Apertura</span>
              <span className="text-2xl font-black text-[var(--text-primary)] tracking-tight">{formatCurrency(Number(caja.saldoInicial))}</span>
            </div>
            <div className="bg-indigo-600/10 p-5 rounded-2xl border border-indigo-500/20">
              <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] block mb-2">Ingresos del Turno</span>
              <span className="text-2xl font-black text-indigo-400 tracking-tight">
                {formatCurrency(caja.pagos?.reduce((sum, p) => sum + Number(p.monto), 0) || 0)}
              </span>
            </div>
            <div className="bg-emerald-600/10 p-5 rounded-2xl border border-emerald-500/20">
              <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] block mb-2">Balance Contable</span>
              <span className="text-2xl font-black text-emerald-400 tracking-tight">
                {formatCurrency(Number(caja.saldoInicial) + (caja.pagos?.reduce((sum, p) => sum + Number(p.monto), 0) || 0))}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between mb-6">
            <h4 className="text-[11px] font-black text-[var(--text-secondary)] uppercase tracking-widest flex items-center gap-2">
              Libro de Operaciones
              <span className="bg-slate-800 text-[var(--text-secondary)] px-2 py-0.5 rounded text-[10px] border border-slate-700">
                {caja.pagos?.length || 0} ingresos
              </span>
            </h4>
          </div>

          {(!caja.pagos || caja.pagos.length === 0) ? (
            <div className="py-24 text-center">
              <div className="w-16 h-16 rounded-[2rem] bg-[var(--bg-secondary)] border border-[var(--border-primary)] flex items-center justify-center mx-auto mb-4 text-slate-700">
                <Clock className="w-8 h-8" />
              </div>
              <p className="text-slate-600 font-black uppercase text-[10px] tracking-widest">Sin movimientos de tesorería registrados.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {caja.pagos.map((pago: any) => (
                <div key={pago.id} className="flex items-center justify-between p-5 bg-[var(--bg-secondary)]/40 border border-[var(--border-primary)]/60 rounded-2xl hover:border-slate-700 transition-all group">
                  <div className="flex items-center gap-5">
                    <div className="w-10 h-10 bg-[var(--bg-primary)] rounded-xl flex items-center justify-center text-slate-600 group-hover:text-indigo-400 transition-colors border border-slate-900">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="font-black text-[var(--text-primary)] text-sm uppercase tracking-tight group-hover:text-blue-400 transition-colors">{pago.cliente?.nombre}</span>
                        <div className="w-1 h-1 rounded-full bg-slate-800" />
                        <span className="text-[9px] font-black uppercase text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20 tracking-widest">
                          {pago.metodoPago}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-[var(--text-secondary)] mt-1.5 font-bold uppercase tracking-widest">
                        <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {formatDate(pago.createdAt)}</span>
                        {pago.cargo && <span className="flex items-center gap-1.5 border-l border-[var(--border-primary)] pl-3"> <ChevronRight className="w-3 h-3" /> {pago.cargo.descripcion}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-black text-emerald-400 tracking-tighter block">+{formatCurrency(Number(pago.monto))}</span>
                    <span className="text-[9px] text-slate-700 font-black uppercase tracking-widest">TRX ID: {pago.id}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-6 border-t border-[var(--border-primary)]/60 bg-[var(--bg-secondary)]/30 flex justify-end">
          <button
            onClick={onClose}
            className="px-8 py-3 bg-slate-800 hover:bg-slate-700 text-[var(--text-primary)] font-black rounded-xl transition-all text-xs uppercase tracking-widest underline-offset-4"
          >
            Finalizar Auditoría
          </button>
        </div>
      </div>
    </div>
  );
}
