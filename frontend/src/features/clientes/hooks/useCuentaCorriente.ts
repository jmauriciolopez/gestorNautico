import { useQuery } from '@tanstack/react-query';
import { httpClient } from '../../../shared/api/HttpClient';

export interface CuentaCorriente {
  totalCargado: number;
  totalPagado: number;
  saldoPendiente: number;
  totalVencido: number;
  cantidadCargos: number;
  cantidadCargosImpagos: number;
  ultimoPago: { monto: number; fecha: string; metodoPago: string } | null;
  cargos: {
    id: number;
    descripcion: string;
    monto: number;
    fechaEmision: string;
    fechaVencimiento?: string;
    pagado: boolean;
    tipo: string;
  }[];
  pagos: {
    id: number;
    monto: number;
    fecha: string;
    metodoPago: string;
    comprobante?: string;
  }[];
}

export function useCuentaCorriente(clienteId: number | null) {
  return useQuery<CuentaCorriente>({
    queryKey: ['cuenta-corriente', clienteId],
    queryFn: () => httpClient.get(`/clientes/${clienteId}/cuenta-corriente`),
    enabled: !!clienteId,
  });
}
