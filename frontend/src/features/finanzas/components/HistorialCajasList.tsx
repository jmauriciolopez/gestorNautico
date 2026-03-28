import { History, CheckCircle2, Clock, Eye } from 'lucide-react';
import { Caja } from '../hooks/useFinanzas';

interface HistorialCajasListProps {
  cajas: Caja[];
  isLoading: boolean;
  onVerDetalle?: (caja: Caja) => void;
}

export function HistorialCajasList({ cajas, isLoading, onVerDetalle }: HistorialCajasListProps) {
  if (isLoading) {
    return (
      <div className="p-12 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (cajas.length === 0) {
    return (
      <div className="p-12 text-center text-gray-500">
        <History className="mx-auto w-12 h-12 text-gray-300 mb-4" />
        <p className="font-medium text-slate-800">No hay historial de cajas</p>
        <p className="text-sm text-slate-400 mt-1">Las cajas cerradas aparecerán aquí.</p>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">ID</th>
            <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Apertura</th>
            <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Cierre</th>
            <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">S. Inicial</th>
            <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">S. Final</th>
            <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Estado</th>
            <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {cajas.map((caja) => (
            <tr key={caja.id} className="hover:bg-slate-50/50 transition-colors">
              <td className="px-6 py-4 text-sm font-medium text-slate-900">#{caja.id}</td>
              <td className="px-6 py-4 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  {formatDate(caja.fechaApertura)}
                </div>
              </td>
              <td className="px-6 py-4 text-sm text-slate-600">
                {caja.fechaCierre ? (
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
                    {formatDate(caja.fechaCierre)}
                  </div>
                ) : (
                  <span className="text-amber-600 italic font-medium">En curso...</span>
                )}
              </td>
              <td className="px-6 py-4 text-sm text-slate-900 font-mono text-right font-medium">
                {formatCurrency(Number(caja.saldoInicial))}
              </td>
              <td className="px-6 py-4 text-sm text-slate-900 font-mono text-right font-medium">
                {caja.saldoFinal ? formatCurrency(Number(caja.saldoFinal)) : '-'}
              </td>
              <td className="px-6 py-4">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  caja.estado === 'ABIERTA' 
                    ? 'bg-emerald-100 text-emerald-800' 
                    : 'bg-slate-100 text-slate-800'
                }`}>
                  {caja.estado === 'ABIERTA' ? 'ACTIVA' : 'CERRADA'}
                </span>
              </td>
              <td className="px-6 py-4 text-center">
                <button
                  onClick={() => onVerDetalle?.(caja)}
                  className="p-1 px-3 text-indigo-600 hover:bg-indigo-50 border border-transparent hover:border-indigo-100 rounded-lg transition-all text-xs font-extrabold uppercase tracking-tighter flex items-center gap-1.5 mx-auto"
                >
                  <Eye className="w-3.5 h-3.5" />
                  Detalle
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
