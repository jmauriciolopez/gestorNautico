import React, { useState } from 'react';
import { Plus, RefreshCw } from 'lucide-react';
import { useFacturas } from '../hooks/useFacturas';
import { FacturasList } from '../components/FacturasList';
import { NuevaFacturaModal } from '../components/NuevaFacturaModal';
import { toast } from 'react-hot-toast';

export default function FacturacionPage() {
  const { getFacturas, updateEstadoFactura } = useFacturas();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleUpdateEstado = async (id: number, estado: 'PENDIENTE' | 'PAGADA' | 'ANULADA') => {
    const label = estado === 'PAGADA' ? 'marcar como PAGADA' : 'ANULAR';
    if (window.confirm(`¿Está seguro de que desea ${label} esta factura?`)) {
      try {
        await updateEstadoFactura.mutateAsync({ id, estado });
        toast.success(`Factura ${estado === 'PAGADA' ? 'marcada como pagada' : 'anulada'} correctamente`);
      } catch (error) {
        toast.error('Error al actualizar el estado de la factura');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Facturación</h2>
          <p className="text-slate-500 mt-1">Gestión integral de comprobantes y cargos de clientes.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button 
            onClick={() => getFacturas.refetch()}
            className="p-2 text-slate-400 hover:text-indigo-600 transition-colors bg-white border border-slate-200 rounded-lg shadow-sm"
            title="Actualizar lista"
          >
            <RefreshCw className={`w-5 h-5 ${getFacturas.isFetching ? 'animate-spin' : ''}`} />
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex-1 sm:flex-none bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg flex items-center justify-center gap-2 text-sm font-semibold shadow-md shadow-indigo-200 transition-all active:scale-95"
          >
            <Plus className="w-5 h-5" />
            Nueva Factura
          </button>
        </div>
      </div>

      <FacturasList
        facturas={getFacturas.data || []}
        isLoading={getFacturas.isLoading}
        onUpdateEstado={handleUpdateEstado}
      />

      <NuevaFacturaModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
}
