import { useQuery, useMutation } from '@tanstack/react-query';
import { httpClient } from '../../../shared/api/HttpClient';

export interface FacturaPublica {
  id: number;
  numero: string;
  total: number;
  estado: 'PENDIENTE' | 'PAGADA' | 'ANULADA';
  fechaEmision: string;
  fechaVencimiento?: string;
  clienteNombre: string;
  cargos: {
    descripcion: string;
    monto: number;
  }[];
  // Datos de pago informado si existen
  idComprobante?: string;
  fechaPagoInformada?: string;
  medioPagoInformado?: string;
}

export interface ReportePagoPublico {
  token: string;
  idComprobante: string;
  fechaPago: string;
  medioPago: string;
  observaciones?: string;
}

export function useFacturaPublica(token: string | null) {
  return useQuery<FacturaPublica>({
    queryKey: ['factura-publica', token],
    queryFn: () => 
      httpClient.get<FacturaPublica>(`/facturas/public/${token}`),
    enabled: !!token,
    retry: false,
    staleTime: 0, // No cache for public payment info
  });
}

export function useReportarPagoPublico() {
  return useMutation({
    mutationFn: (data: ReportePagoPublico) => 
      httpClient.post('/facturas/public/reportar-pago', data),
  });
}
