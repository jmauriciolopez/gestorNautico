import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { httpClient } from '../../../shared/api/HttpClient';
import { Paginated } from '../../../api/pagination';
import { useActiveGuarderiaId } from '../../../shared/hooks/useActiveGuarderiaId';

export interface Factura {
  id: number;
  numero: string;
  total: number;
  fechaEmision: string;
  estado: 'PENDIENTE' | 'PAGADA' | 'ANULADA';
  observaciones?: string;
  cliente: { id: number; nombre: string; dni: string };
  cargos?: {
    id: number;
    descripcion: string;
    monto: number;
    tipo: string;
    pagado: boolean;
    fechaVencimiento?: string;
  }[];
  createdAt: string;
  updatedAt: string;
  // Metadata de pago informado
  pagoIdComprobante?: string;
  pagoFecha?: string;
  pagoMedio?: string;
  pagoObservaciones?: string;
  pagoReportadoAt?: string;
}

const PAGE_SIZE = 20;

/** Paginated facturas hook — supports search and date range */
export function useFacturasPaginadas(
  page: number,
  limit = PAGE_SIZE,
  filters: { search?: string; startDate?: string; endDate?: string; soloReportados?: boolean } = {}
) {
  const queryClient = useQueryClient();
  const guarderiaId = useActiveGuarderiaId();
  const { search, startDate, endDate, soloReportados } = filters;

  const query = useQuery({
    queryKey: ['facturas', guarderiaId, page, limit, search, startDate, endDate, soloReportados],
    queryFn: (): Promise<Paginated<Factura>> => {
      let url = `/facturas?page=${page}&limit=${limit}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      if (startDate) url += `&startDate=${startDate}`;
      if (endDate) url += `&endDate=${endDate}`;
      if (soloReportados) url += `&soloReportados=true`;
      return httpClient.get<Paginated<Factura>>(url);
    },
    placeholderData: (prev) => prev,
    staleTime: 30_000,
  });

  const createFactura = useMutation({
    mutationFn: (data: {
      clienteId: number;
      numero?: string;
      fechaEmision: string;
      cargoIds: number[];
      observaciones?: string;
    }) => httpClient.post('/facturas', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['facturas'] });
      queryClient.invalidateQueries({ queryKey: ['cargos'] });
    },
  });

  const updateEstadoFactura = useMutation({
    mutationFn: ({ id, estado, metodoPago }: { id: number; estado: Factura['estado']; metodoPago?: string }) =>
      httpClient.patch(`/facturas/${id}/estado`, { estado, metodoPago }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['facturas'] });
      queryClient.invalidateQueries({ queryKey: ['pagos'] });
      queryClient.invalidateQueries({ queryKey: ['caja-resumen'] });
      queryClient.invalidateQueries({ queryKey: ['cargos'] });
    },
  });

  const deleteFactura = useMutation({
    mutationFn: (id: number) => httpClient.delete(`/facturas/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['facturas'] });
    },
  });

  return { query, createFactura, updateEstadoFactura, deleteFactura };
}

export interface FacturaStats {
  TOTAL_PENDIENTE: number;
  TOTAL_PAGADO: number;
  TOTAL_ANULADO: number;
  CONTEO_PENDIENTE: number;
  CONTEO_PAGADO: number;
  CONTEO_ANULADO: number;
}

/** Global stats for Facturacion dashboard */
export function useFacturasStats(startDate?: string, endDate?: string) {
  const guarderiaId = useActiveGuarderiaId();
  return useQuery<FacturaStats>({
    queryKey: ['facturas', guarderiaId, 'stats', startDate, endDate],
    queryFn: () => {
      let url = '/facturas/stats';
      if (startDate || endDate) {
        url += '?';
        if (startDate) url += `startDate=${startDate}`;
        if (startDate && endDate) url += '&';
        if (endDate) url += `endDate=${endDate}`;
      }
      return httpClient.get<FacturaStats>(url);
    },
    staleTime: 60_000,
  });
}

/** Kept for backward-compat (NuevaFacturaModal, FacturacionPage) */
export function useFacturas() {
  const queryClient = useQueryClient();
  const guarderiaId = useActiveGuarderiaId();

  const getNextNumero = useQuery<{ nextNumero: string }>({
    queryKey: ['facturas', guarderiaId, 'next-numero'],
    queryFn: () => httpClient.get<{ nextNumero: string }>('/facturas/next-numero'),
  });

  const updateEstadoFactura = useMutation({
    mutationFn: ({ id, estado, metodoPago }: { id: number; estado: Factura['estado']; metodoPago?: string }) =>
      httpClient.patch(`/facturas/${id}/estado`, { estado, metodoPago }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['facturas'] });
      queryClient.invalidateQueries({ queryKey: ['pagos'] });
      queryClient.invalidateQueries({ queryKey: ['caja-resumen'] });
      queryClient.invalidateQueries({ queryKey: ['cargos'] });
    },
  });

  const createFactura = useMutation({
    mutationFn: (data: {
      clienteId: number;
      numero?: string;
      fechaEmision: string;
      cargoIds: number[];
      observaciones?: string;
    }) => httpClient.post('/facturas', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['facturas'] });
      queryClient.invalidateQueries({ queryKey: ['cargos'] });
      queryClient.invalidateQueries({ queryKey: ['facturas', 'next-numero'] });
    },
  });

  const deleteFactura = useMutation({
    mutationFn: (id: number) => httpClient.delete(`/facturas/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['facturas'] });
    },
  });

  return { updateEstadoFactura, createFactura, deleteFactura, getNextNumero };
}
