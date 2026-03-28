import { Anchor, Clock, CheckCircle2, XCircle, Trash2, Plus, Loader2 } from 'lucide-react';
import { Pedido } from '../hooks/useOperaciones';

interface PedidosListProps {
  pedidos: Pedido[];
  isLoading: boolean;
  onUpdateStatus: (id: number, nuevoEstado: Pedido['estado']) => void;
  onDeletePedido: (id: number) => void;
}

export function PedidosList({ pedidos, isLoading, onUpdateStatus, onDeletePedido }: PedidosListProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        <p className="mt-2 text-gray-500">Cargando pedidos...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-700">Solicitudes de Clientes</h3>
        <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm">
          <Plus className="w-4 h-4" />
          Nuevo Pedido
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {pedidos.map((pedido) => (
          <div key={pedido.id} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-indigo-200 transition">
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-xl ${
                pedido.estado === 'pendiente' ? 'bg-amber-50 text-amber-600' :
                pedido.estado === 'en_proceso' ? 'bg-blue-50 text-blue-600' :
                pedido.estado === 'completado' ? 'bg-emerald-50 text-emerald-600' :
                'bg-rose-50 text-rose-600'
              }`}>
                <Anchor className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-900">{pedido.embarcacion?.nombre}</span>
                  <span className="text-xs font-semibold px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">{pedido.embarcacion?.matricula}</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">Dueño: {pedido.embarcacion?.cliente?.nombre}</p>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                    <Clock className="w-3.5 h-3.5" />
                    {new Date(pedido.fechaProgramada).toLocaleString()}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider">
                    <span className={`w-2 h-2 rounded-full ${
                       pedido.estado === 'pendiente' ? 'bg-amber-400' :
                       pedido.estado === 'en_proceso' ? 'bg-blue-400' :
                       pedido.estado === 'completado' ? 'bg-emerald-400' :
                       'bg-rose-400'
                    }`}></span>
                    {pedido.estado.replace('_', ' ')}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 border-t md:border-t-0 pt-4 md:pt-0">
              {pedido.estado === 'pendiente' && (
                <button 
                  onClick={() => onUpdateStatus(pedido.id, 'en_proceso')}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Iniciar Trabajo"
                >
                  <Clock className="w-5 h-5" />
                </button>
              )}
              {pedido.estado === 'en_proceso' && (
                <button 
                  onClick={() => onUpdateStatus(pedido.id, 'completado')}
                  className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition" title="Marcar Completado"
                >
                  <CheckCircle2 className="w-5 h-5" />
                </button>
              )}
              <button 
                onClick={() => onUpdateStatus(pedido.id, 'cancelado')}
                className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition" title="Cancelar"
              >
                <XCircle className="w-5 h-5" />
              </button>
              <button 
                onClick={() => onDeletePedido(pedido.id)}
                className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition ml-2" title="Eliminar"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
        {pedidos.length === 0 && (
          <div className="py-12 text-center text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            No hay pedidos pendientes para hoy.
          </div>
        )}
      </div>
    </div>
  );
}
