import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { httpClient } from '../../../shared/api/HttpClient';
import { Paginated, selectData } from '../../../api/pagination';

export interface Pedido {
  id: number;
  estado: 'pendiente' | 'en_proceso' | 'completado' | 'cancelado';
  fechaProgramada: string;
  embarcacion: {
    id: number;
    nombre: string;
    matricula: string;
    cliente?: { id: number; nombre: string };
  };
  createdAt: string;
}

export interface Movimiento {
  id: number;
  tipo: 'entrada' | 'salida';
  fecha: string;
  observaciones?: string;
  embarcacion: { id: number; nombre: string; matricula: string };
  espacio?: { id: number; numero: string; rack?: { id: number; codigo: string } };
}

export interface SolicitudBajada {
  id: number;
  estado: 'PENDIENTE' | 'CONFIRMADA' | 'COMPLETADA' | 'CANCELADA';
  fechaHoraDeseada: string;
  observaciones?: string;
  cliente: { id: number; nombre: string; email: string };
  embarcacion: { id: number; nombre: string; matricula: string };
  createdAt: string;
}

export function useOperaciones() {
  const queryClient = useQueryClient();

  const getPedidos = useQuery<Pedido[]>({
    queryKey: ['pedidos'],
    queryFn: () => httpClient.get<Pedido[]>('/pedidos'),
  });

  const usePedido = (id: number) =>
    useQuery<Pedido>({
      queryKey: ['pedidos', id],
      queryFn: () => httpClient.get<Pedido>(`/pedidos/${id}`),
      enabled: !!id,
    });

  const createPedido = useMutation({
    mutationFn: (data: Partial<Pedido> & { embarcacionId: number }) =>
      httpClient.post('/pedidos', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pedidos'] });
    },
  });

  const updatePedidoEstado = useMutation({
    mutationFn: ({ id, estado }: { id: number; estado: string }) =>
      httpClient.patch(`/pedidos/${id}/estado`, { estado }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pedidos'] });
      queryClient.invalidateQueries({ queryKey: ['embarcaciones'] });
    },
  });

  const deletePedido = useMutation({
    mutationFn: (id: number) => httpClient.delete(`/pedidos/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pedidos'] });
    },
  });

  const getMovimientos = useQuery({
    queryKey: ['movimientos'],
    queryFn: (): Promise<Movimiento[]> =>
      httpClient.get<Paginated<Movimiento>>('/movimientos?limit=100').then(selectData),
  });

  const createMovimiento = useMutation({
    mutationFn: (data: Partial<Movimiento> & { embarcacionId: number; espacioId?: number }) =>
      httpClient.post('/movimientos', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movimientos'] });
      queryClient.invalidateQueries({ queryKey: ['embarcaciones'] });
    },
  });

  return { getPedidos, usePedido, createPedido, updatePedidoEstado, deletePedido, getMovimientos, createMovimiento };
}

export function useSolicitudesBajada() {
  const queryClient = useQueryClient();

  const getSolicitudes = useQuery({
    queryKey: ['solicitudes-bajada'],
    queryFn: (): Promise<SolicitudBajada[]> =>
      httpClient.get<Paginated<SolicitudBajada>>('/operaciones/solicitudes?limit=100').then(selectData),
  });

  const updateEstado = useMutation({
    mutationFn: ({ id, estado, motivo }: { id: number; estado: SolicitudBajada['estado']; motivo?: string }) =>
      httpClient.patch(`/operaciones/solicitudes/${id}/estado`, { estado, motivo }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['solicitudes-bajada'] });
      queryClient.invalidateQueries({ queryKey: ['embarcaciones'] });
    },
  });

  return { getSolicitudes, updateEstado };
}
