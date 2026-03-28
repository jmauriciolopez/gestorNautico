import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchClient } from '../../../api/fetchClient';

export interface Factura {
  id: number;
  numero: string;
  total: number;
  fechaEmision: string;
  estado: 'PENDIENTE' | 'PAGADA' | 'ANULADA';
  observaciones?: string;
  cliente: {
    id: number;
    nombre: string;
    dni: string;
  };
  cargos?: any[]; // Podríamos tipar esto mejor trayendo la interfaz Cargo
  createdAt: string;
  updatedAt: string;
}

export function useFacturas() {
  const queryClient = useQueryClient();

  const getFacturas = useQuery<Factura[]>({
    queryKey: ['facturas'],
    queryFn: () => fetchClient('/facturas'),
  });

  const getNextNumero = useQuery<string>({
    queryKey: ['facturas', 'next-numero'],
    queryFn: () => fetchClient('/facturas/next-numero'),
    enabled: true,
  });

  const useFactura = (id: number) =>
    useQuery<Factura>({
      queryKey: ['facturas', id],
      queryFn: () => fetchClient(`/facturas/${id}`),
      enabled: !!id,
    });

  const createFactura = useMutation({
    mutationFn: (data: { 
      clienteId: number; 
      numero?: string; 
      fechaEmision: string; 
      cargoIds: number[];
      observaciones?: string;
    }) =>
      fetchClient('/facturas', { method: 'POST', body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['facturas'] });
      queryClient.invalidateQueries({ queryKey: ['cargos'] });
    },
  });

  const updateEstadoFactura = useMutation({
    mutationFn: ({ id, estado }: { id: number; estado: Factura['estado'] }) =>
      fetchClient(`/facturas/${id}/estado`, {
        method: 'PATCH',
        body: { estado },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['facturas'] });
    },
  });

  const deleteFactura = useMutation({
    mutationFn: (id: number) =>
      fetchClient(`/facturas/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['facturas'] });
    },
  });

  return {
    getFacturas,
    useFactura,
    createFactura,
    updateEstadoFactura,
    deleteFactura,
  };
}
