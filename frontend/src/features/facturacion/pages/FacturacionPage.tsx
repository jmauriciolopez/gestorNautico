import { Plus } from 'lucide-react';
import { useFacturas } from '../hooks/useFacturas';
import { FacturasList } from '../components/FacturasList';

export default function FacturacionPage() {
  const { getFacturas, updateEstadoFactura } = useFacturas();

  const handleUpdateEstado = async (id: number, estado: 'PENDIENTE' | 'PAGADA' | 'ANULADA') => {
    const label = estado === 'PAGADA' ? 'marcar como pagada' : 'anular';
    if (window.confirm(`¿Desea ${label} esta factura?`)) {
      await updateEstadoFactura.mutateAsync({ id, estado });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Facturación</h2>
          <p className="text-gray-500 mt-1">Emisión y seguimiento de facturas a clientes.</p>
        </div>
        <button 
          onClick={() => alert('Próximamente: Formulario de Nueva Factura')}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          Nueva Factura
        </button>
      </div>

      <FacturasList
        facturas={getFacturas.data || []}
        isLoading={getFacturas.isLoading}
        onUpdateEstado={handleUpdateEstado}
      />
    </div>
  );
}
