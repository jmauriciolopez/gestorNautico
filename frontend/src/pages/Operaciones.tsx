import { useState } from 'react';
import { ArrowRightLeft, Anchor, Plus, Clock, CheckCircle2, XCircle, Ship, MapPin, Loader2, Trash2 } from 'lucide-react';
import { useOperaciones, Pedido } from '../hooks/useOperaciones';

type Tab = 'pedidos' | 'movimientos';

export default function Operaciones() {
  const [activeTab, setActiveTab] = useState<Tab>('pedidos');
  const { getPedidos, getMovimientos, deletePedido, updatePedido } = useOperaciones();

  const handleUpdateStatus = async (id: number, nuevoEstado: Pedido['estado']) => {
    await updatePedido.mutateAsync({ id, data: { estado: nuevoEstado } });
  };

  const handleDeletePedido = async (id: number) => {
    if (window.confirm('¿Eliminar esta solicitud?')) {
      await deletePedido.mutateAsync(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Operaciones</h2>
          <p className="text-gray-500 mt-1">Gestión de botadas, izadas y movimientos internos.</p>
        </div>
        <div className="flex gap-2 bg-white p-1 rounded-lg border border-gray-200">
          <button 
            onClick={() => setActiveTab('pedidos')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${activeTab === 'pedidos' ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            Pedidos
          </button>
          <button 
            onClick={() => setActiveTab('movimientos')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${activeTab === 'movimientos' ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            Movimientos
          </button>
        </div>
      </div>

      {activeTab === 'pedidos' ? (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-700">Solicitudes de Clientes</h3>
            <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm">
              <Plus className="w-4 h-4" />
              Nuevo Pedido
            </button>
          </div>

          {getPedidos.isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
              <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
              <p className="mt-2 text-gray-500">Cargando pedidos...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {getPedidos.data?.map((pedido) => (
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
                        onClick={() => handleUpdateStatus(pedido.id, 'en_proceso')}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Iniciar Trabajo"
                      >
                        <Clock className="w-5 h-5" />
                      </button>
                    )}
                    {pedido.estado === 'en_proceso' && (
                      <button 
                        onClick={() => handleUpdateStatus(pedido.id, 'completado')}
                        className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition" title="Marcar Completado"
                      >
                        <CheckCircle2 className="w-5 h-5" />
                      </button>
                    )}
                    <button 
                      onClick={() => handleUpdateStatus(pedido.id, 'cancelado')}
                      className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition" title="Cancelar"
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => handleDeletePedido(pedido.id)}
                      className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition ml-2" title="Eliminar"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
              {getPedidos.data?.length === 0 && (
                <div className="py-12 text-center text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  No hay pedidos pendientes para hoy.
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
           <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-700">Movimientos de Galpón</h3>
            <button className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition text-sm">
              <Plus className="w-4 h-4" />
              Registrar Movimiento
            </button>
          </div>

          {getMovimientos.isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
              <Loader2 className="w-8 h-8 text-amber-600 animate-spin" />
              <p className="mt-2 text-gray-500">Cargando movimientos...</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-gray-600 text-xs font-bold uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Embarcación</th>
                    <th className="px-6 py-4">Tipo</th>
                    <th className="px-6 py-4">Ubicación / Destino</th>
                    <th className="px-6 py-4">Fecha</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {getMovimientos.data?.map((mov) => (
                    <tr key={mov.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Ship className="w-4 h-4 text-blue-500" />
                          <span className="font-semibold text-gray-900">{mov.embarcacion?.nombre}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          mov.tipo === 'entrada' ? 'bg-blue-100 text-blue-700' : 'bg-rose-100 text-rose-700'
                        }`}>
                          {mov.tipo}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-gray-600 font-medium">
                          <MapPin className="w-3.5 h-3.5 text-gray-400" />
                          {mov.espacio?.nombre || 'Taller'}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-500 tabular-nums">
                        {new Date(mov.fecha).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                  {getMovimientos.data?.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                        No se registraron movimientos recientes.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
