import { Package, Loader2, Pencil, Trash2 } from 'lucide-react';
import { ServicioCatalogo } from '../hooks/useServicios';

interface CatalogoListProps {
  servicios: ServicioCatalogo[];
  isLoading: boolean;
  onDelete?: (id: number) => void;
  onEdit?: (svc: ServicioCatalogo) => void;
}

export function CatalogoList({ servicios, isLoading, onDelete, onEdit }: CatalogoListProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        <p className="mt-2 text-slate-400">Cargando catálogo...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <table className="w-full text-left">
        <thead className="bg-gray-50 border-b border-gray-100">
          <tr>
            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Servicio</th>
            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Categoría</th>
            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Estado</th>
            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-right">Precio Base</th>
            <th className="px-6 py-4"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {servicios.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                No hay servicios en el catálogo.
              </td>
            </tr>
          ) : (
            servicios.map((svc) => (
              <tr key={svc.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-indigo-500" />
                    <div>
                      <p className="font-medium text-gray-900">{svc.nombre}</p>
                      {svc.descripcion && <p className="text-xs text-gray-500 line-clamp-1">{svc.descripcion}</p>}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-gray-600 text-sm px-2 py-1 bg-gray-100 rounded">
                    {svc.categoria}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                    svc.activo ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {svc.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right font-bold text-gray-800">
                  ${Number(svc.precioBase).toLocaleString()}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {onEdit && (
                      <button 
                        onClick={() => onEdit(svc)}
                        className="text-gray-400 hover:text-indigo-600 transition-colors"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                    )}
                    {onDelete && (
                      <button 
                        onClick={() => onDelete(svc.id)}
                        className="text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
