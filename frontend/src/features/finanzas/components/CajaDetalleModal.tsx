import { X, Receipt, Clock, CreditCard, History } from 'lucide-react';
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

  const extractVesselName = (pago: any) => {
    if (!pago.cargo?.descripcion) return 'PAGO GENERAL';
    const parts = pago.cargo.descripcion.split(/ - |: /);
    if (parts.length > 1) return parts[1];
    return pago.cargo.descripcion;
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
      <div className="bg-[var(--modal-glass-bg)] border border-[var(--border-primary)] w-full max-w-2xl rounded-[3rem] shadow-[0_32px_128px_-16px_rgba(0,0,0,0.5)] overflow-hidden transform animate-in slide-in-from-bottom-8 duration-500">

        {/* Header */}
        <div className="px-10 pt-10 pb-8 border-b border-[var(--border-primary)] flex justify-between items-start bg-gradient-to-br from-indigo-500/10 to-transparent">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center border border-indigo-500/20 bg-indigo-500/10 text-indigo-500 shadow-inner">
              <History className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-[var(--text-primary)] uppercase tracking-tight">
                Auditoría de Arqueo
              </h3>
              <p className="text-[10px] text-[var(--text-secondary)] font-black uppercase tracking-[0.25em] mt-1 opacity-60">Control y trazabilidad de caja</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-[var(--bg-primary)] rounded-full text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all active:scale-90 border border-transparent hover:border-[var(--border-primary)]">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
          {/* Summary Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
            <div className="bg-[var(--bg-secondary)]/40 p-5 rounded-2xl border border-[var(--border-primary)]/60 flex flex-col justify-between min-h-[90px]">
              <span className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] block leading-tight mb-2">Fondo de Apertura</span>
              <span className="text-lg font-black text-[var(--text-primary)] tracking-tight">{formatCurrency(Number(caja.saldoInicial))}</span>
            </div>
            <div className="bg-indigo-600/10 p-5 rounded-2xl border border-indigo-500/20 flex flex-col justify-between min-h-[90px]">
              <span className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.2em] block leading-tight mb-2">Ingresos del Turno</span>
              <span className="text-lg font-black text-indigo-400 tracking-tight">
                {formatCurrency(caja.pagos?.reduce((sum, p) => sum + Number(p.monto), 0) || 0)}
              </span>
            </div>
            <div className="bg-indigo-500/20 p-5 rounded-2xl border border-indigo-500/40 shadow-[0_0_20px_rgba(99,102,241,0.1)] flex flex-col justify-between min-h-[90px]">
              <span className="text-[9px] font-black text-indigo-300 uppercase tracking-[0.2em] block leading-tight mb-2">Balance Contable</span>
              <span className="text-lg font-black text-indigo-300 tracking-tight">
                {formatCurrency(Number(caja.saldoInicial) + (caja.pagos?.reduce((sum, p) => sum + Number(p.monto), 0) || 0))}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between mb-6">
            <h4 className="text-[11px] font-black text-[var(--text-secondary)] uppercase tracking-widest flex items-center gap-2">
              Libro de Operaciones
              <span className="bg-[var(--bg-elevated)] text-[var(--text-secondary)] px-2 py-0.5 rounded text-[10px] border border-[var(--border-primary)]">
                {caja.pagos?.length || 0} ingresos
              </span>
            </h4>
          </div>

          {(!caja.pagos || caja.pagos.length === 0) ? (
            <div className="py-24 text-center">
              <div className="w-16 h-16 rounded-[2rem] bg-[var(--bg-secondary)] border border-[var(--border-primary)] flex items-center justify-center mx-auto mb-4 text-[var(--text-muted)]">
                <Clock className="w-8 h-8" />
              </div>
              <p className="text-[var(--text-muted)] font-black uppercase text-[10px] tracking-widest">Sin movimientos de tesorería registrados.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {[...(caja.pagos || [])].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((pago: any) => (
                <div key={pago.id} className="flex items-center justify-between p-5 bg-[var(--bg-secondary)]/40 border border-[var(--border-primary)]/60 rounded-2xl hover:border-[var(--border-primary)] transition-all group">
                  <div className="flex items-center gap-5">
                    <div className="w-10 h-10 bg-[var(--bg-primary)] rounded-xl flex items-center justify-center text-[var(--text-muted)] group-hover:text-indigo-400 transition-colors border border-[var(--border-primary)]">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="font-black text-[var(--text-primary)] text-sm uppercase tracking-tight group-hover:text-blue-400 transition-colors">
                          {pago.cliente?.nombre || 'S/D'}
                        </span>
                        <div className="w-1 h-1 rounded-full bg-[var(--border-primary)]" />
                        <span className="text-[9px] font-black uppercase text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20 tracking-widest">
                          {extractVesselName(pago)}
                        </span>
                        <div className="w-1 h-1 rounded-full bg-[var(--border-primary)]" />
                        <span className="text-[9px] font-black uppercase text-[var(--text-muted)] tracking-widest underline decoration-indigo-500/30 underline-offset-4">
                          {pago.metodoPago}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-[var(--text-secondary)] mt-1.5 font-bold uppercase tracking-widest">
                        <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {formatDate(pago.createdAt)}</span>
                        {pago.cargo && <span className="flex items-center gap-1.5 border-l border-[var(--border-primary)] pl-3"> <Receipt className="w-3.5 h-3.5 opacity-40" /> {pago.cargo.descripcion}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-black text-indigo-400 tracking-tighter block">+{formatCurrency(Number(pago.monto))}</span>
                    <span className="text-[9px] text-[var(--text-muted)] font-black uppercase tracking-widest">TRX ID: {pago.id}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-10 border-t border-[var(--border-primary)] bg-[var(--bg-primary)]/40">
          <button
            onClick={onClose}
            className="w-full px-8 py-4 border border-[var(--border-primary)] text-[var(--text-secondary)] font-black text-[10px] uppercase tracking-[0.25em] rounded-2xl hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)] transition-all active:scale-95"
          >
            Cerrar Reporte
          </button>
        </div>
      </div>
    </div>
  );
}
