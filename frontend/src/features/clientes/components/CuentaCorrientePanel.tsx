import { useState } from 'react';
import { Wallet, TrendingDown, AlertTriangle, CheckCircle2, ChevronDown, ChevronRight, Anchor, CreditCard } from 'lucide-react';
import { useCuentaCorriente } from '../hooks/useCuentaCorriente';

interface Props {
  clienteId: number;
  clienteNombre?: string;
}

export function CuentaCorrientePanel({ clienteId, clienteNombre }: Props) {
  const { data, isLoading } = useCuentaCorriente(clienteId);
  const [showMovimientos, setShowMovimientos] = useState(false);

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-3">
        {[1,2,3].map(i => <div key={i} className="h-16 bg-[var(--bg-surface)] rounded-2xl" />)}
      </div>
    );
  }

  if (!data) return null;

  const esMoroso   = data.totalVencido > 0;
  const tieneDeuda = data.saldoPendiente > 0;
  // Rojo si tiene vencido, ámbar si tiene saldo pendiente no vencido, verde si está al día
  const estadoColor = esMoroso ? 'red' : tieneDeuda ? 'amber' : 'emerald';
  const estadoMsg = esMoroso
    ? `Deuda vencida — ${data.cantidadCargosImpagos} cargo${data.cantidadCargosImpagos !== 1 ? 's' : ''} impago${data.cantidadCargosImpagos !== 1 ? 's' : ''}`
    : tieneDeuda
      ? `Saldo pendiente — ${data.cantidadCargosImpagos} cargo${data.cantidadCargosImpagos !== 1 ? 's' : ''} sin pagar`
      : 'Cuenta al día';

  return (
    <div className="space-y-4">
      {/* Resumen de saldos */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-2xl p-4">
          <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1">Total facturado</p>
          <p className="text-xl font-black text-[var(--text-primary)]">${Number(data.totalCargado).toLocaleString()}</p>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4">
          <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest mb-1">Total pagado</p>
          <p className="text-xl font-black text-[var(--text-primary)]">${Number(data.totalPagado).toLocaleString()}</p>
        </div>
        <div className={`rounded-2xl p-4 border ${tieneDeuda ? 'bg-amber-500/10 border-amber-500/20' : 'bg-[var(--bg-surface)] border-[var(--border-primary)]'}`}>
          <p className={`text-[9px] font-black uppercase tracking-widest mb-1 ${tieneDeuda ? 'text-amber-400' : 'text-[var(--text-muted)]'}`}>Saldo pendiente</p>
          <p className={`text-xl font-black ${tieneDeuda ? 'text-amber-400' : 'text-[var(--text-primary)]'}`}>
            ${Number(data.saldoPendiente).toLocaleString()}
          </p>
        </div>
        <div className={`rounded-2xl p-4 border ${esMoroso ? 'bg-red-500/10 border-red-500/20' : 'bg-[var(--bg-surface)] border-[var(--border-primary)]'}`}>
          <p className={`text-[9px] font-black uppercase tracking-widest mb-1 ${esMoroso ? 'text-red-400' : 'text-[var(--text-muted)]'}`}>Vencido</p>
          <p className={`text-xl font-black ${esMoroso ? 'text-red-400' : 'text-[var(--text-primary)]'}`}>
            ${Number(data.totalVencido).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Estado */}
      <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl border
        ${estadoColor === 'red'    ? 'bg-red-500/10 border-red-500/20' :
          estadoColor === 'amber'  ? 'bg-amber-500/10 border-amber-500/20' :
                                     'bg-emerald-500/10 border-emerald-500/20'}`}>
        {estadoColor === 'emerald'
          ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          : <AlertTriangle className={`w-4 h-4 shrink-0 ${estadoColor === 'red' ? 'text-red-400' : 'text-amber-400'}`} />}
        <p className={`text-[11px] font-black uppercase tracking-widest
          ${estadoColor === 'red' ? 'text-red-400' : estadoColor === 'amber' ? 'text-amber-400' : 'text-emerald-400'}`}>
          {estadoMsg}
        </p>
        {data.ultimoPago && (
          <span className="ml-auto text-[10px] text-[var(--text-muted)] font-black uppercase tracking-widest">
            Último pago: {new Date(data.ultimoPago.fecha).toLocaleDateString('es-AR')} · ${Number(data.ultimoPago.monto).toLocaleString()}
          </span>
        )}
      </div>

      {/* Toggle movimientos */}
      <button
        onClick={() => setShowMovimientos(!showMovimientos)}
        className="flex items-center gap-2 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest hover:text-[var(--text-primary)] transition-colors"
      >
        {showMovimientos ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        Ver movimientos ({data.cargos.length} cargos · {data.pagos.length} pagos)
      </button>

      {showMovimientos && (
        <div className="grid md:grid-cols-2 gap-4">
          {/* Cargos */}
          <div className="bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-[var(--border-primary)] flex items-center gap-2">
              <Anchor className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-[10px] font-black text-[var(--text-primary)] uppercase tracking-widest">Cargos</span>
            </div>
            <div className="divide-y divide-[var(--border-primary)] max-h-64 overflow-y-auto">
              {data.cargos.map(c => (
                <div key={c.id} className="px-4 py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[11px] font-black text-[var(--text-primary)] truncate">{c.descripcion}</p>
                    <p className="text-[9px] text-[var(--text-muted)] uppercase tracking-widest">
                      {new Date(c.fechaEmision).toLocaleDateString('es-AR')}
                      {c.fechaVencimiento && ` · vence ${new Date(c.fechaVencimiento).toLocaleDateString('es-AR')}`}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-black text-[var(--text-primary)]">${Number(c.monto).toLocaleString()}</p>
                    {c.pagado
                      ? <span className="text-[9px] font-black text-emerald-400 uppercase">Pagado</span>
                      : <span className="text-[9px] font-black text-amber-400 uppercase">Pendiente</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pagos */}
          <div className="bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-[var(--border-primary)] flex items-center gap-2">
              <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[10px] font-black text-[var(--text-primary)] uppercase tracking-widest">Pagos</span>
            </div>
            <div className="divide-y divide-[var(--border-primary)] max-h-64 overflow-y-auto">
              {data.pagos.length === 0 ? (
                <p className="px-4 py-6 text-[10px] text-[var(--text-muted)] uppercase tracking-widest text-center">Sin pagos registrados</p>
              ) : data.pagos.map(p => (
                <div key={p.id} className="px-4 py-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-black text-[var(--text-primary)]">{p.metodoPago}</p>
                    <p className="text-[9px] text-[var(--text-muted)] uppercase tracking-widest">
                      {new Date(p.fecha).toLocaleDateString('es-AR')}
                      {p.comprobante && ` · ${p.comprobante}`}
                    </p>
                  </div>
                  <p className="text-sm font-black text-emerald-400">${Number(p.monto).toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
