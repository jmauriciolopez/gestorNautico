import { Ship, MapPin, Loader2, Plus } from 'lucide-react';
import { Movimiento } from '../hooks/useOperaciones';

interface MovimientosListProps {
  movimientos: Movimiento[];
  isLoading: boolean;
}

export function MovimientosList({ movimientos, isLoading }: MovimientosListProps) {
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
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-700">Movimientos de Galpón</h3>
        <button className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition text-sm">
          <Plus className="w-4 h-4" />
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
                    {mov.espacio?.nombre || 'Taller'}
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
    </div>
  );
}
