import { Anchor, Clock, CheckCircle2, XCircle, Trash2, Loader2, ArrowRight, Ship, AlertTriangle } from 'lucide-react';
import { Pedido } from '../hooks/useOperaciones';

interface PedidosListProps {
  pedidos: Pedido[];
  isLoading: boolean;
  onUpdateStatus: (id: number, nuevoEstado: Pedido['estado']) => void;
  onDeletePedido: (id: number) => void;
  onOpenCreate: () => void;
}

export function PedidosList({ pedidos, isLoading, onUpdateStatus, onDeletePedido }: PedidosListProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 bg-[var(--bg-secondary)]/10 rounded-[3rem]">
        <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
        <p className="text-[10px] text-[var(--text-secondary)] font-black uppercase tracking-[0.3em] opacity-60">Sincronizando Monitor...</p>
      </div>
    );
  }
  return (
    <div className="p-12 space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[var(--border-primary)]/40 pb-10">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            <h3 className="text-2xl font-black text-[var(--text-primary)] uppercase tracking-tight">Monitor de Operaciones</h3>
          </div>
          <p className="text-[10px] text-[var(--text-secondary)] font-black uppercase tracking-[0.3em] opacity-60">Cola de maniobras programadas en tiempo real</p>
        </div>
        <div className="px-6 py-3 bg-indigo-500/10 border border-indigo-500/20 rounded-[1.25rem] backdrop-blur-md">
          <span className="text-[11px] font-black text-indigo-400 uppercase tracking-[0.2em]">{pedidos.length} ACTIVAS</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {pedidos
          .filter(p => p.estado === 'pendiente' || p.estado === 'en_agua')
          .map((pedido) => (
          <div key={pedido.id} className="group relative bg-[var(--bg-secondary)]/30 hover:bg-[var(--bg-secondary)]/50 p-8 rounded-[2.5rem] border border-[var(--border-primary)]/60 hover:border-indigo-500/40 transition-all duration-500 flex flex-col xl:flex-row xl:items-center justify-between gap-8 shadow-sm hover:shadow-2xl hover:shadow-indigo-900/10">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-[2.5rem] pointer-events-none" />

            <div className="flex items-center gap-8 relative z-10">
              <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center border-2 transition-all duration-500 ${pedido.estado === 'pendiente' ? 'bg-amber-500/10 border-amber-500/20 text-amber-500 shadow-[0_0_20px_-5px_rgba(245,158,11,0.3)]' :
                pedido.estado === 'en_agua' ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-500 shadow-[0_0_20px_-5px_rgba(99,102,241,0.3)]' :
                  pedido.estado === 'finalizado' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500 shadow-[0_0_20px_-5px_rgba(16,185,129,0.3)]' :
                    'bg-rose-500/10 border-rose-500/20 text-rose-500'
                }`}>
                <Anchor className={`w-8 h-8 ${pedido.estado === 'en_agua' ? 'animate-pulse' : ''}`} />
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-4">
                  <span className="text-xl font-black text-[var(--text-primary)] group-hover:text-indigo-400 transition-colors uppercase tracking-tight">
                    {pedido.embarcacion?.nombre}
                  </span>
                  {pedido.embarcacion?.tieneDeuda && (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 animate-pulse">
                      <AlertTriangle className="w-3 h-3" />
                      <span className="text-[9px] font-black uppercase tracking-widest">Deuda</span>
                    </div>
                  )}
                  <span className="text-[9px] font-black px-3 py-1 bg-[var(--bg-primary)] text-[var(--text-secondary)] rounded-full border border-[var(--border-primary)] tracking-[0.2em] uppercase">
                    {pedido.embarcacion?.matricula}
                  </span>
                  <span className={`text-[8px] font-black px-2.5 py-0.5 rounded-md border uppercase tracking-widest ${
                    pedido.estado === 'pendiente' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                    pedido.estado === 'en_agua' ? 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20' :
                    pedido.estado === 'finalizado' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                    'bg-rose-500/10 text-rose-500 border-rose-500/20'
                  }`}>
                    {pedido.estado === 'en_agua' ? 'En Agua' : pedido.estado}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-6">
                  <div className="flex items-center gap-2.5 text-[10px] text-[var(--text-secondary)] font-black uppercase tracking-widest bg-[var(--bg-primary)]/40 px-3 py-1.5 rounded-xl border border-[var(--border-primary)]/40">
                    <Ship className="w-3.5 h-3.5 text-indigo-500" />
                    {pedido.embarcacion?.cliente?.nombre}
                  </div>
                  <div className="flex items-center gap-2.5 text-[10px] text-[var(--text-secondary)] font-black uppercase tracking-widest bg-[var(--bg-primary)]/40 px-3 py-1.5 rounded-xl border border-[var(--border-primary)]/40">
                    <Clock className="w-3.5 h-3.5 text-indigo-500" />
                    {(() => {
                      const fecha = new Date(pedido.fechaProgramada);
                      const hoy = new Date();
                      const manana = new Date(hoy); manana.setDate(hoy.getDate() + 1);
                      const hora = fecha.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                      if (fecha.toDateString() === hoy.toDateString()) return `Hoy ${hora}`;
                      if (fecha.toDateString() === manana.toDateString()) return `Mañana ${hora}`;
                      return fecha.toLocaleDateString('es-AR', { day: '2-digit', month: 'short' }) + ' ' + hora;
                    })()}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-[var(--bg-primary)]/50 p-3 rounded-[2rem] border border-[var(--border-primary)]/60 relative z-10 backdrop-blur-sm self-end xl:self-center">
              {pedido.estado === 'pendiente' && (
                <button
                  onClick={() => onUpdateStatus(pedido.id, 'en_agua')}
                  className="flex items-center gap-3 px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:scale-[1.03] active:scale-95 shadow-lg shadow-indigo-900/30"
                >
                  <ArrowRight className="w-4 h-4" />
                  Bajar a Agua
                </button>
              )}
              {pedido.estado === 'en_agua' && (
                <button
                  onClick={() => onUpdateStatus(pedido.id, 'finalizado')}
                  className="flex items-center gap-3 px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:scale-[1.03] active:scale-95 shadow-lg shadow-emerald-900/30"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Vuelta a Cuna
                </button>
              )}
              
              <div className="flex items-center gap-1.5 px-2">
                {(pedido.estado === 'pendiente' || pedido.estado === 'en_agua') && (
                  <button
                    onClick={() => onUpdateStatus(pedido.id, 'cancelado')}
                    className="p-3 text-[var(--text-muted)] hover:text-rose-500 hover:bg-rose-500/5 rounded-xl transition-all" title="Cancelar Solicitud"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                )}
                <div className="w-[1px] h-6 bg-[var(--border-primary)] mx-1" />
                <button
                  onClick={() => onDeletePedido(pedido.id)}
                  className="p-3 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/5 rounded-xl transition-all" title="Eliminar del Monitor"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {pedidos.length === 0 && (
          <div className="py-32 text-center bg-[var(--bg-secondary)]/10 rounded-[3rem] border-2 border-dashed border-[var(--border-primary)]/60">
            <div className="w-24 h-24 rounded-[2.5rem] bg-[var(--bg-secondary)] border border-[var(--border-primary)] flex items-center justify-center mx-auto mb-8 text-[var(--text-muted)] shadow-inner">
              <Clock className="w-12 h-12 opacity-30" />
            </div>
            <h4 className="text-[var(--text-primary)] font-black text-xl uppercase tracking-tight">Monitor Despejado</h4>
            <p className="text-[var(--text-secondary)] text-xs font-black uppercase tracking-[0.25em] mt-3 opacity-60">No hay maniobras pendientes en la cola actual.</p>
          </div>
        )}
      </div>
    </div>
  );
}
