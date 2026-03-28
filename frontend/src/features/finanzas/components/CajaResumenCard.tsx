import { Clock } from 'lucide-react';

export interface CajaResumen {
  id: number;
  saldoInicial: number;
  totalRecaudado: number;
  totalEfectivo: number;
  fechaApertura: string;
}

interface CajaResumenCardProps {
  caja?: CajaResumen;
  isLoading: boolean;
}

export function CajaResumenCard({ caja, isLoading }: CajaResumenCardProps) {
  if (isLoading) return <div className="h-24 bg-gray-50 animate-pulse rounded-xl"></div>;

  if (!caja) return (
    <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-center justify-between">
      <div className="flex items-center gap-3 text-amber-800">
        <Clock className="w-5 h-5 text-amber-600" />
        <span className="font-medium">No hay una caja abierta actualmente.</span>
      </div>
      <button className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
        Abrir Caja Diaria
      </button>
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <p className="text-xs text-gray-500 uppercase font-semibold">Saldo Inicial</p>
        <p className="text-xl font-bold text-gray-800">${Number(caja.saldoInicial).toLocaleString()}</p>
      </div>
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <p className="text-xs text-gray-500 uppercase font-semibold">Recaudado Total</p>
        <p className="text-xl font-bold text-emerald-600">${Number(caja.totalRecaudado).toLocaleString()}</p>
      </div>
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <p className="text-xs text-gray-500 uppercase font-semibold">Total Efectivo</p>
        <p className="text-xl font-bold text-gray-800">${Number(caja.totalEfectivo).toLocaleString()}</p>
      </div>
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <p className="text-xs text-gray-500 uppercase font-semibold">Estado</p>
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800 mt-1">
          ABIERTA
        </span>
      </div>
    </div>
  );
}
