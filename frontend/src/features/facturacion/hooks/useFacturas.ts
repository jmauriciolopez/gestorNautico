import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { httpClient } from '../../../shared/api/HttpClient';
import { Paginated, selectData } from '../../../api/pagination';

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

export function useFacturas() {
  const queryClient = useQueryClient();

  const getFacturas = useQuery({
    queryKey: ['facturas'],
    queryFn: (): Promise<Factura[]> =>
      httpClient.get<Paginated<Factura>>('/facturas').then(selectData),
  });

  const getNextNumero = useQuery<{ nextNumero: string }>({
    queryKey: ['facturas', 'next-numero'],
    queryFn: () => httpClient.get<{ nextNumero: string }>('/facturas/next-numero'),
  });

  const useFactura = (id: number) =>
    useQuery<Factura>({
      queryKey: ['facturas', id],
      queryFn: () => httpClient.get<Factura>(`/facturas/${id}`),
      enabled: !!id,
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

  const updateEstadoFactura = useMutation({
    mutationFn: ({ id, estado, metodoPago }: { id: number; estado: Factura['estado']; metodoPago?: string }) =>
      httpClient.patch(`/facturas/${id}/estado`, { estado, metodoPago }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['facturas'] });
      queryClient.invalidateQueries({ queryKey: ['pagos'] });
      queryClient.invalidateQueries({ queryKey: ['caja-resumen'] });
    },
  });

  const deleteFactura = useMutation({
    mutationFn: (id: number) => httpClient.delete(`/facturas/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['facturas'] });
    },
  });

  return { getFacturas, useFactura, createFactura, updateEstadoFactura, deleteFactura, getNextNumero };
}
