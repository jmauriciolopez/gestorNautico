import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { httpClient } from '../../../shared/api/HttpClient';
import { Paginated } from '../../../api/pagination';

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
}

const PAGE_SIZE = 20;

/** Paginated facturas hook — self-contained for FacturasList */
export function useFacturasPaginadas(page: number, limit = PAGE_SIZE) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['facturas', page, limit],
    queryFn: (): Promise<Paginated<Factura>> =>
      httpClient.get<Paginated<Factura>>(`/facturas?page=${page}&limit=${limit}`),
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

/** Kept for backward-compat (NuevaFacturaModal, FacturacionPage) */
export function useFacturas() {
  const queryClient = useQueryClient();

  const getNextNumero = useQuery<{ nextNumero: string }>({
    queryKey: ['facturas', 'next-numero'],
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
