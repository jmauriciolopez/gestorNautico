import { useState } from 'react';
import { Ship, MapPin, Loader2, Plus, Calendar } from 'lucide-react';
import { Movimiento, useOperaciones } from '../hooks/useOperaciones';
import { NuevoMovimientoModal } from './NuevoMovimientoModal';

interface MovimientosListProps {
  movimientos: Movimiento[];
  isLoading: boolean;
}

export function MovimientosList({ movimientos, isLoading }: MovimientosListProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { createMovimiento } = useOperaciones();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
        <Loader2 className="w-8 h-8 text-amber-600 animate-spin" />
        <p className="mt-2 text-gray-500">Cargando movimientos...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h3 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-amber-500" />
            Movimientos de Galpón
          </h3>
          <p className="text-slate-500 text-sm font-medium">Historial cronológico de entradas y salidas.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-2xl transition-all shadow-lg shadow-amber-600/20 active:scale-95 text-sm"
        >
          <Plus className="w-5 h-5" />
          Registrar Movimiento
        </button>
      </div>

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
            {movimientos.map((mov) => (
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
                    {mov.espacio ? (
                      <span className="font-bold">
                        {mov.espacio.rack?.codigo ? `${mov.espacio.rack.codigo}-` : ''}{mov.espacio.numero}
                      </span>
                    ) : (
                      <span className="text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded text-[10px] border border-blue-100 uppercase tracking-tighter">
                        En el Agua / A Flote
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-500 tabular-nums">
                  {new Date(mov.fecha).toLocaleString()}
                </td>
              </tr>
            ))}
            {movimientos.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                  No se registraron movimientos recientes.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <NuevoMovimientoModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={async (data) => {
          await createMovimiento.mutateAsync(data);
        }}
      />
    </div>
  );
}
