import React, { useState, useEffect } from 'react';
import { useClientes } from '../../clientes/hooks/useClientes';
import { useCargos } from '../../finanzas/hooks/useFinanzas';
import { useFacturas } from '../hooks/useFacturas';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Modal } from '../../../components/ui/Modal';
import { formatCurrency } from '../../../utils/formatters';
import { Search, Plus, Trash2, FileText, Calendar, User } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface NuevaFacturaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NuevaFacturaModal: React.FC<NuevaFacturaModalProps> = ({ isOpen, onClose }) => {
  const { getClientes } = useClientes();
  const { createFactura, getNextNumero } = useFacturas();
  
  const [clienteId, setClienteId] = useState<number | null>(null);
  const [cargoIds, setCargoIds] = useState<number[]>([]);
  const [numero, setNumero] = useState('');
  const [fechaEmision, setFechaEmision] = useState(new Date().toISOString().split('T')[0]);
  const [observaciones, setObservaciones] = useState('');

  // Cargar cargos del cliente seleccionado que NO están facturados
  const { data: cargos, isLoading: isLoadingCargos } = useCargos(clienteId || undefined, true);

  // Sugerir número automático cuando abre el modal o cambia el cliente
  useEffect(() => {
    if (isOpen && getNextNumero.data) {
      setNumero(getNextNumero.data);
    }
  }, [isOpen, getNextNumero.data]);

  const toggleCargo = (id: number) => {
    setCargoIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const totalFactura = cargos
    ?.filter(c => cargoIds.includes(c.id))
    .reduce((sum, c) => sum + Number(c.monto), 0) || 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clienteId || cargoIds.length === 0) {
      toast.error('Seleccione un cliente y al menos un cargo');
      return;
    }

    try {
      await createFactura.mutateAsync({
        clienteId,
        numero,
        fechaEmision,
        cargoIds,
        observaciones
      });
      toast.success('Factura creada correctamente');
      onClose();
      // Reset
      setClienteId(null);
      setCargoIds([]);
      setObservaciones('');
    } catch (error) {
      toast.error('Error al crear la factura');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Emitir Nueva Factura" size="xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Columna Izquierda: Datos de la Factura */}
          <div className="space-y-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                Información General
              </h3>
              
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-500 ml-1">Cliente</label>
                  <Select
                    value={clienteId?.toString() || ''}
                    onChange={(e) => {
                      setClienteId(Number(e.target.value));
                      setCargoIds([]); // Reset cargos al cambiar cliente
                    }}
                    required
                  >
                    <option value="">Seleccione un propietario...</option>
                    {getClientes.data?.map(c => (
                      <option key={c.id} value={c.id}>{c.nombre} ({c.dni})</option>
                    ))}
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-500 ml-1">Nº Comprobante</label>
                    <Input
                      value={numero}
                      onChange={(e) => setNumero(e.target.value)}
                      placeholder="FAC-0000"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-500 ml-1">Fecha Emisión</label>
                    <Input
                      type="date"
                      value={fechaEmision}
                      onChange={(e) => setFechaEmision(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-500 ml-1">Observaciones</label>
                  <Input
                    value={observaciones}
                    onChange={(e) => setObservaciones(e.target.value)}
                    placeholder="Notas adicionales..."
                  />
                </div>
              </div>
            </div>

            {/* Resumen de Totales */}
            <div className="bg-blue-600 p-6 rounded-xl text-white shadow-lg shadow-blue-200">
              <div className="flex justify-between items-center mb-1">
                <span className="text-blue-100 text-sm">Total de selección</span>
                <span className="bg-blue-500 px-2 py-0.5 rounded text-xs">
                  {cargoIds.length} ítems
                </span>
              </div>
              <div className="text-3xl font-bold">
                {formatCurrency(totalFactura)}
              </div>
            </div>
          </div>

          {/* Columna Derecha: Selección de Cargos */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Plus className="w-4 h-4 text-green-600" />
              Cargos Pendientes de Facturar
            </h3>

            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden min-h-[300px] max-h-[450px] overflow-y-auto">
              {!clienteId ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 p-8 text-center italic">
                  <Search className="w-12 h-12 mb-2 opacity-20" />
                  <p>Seleccione un cliente para ver sus cargos pendientes</p>
                </div>
              ) : isLoadingCargos ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : cargos?.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 p-8 text-center">
                  <Trash2 className="w-12 h-12 mb-2 opacity-20" />
                  <p>No se encontraron cargos pendientes de facturar para este cliente</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {cargos?.map(cargo => (
                    <label 
                      key={cargo.id} 
                      className={`flex items-center gap-4 p-4 hover:bg-slate-50 cursor-pointer transition-colors ${
                        cargoIds.includes(cargo.id) ? 'bg-blue-50' : ''
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        checked={cargoIds.includes(cargo.id)}
                        onChange={() => toggleCargo(cargo.id)}
                      />
                      <div className="flex-1">
                        <div className="text-sm font-medium text-slate-800">{cargo.descripcion}</div>
                        <div className="text-xs text-slate-500 flex items-center gap-3 mt-0.5">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(cargo.fechaEmision).toLocaleDateString()}
                          </span>
                          <span className="bg-slate-100 px-1.5 py-0.5 rounded uppercase text-[10px] font-bold">
                            {cargo.tipo}
                          </span>
                        </div>
                      </div>
                      <div className="text-sm font-semibold text-slate-900">
                        {formatCurrency(cargo.monto)}
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button 
            type="submit" 
            variant="primary" 
            disabled={createFactura.isPending || cargoIds.length === 0}
            className="min-w-[150px]"
          >
            {createFactura.isPending ? 'Emitiendo...' : 'Emitir Factura'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
