import { useState } from 'react';
import { useOperaciones, Pedido } from '../hooks/useOperaciones';
import { PedidosList } from '../components/PedidosList';
import { MovimientosList } from '../components/MovimientosList';

type Tab = 'pedidos' | 'movimientos';

export default function OperacionesPage() {
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
        <PedidosList 
          pedidos={getPedidos.data || []}
          isLoading={getPedidos.isLoading}
          onUpdateStatus={handleUpdateStatus}
          onDeletePedido={handleDeletePedido}
        />
      ) : (
        <MovimientosList 
          movimientos={getMovimientos.data || []}
          isLoading={getMovimientos.isLoading}
        />
      )}
    </div>
  );
}
