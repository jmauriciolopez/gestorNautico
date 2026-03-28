import { X, Receipt, Clock, User, CreditCard } from 'lucide-react';
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
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">Detalle de Caja #{caja.id}</h3>
              <p className="text-xs text-slate-500 font-medium tracking-tight">
                {caja.estado === 'ABIERTA' ? 'SESIÓN ACTIVA' : 'SOPORTE DE CIERRE'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200/50 rounded-lg transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {/* Summary Mini Cards */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Saldo Inicial</span>
              <span className="text-lg font-bold text-slate-700">{formatCurrency(Number(caja.saldoInicial))}</span>
            </div>
            <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-100">
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block mb-1">Ingresos (Sessión)</span>
              <span className="text-lg font-bold text-indigo-700">
                {formatCurrency(caja.pagos?.reduce((sum, p) => sum + Number(p.monto), 0) || 0)}
              </span>
            </div>
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest block mb-1">Monto Total</span>
              <span className="text-lg font-bold text-emerald-700">
                {formatCurrency(Number(caja.saldoInicial) + (caja.pagos?.reduce((sum, p) => sum + Number(p.monto), 0) || 0))}
              </span>
            </div>
          </div>

          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
            Registros de Cobro
            <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-400">
              {caja.pagos?.length || 0} movimientos
            </span>
          </h4>

          {(!caja.pagos || caja.pagos.length === 0) ? (
            <div className="py-12 text-center text-slate-400 border-2 border-dashed border-slate-100 rounded-2xl">
              <p className="text-sm font-medium">No se registraron movimientos en esta sesión.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {caja.pagos.map((pago: any) => (
                <div key={pago.id} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-xl hover:border-indigo-100 hover:shadow-sm transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 group-hover:text-indigo-500 transition-colors">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-700 text-sm">{pago.cliente?.nombre}</span>
                        <span className="text-[10px] font-black uppercase text-indigo-400 bg-indigo-50 px-1.5 py-0.5 rounded">
                          {pago.metodoPago}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {formatDate(pago.createdAt)}</span>
                        {pago.cargo && <span>• {pago.cargo.descripcion}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-emerald-600 block">+{formatCurrency(Number(pago.monto))}</span>
                    <span className="text-[10px] text-slate-300 font-mono">ID: {pago.id}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-white text-slate-600 border border-slate-200 hover:bg-slate-100 rounded-xl font-bold transition-all text-sm"
          >
            Cerrar Detalle
          </button>
        </div>
      </div>
    </div>
  );
}
