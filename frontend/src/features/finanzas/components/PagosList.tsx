export interface Pago {
  id: number;
  monto: number;
  fecha: string;
  metodoPago: string;
  cliente: {
    nombre: string;
  };
  cargo?: {
    descripcion: string;
  };
}

interface PagosListProps {
  pagos: Pago[];
  isLoading: boolean;
}

export function PagosList({ pagos, isLoading }: PagosListProps) {
  return (
    <table className="w-full text-left">
      <thead className="bg-gray-50 border-b border-gray-100">
        <tr>
          <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Fecha</th>
          <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Cliente</th>
          <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Método</th>
          <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Referencia</th>
          <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-right">Monto</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {isLoading ? (
          <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-400">Cargando pagos...</td></tr>
        ) : pagos.length === 0 ? (
          <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-400">No hay pagos registrados.</td></tr>
        ) : (
          pagos.map((pago) => (
            <tr key={pago.id} className="hover:bg-gray-50/50 transition-colors">
              <td className="px-6 py-4 text-gray-500 text-sm">
                {new Date(pago.fecha).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 font-medium text-gray-900">{pago.cliente?.nombre}</td>
              <td className="px-6 py-4">
                <span className="text-gray-600 text-sm px-2 py-1 bg-gray-100 rounded">{pago.metodoPago}</span>
              </td>
              <td className="px-6 py-4 text-gray-500 text-sm italic">
                {pago.cargo?.descripcion || 'Pago general'}
              </td>
              <td className="px-6 py-4 text-right font-bold text-emerald-600">
                + ${Number(pago.monto).toLocaleString()}
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}
