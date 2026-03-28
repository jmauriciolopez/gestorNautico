import { Wrench, CheckCircle2, Clock, XCircle, Loader2, Trash2 } from 'lucide-react';
import { RegistroServicio } from '../hooks/useServicios';

interface RegistrosListProps {
  registros: RegistroServicio[];
  isLoading: boolean;
  onComplete?: (id: number) => void;
  onUpdateStatus?: (id: number, status: RegistroServicio['estado']) => void;
  onDelete?: (id: number) => void;
}

const estadoBadge: Record<RegistroServicio['estado'], { color: string; icon: React.ReactNode; label: string }> = {
  PENDIENTE: { color: 'bg-amber-100 text-amber-800', icon: <Clock className="w-3 h-3" />, label: 'Pendiente' },
  EN_PROCESO: { color: 'bg-blue-100 text-blue-800', icon: <Loader2 className="w-3 h-3 animate-spin" />, label: 'En Proceso' },
  COMPLETADO: { color: 'bg-emerald-100 text-emerald-800', icon: <CheckCircle2 className="w-3 h-3" />, label: 'Completado' },
  CANCELADO: { color: 'bg-red-100 text-red-800', icon: <XCircle className="w-3 h-3" />, label: 'Cancelado' },
};

export function RegistrosList({ registros, isLoading, onComplete, onUpdateStatus, onDelete }: RegistrosListProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        <p className="mt-2 text-slate-400">Cargando registros...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <table className="w-full text-left">
        <thead className="bg-gray-50 border-b border-gray-100">
          <tr>
            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Embarcación</th>
            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Servicio</th>
            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Fecha Prog.</th>
            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Estado</th>
            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-right">Costo</th>
            <th className="px-6 py-4"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {registros.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                No hay registros de servicio.
              </td>
            </tr>
          ) : (
            registros.map((reg) => {
              const badge = estadoBadge[reg.estado];
              return (
                <tr key={reg.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Wrench className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">{reg.embarcacion?.nombre}</p>
                        <p className="text-xs text-gray-500">{reg.embarcacion?.matricula}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-gray-800 font-medium">{reg.servicio?.nombre}</p>
                    <p className="text-xs text-gray-500">{reg.servicio?.categoria}</p>
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-sm">
                    {new Date(reg.fechaProgramada).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${badge.color}`}>
                      {badge.icon} {badge.label}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-gray-800">
                    ${Number(reg.costoFinal || reg.servicio?.precioBase || 0).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-3">
                      {reg.estado === 'PENDIENTE' && onUpdateStatus && (
                        <button
                          onClick={() => onUpdateStatus(reg.id, 'EN_PROCESO')}
                          className="text-blue-600 hover:text-blue-800 text-xs font-bold uppercase tracking-wider"
                        >
                          Iniciar
                        </button>
                      )}
                      {reg.estado === 'EN_PROCESO' && onComplete && (
                        <button
                          onClick={() => onComplete(reg.id)}
                          className="text-emerald-600 hover:text-emerald-800 text-xs font-bold uppercase tracking-wider"
                        >
                          Completar
                        </button>
                      )}
                      {(reg.estado === 'PENDIENTE' || reg.estado === 'EN_PROCESO') && onUpdateStatus && (
                        <button
                          onClick={() => onUpdateStatus(reg.id, 'CANCELADO')}
                          className="text-gray-400 hover:text-rose-600 transition-colors"
                          title="Cancelar"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={() => onDelete(reg.id)}
                          className="text-gray-300 hover:text-rose-600 transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
