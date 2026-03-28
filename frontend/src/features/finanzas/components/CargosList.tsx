import { CheckCircle2, Clock } from 'lucide-react';

export interface Cargo {
  id: number;
  descripcion: string;
  monto: number;
  fechaEmision: string;
  pagado: boolean;
  cliente: {
    nombre: string;
  };
}

interface CargosListProps {
  cargos: Cargo[];
  isLoading: boolean;
}

export function CargosList({ cargos, isLoading }: CargosListProps) {
  return (
    <table className="w-full text-left">
      <thead className="bg-gray-50 border-b border-gray-100">
        <tr>
          <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Cliente</th>
          <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Descripción</th>
          <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Fecha</th>
          <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Estado</th>
          <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-right">Monto</th>
          <th className="px-6 py-4"></th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {isLoading ? (
          <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-400">Cargando cargos...</td></tr>
        ) : cargos.length === 0 ? (
          <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-400">No hay cargos registrados.</td></tr>
        ) : (
          cargos.map((cargo) => (
            <tr key={cargo.id} className="hover:bg-gray-50/50 transition-colors">
              <td className="px-6 py-4 font-medium text-gray-900">{cargo.cliente?.nombre}</td>
              <td className="px-6 py-4 text-gray-600">{cargo.descripcion}</td>
              <td className="px-6 py-4 text-gray-500 text-sm">
                {new Date(cargo.fechaEmision).toLocaleDateString()}
              </td>
              <td className="px-6 py-4">
                {cargo.pagado ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                    <CheckCircle2 className="w-3 h-3" /> Pagado
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                    <Clock className="w-3 h-3" /> Pendiente
                  </span>
                )}
              </td>
              <td className="px-6 py-4 text-right font-bold text-gray-800">
                ${Number(cargo.monto).toLocaleString()}
              </td>
              <td className="px-6 py-4 text-right">
                {!cargo.pagado && (
                  <button 
                    onClick={() => alert(`Procesando cobro para: ${cargo.cliente.nombre}`)}
                    className="text-indigo-600 hover:text-indigo-800 text-xs font-bold uppercase tracking-wider"
                  >
                    Cobrar
                  </button>
                )}
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}
