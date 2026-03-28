import { FileText, CheckCircle2, Clock, XCircle, Loader2 } from 'lucide-react';
import { Factura } from '../hooks/useFacturas';

interface FacturasListProps {
  facturas: Factura[];
  isLoading: boolean;
  onUpdateEstado?: (id: number, estado: Factura['estado']) => void;
}

const estadoBadge: Record<Factura['estado'], { color: string; icon: React.ReactNode; label: string }> = {
  PENDIENTE: { color: 'bg-amber-100 text-amber-800', icon: <Clock className="w-3 h-3" />, label: 'Pendiente' },
  PAGADA: { color: 'bg-emerald-100 text-emerald-800', icon: <CheckCircle2 className="w-3 h-3" />, label: 'Pagada' },
  ANULADA: { color: 'bg-red-100 text-red-800', icon: <XCircle className="w-3 h-3" />, label: 'Anulada' },
};

export function FacturasList({ facturas, isLoading, onUpdateEstado }: FacturasListProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        <p className="mt-2 text-slate-400">Cargando facturas...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <table className="w-full text-left">
        <thead className="bg-gray-50 border-b border-gray-100">
          <tr>
            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Nº Factura</th>
            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Cliente</th>
            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Fecha Emisión</th>
            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Estado</th>
            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-right">Total</th>
            <th className="px-6 py-4"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {facturas.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                No hay facturas registradas.
              </td>
            </tr>
          ) : (
            facturas.map((factura) => {
              const badge = estadoBadge[factura.estado];
              return (
                <tr key={factura.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-indigo-500" />
                      <span className="font-mono font-bold text-gray-900">{factura.numero}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900">{factura.cliente?.nombre}</td>
                  <td className="px-6 py-4 text-gray-500 text-sm">
                    {new Date(factura.fechaEmision).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${badge.color}`}>
                      {badge.icon} {badge.label}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-gray-800">
                    ${Number(factura.total).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {factura.estado === 'PENDIENTE' && onUpdateEstado && (
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onUpdateEstado(factura.id, 'PAGADA')}
                          className="text-emerald-600 hover:text-emerald-800 text-xs font-bold uppercase tracking-wider"
                        >
                          Pagar
                        </button>
                        <button
                          onClick={() => onUpdateEstado(factura.id, 'ANULADA')}
                          className="text-red-500 hover:text-red-700 text-xs font-bold uppercase tracking-wider"
                        >
                          Anular
                        </button>
                      </div>
                    )}
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
