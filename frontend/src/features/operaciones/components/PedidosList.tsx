import { Anchor, Clock, CheckCircle2, XCircle, Trash2, Loader2, ArrowRight, Ship } from 'lucide-react';
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
      <div className="flex flex-col items-center justify-center py-20 bg-[var(--bg-secondary)]/20">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
        <p className="mt-4 text-[var(--text-secondary)] font-black uppercase text-[10px] tracking-widest">Sincronizando Maniobras...</p>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center border-b border-[var(--border-primary)]/60 pb-6 mb-6">
        <div>
          <h3 className="text-xl font-black text-[var(--text-primary)] uppercase tracking-tight">Solicitudes en Cola</h3>
          <p className="text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-widest mt-0.5">Pendientes de ejecución inmediata</p>
        </div>
        <div className="px-3 py-1 bg-blue-600/10 border border-blue-500/20 rounded-lg">
          <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">{pedidos.length} PENDIENTES</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {pedidos.map((pedido) => (
          <div key={pedido.id} className="group relative bg-[var(--bg-secondary)]/40 p-6 rounded-2xl border border-[var(--border-primary)]/60 hover:border-blue-500/30 transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-6">

            <div className="flex items-center gap-6">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-all duration-500 ${pedido.estado === 'pendiente' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
                pedido.estado === 'en_proceso' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' :
                  pedido.estado === 'completado' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                    'bg-rose-500/10 border-rose-500/20 text-rose-400'
                }`}>
                <Anchor className="w-7 h-7" />
              </div>

              <div>
                <div className="flex items-center gap-3">
                  <span className="text-lg font-black text-[var(--text-primary)] group-hover:text-blue-400 transition-colors uppercase tracking-tight">
                    {pedido.embarcacion?.nombre}
                  </span>
                  <span className="text-[9px] font-black px-2 py-0.5 bg-slate-800 text-[var(--text-secondary)] rounded-md border border-slate-700 tracking-widest">
                    {pedido.embarcacion?.matricula}
                  </span>
                </div>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-1.5 text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-widest">
                    <Ship className="w-3.5 h-3.5" />
                    {pedido.embarcacion?.cliente?.nombre}
                  </div>
                  <div className="w-1 h-1 rounded-full bg-slate-800" />
                  <div className="flex items-center gap-1.5 text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-widest">
                    <Clock className="w-3.5 h-3.5" />
                    {new Date(pedido.fechaProgramada).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-[var(--bg-primary)]/40 p-2 rounded-2xl border border-[var(--border-primary)]/60">
              {pedido.estado === 'pendiente' && (
                <button
                  onClick={() => onUpdateStatus(pedido.id, 'en_proceso')}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600/10 hover:bg-blue-600 text-blue-400 hover:text-[var(--text-primary)] rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95"
                >
                  <ArrowRight className="w-4 h-4" />
                  Iniciar
                </button>
              )}
              {pedido.estado === 'en_proceso' && (
                <button
                  onClick={() => onUpdateStatus(pedido.id, 'completado')}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600/10 hover:bg-emerald-600 text-emerald-400 hover:text-[var(--text-primary)] rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Finalizar
                </button>
              )}
              <button
                onClick={() => onUpdateStatus(pedido.id, 'cancelado')}
                className="p-2 text-slate-600 hover:text-rose-400 transition-colors" title="Cancelar Solicitud"
              >
                <XCircle className="w-5 h-5" />
              </button>
              <div className="w-[1px] h-6 bg-slate-800 mx-1" />
              <button
                onClick={() => onDeletePedido(pedido.id)}
                className="p-2 text-slate-700 hover:text-[var(--text-primary)] transition-colors" title="Purgar Registro"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
        {pedidos.length === 0 && (
          <div className="py-24 text-center">
            <div className="w-20 h-20 rounded-[2rem] bg-[var(--bg-secondary)] border border-[var(--border-primary)] flex items-center justify-center mx-auto mb-6 text-slate-700">
              <Clock className="w-10 h-10" />
            </div>
            <h4 className="text-[var(--text-primary)] font-black text-lg uppercase tracking-tight">Sin maniobras programadas</h4>
            <p className="text-slate-600 text-xs font-bold uppercase tracking-widest mt-2">La cola de operaciones se encuentra vacía actualmente.</p>
          </div>
        )}
      </div>
    </div>
  );
}
