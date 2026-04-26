import { useMemo } from 'react';
import { Anchor, Clock, CheckCircle2, XCircle, Trash2, Loader2, ArrowRight, Ship, AlertTriangle } from 'lucide-react';
import { Pedido } from '../hooks/useOperaciones';

interface PedidosListProps {
  pedidos: (Pedido & { origen?: 'interno' | 'web'; isSolicitud?: boolean; observaciones?: string })[];
  isLoading: boolean;
  onUpdateStatus: (id: number, nuevoEstado: Pedido['estado'], isSolicitud?: boolean) => void;
  onDeletePedido: (id: number, isSolicitud?: boolean) => void;
  onOpenCreate: () => void;
}

const formatFechaProgramada = (fechaStr: string) => {
  const fecha = new Date(fechaStr);
  const hoy = new Date();
  const manana = new Date(hoy);
  manana.setDate(hoy.getDate() + 1);
  const hora = fecha.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (fecha.toDateString() === hoy.toDateString()) return `Hoy ${hora}`;
  if (fecha.toDateString() === manana.toDateString()) return `Mañana ${hora}`;
  return fecha.toLocaleDateString('es-AR', { day: '2-digit', month: 'short' }) + ' ' + hora;
};

export function PedidosList({ pedidos, isLoading, onUpdateStatus, onDeletePedido }: PedidosListProps) {
  const filteredPedidos = useMemo(() => 
    pedidos.filter(p => p.estado === 'pendiente' || p.estado === 'en_agua'),
    [pedidos]
  );

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 bg-[var(--bg-secondary)]/10 rounded-[3rem]">
        <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
        <p className="text-[10px] text-[var(--text-secondary)] font-black uppercase tracking-[0.3em] opacity-60">Sincronizando Monitor...</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-12 space-y-6 sm:space-y-10">
      <div className="grid grid-cols-1 gap-6">
        {filteredPedidos.map((pedido) => (
          <div key={pedido.id} className="group relative bg-[var(--bg-secondary)]/30 hover:bg-[var(--bg-secondary)]/50 p-5 sm:p-8 rounded-[1.5rem] sm:rounded-[2.5rem] border border-[var(--border-primary)]/60 hover:border-indigo-500/40 transition-all duration-500 flex flex-col xl:flex-row xl:items-center justify-between gap-6 sm:gap-8 shadow-sm hover:shadow-2xl hover:shadow-indigo-900/10">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-[1.5rem] sm:rounded-[2.5rem] pointer-events-none" />

            <div className="flex items-center gap-4 sm:gap-8 relative z-10">
              <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-[1rem] sm:rounded-[1.5rem] flex items-center justify-center border-2 transition-all duration-500 ${pedido.estado === 'pendiente' ? 'bg-amber-500/10 border-amber-500/20 text-amber-500 shadow-[0_0_20px_-5px_rgba(245,158,11,0.3)]' :
                pedido.estado === 'en_agua' ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-500 shadow-[0_0_20px_-5px_rgba(99,102,241,0.3)]' :
                  pedido.estado === 'finalizado' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500 shadow-[0_0_20px_-5px_rgba(16,185,129,0.3)]' :
                    'bg-rose-500/10 border-rose-500/20 text-rose-500'
                }`}>
                <Anchor 
                  className={`w-6 h-6 sm:w-8 sm:h-8 ${pedido.estado === 'en_agua' ? 'animate-pulse' : ''}`} 
                  aria-hidden="true" 
                />
              </div>

              <div className="space-y-1.5 sm:space-y-3">
                <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                  <span className="text-base sm:text-xl font-black text-[var(--text-primary)] group-hover:text-indigo-400 transition-colors uppercase tracking-tight">
                    {pedido.embarcacion?.nombre}
                  </span>
                  {pedido.embarcacion?.tieneDeuda && (
                    <div className="flex items-center gap-1 px-2 py-0.5 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 animate-pulse">
                      <AlertTriangle className="w-2.5 h-2.5" />
                      <span className="text-[7px] sm:text-[9px] font-black uppercase tracking-widest">Deuda</span>
                    </div>
                  )}
                  <span className="text-[7px] sm:text-[9px] font-black px-2 sm:px-3 py-0.5 sm:py-1 bg-[var(--bg-primary)] text-[var(--text-secondary)] rounded-full border border-[var(--border-primary)] tracking-[0.2em] uppercase">
                    {pedido.embarcacion?.matricula}
                  </span>
                  <span className={`text-[7px] sm:text-[8px] font-black px-2 py-0.5 rounded-md border uppercase tracking-widest ${
                    pedido.estado === 'pendiente' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                    pedido.estado === 'en_agua' ? 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20' :
                    pedido.estado === 'finalizado' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                    'bg-rose-500/10 text-rose-500 border-rose-500/20'
                  }`}>
                    {pedido.estado === 'en_agua' ? 'En Agua' : pedido.estado}
                  </span>
                  {pedido.origen === 'web' && (
                    <span className="text-[7px] sm:text-[8px] font-black px-2 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-md uppercase tracking-widest">
                      Web
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-3 sm:gap-6">
                  <div className="flex items-center gap-1.5 sm:gap-2.5 text-[8px] sm:text-[10px] text-[var(--text-secondary)] font-black uppercase tracking-widest bg-[var(--bg-primary)]/40 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl border border-[var(--border-primary)]/40">
                    <Ship className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-indigo-500" />
                    {pedido.embarcacion?.cliente?.nombre}
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2.5 text-[8px] sm:text-[10px] text-[var(--text-secondary)] font-black uppercase tracking-widest bg-[var(--bg-primary)]/40 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl border border-[var(--border-primary)]/40">
                    <Clock className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-indigo-500" />
                    {formatFechaProgramada(pedido.fechaProgramada)}
                  </div>
                  {pedido.observaciones && (
                    <div className="flex items-center gap-1.5 sm:gap-2.5 text-[8px] sm:text-[9px] text-indigo-400 font-bold italic truncate max-w-[200px] sm:max-w-[250px] bg-indigo-500/5 px-2 sm:px-3 py-1 rounded-lg border border-indigo-500/10">
                      "{pedido.observaciones}"
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-4 bg-[var(--bg-primary)]/50 p-2 sm:p-3 rounded-2xl sm:rounded-[2rem] border border-[var(--border-primary)]/60 relative z-10 backdrop-blur-sm w-full xl:w-auto self-stretch xl:self-center justify-between xl:justify-start">
              {pedido.estado === 'pendiente' && (
                <button
                  onClick={() => onUpdateStatus(pedido.id, 'en_agua', pedido.isSolicitud)}
                  className="flex-1 xl:flex-none flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-8 py-2.5 sm:py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl sm:rounded-2xl text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:scale-[1.03] active:scale-95 shadow-lg shadow-indigo-900/30"
                >
                  <ArrowRight className="w-3.5 h-3.5 sm:w-4 h-4" />
                  Bajar a Agua
                </button>
              )}
              {pedido.estado === 'en_agua' && (
                <button
                  onClick={() => onUpdateStatus(pedido.id, 'finalizado', pedido.isSolicitud)}
                  className="flex-1 xl:flex-none flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-8 py-2.5 sm:py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl sm:rounded-2xl text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:scale-[1.03] active:scale-95 shadow-lg shadow-emerald-900/30"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 h-4" />
                  Vuelta a Cuna
                </button>
              )}
              
              <div className="flex items-center gap-1.5 px-2">
                {(pedido.estado === 'pendiente' || pedido.estado === 'en_agua') && (
                  <button
                    onClick={() => onUpdateStatus(pedido.id, 'cancelado', pedido.isSolicitud)}
                    className="p-3 text-[var(--text-muted)] hover:text-rose-500 hover:bg-rose-500/5 rounded-xl transition-all" 
                    title="Cancelar Solicitud"
                    aria-label="Cancelar Solicitud"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                )}
                <div className="w-[1px] h-6 bg-[var(--border-primary)] mx-1" />
                <button
                  onClick={() => onDeletePedido(pedido.id, pedido.isSolicitud)}
                  className="p-3 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/5 rounded-xl transition-all" 
                  title="Eliminar del Monitor"
                  aria-label="Eliminar del Monitor"
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
