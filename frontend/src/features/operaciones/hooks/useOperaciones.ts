import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { httpClient } from '../../../shared/api/HttpClient';
import { Paginated, selectData } from '../../../api/pagination';

export interface Pedido {
  id: number;
  estado: 'pendiente' | 'en_agua' | 'finalizado' | 'cancelado';
  fechaProgramada: string;
  embarcacion: {
    id: number;
    nombre: string;
    matricula: string;
    tieneDeuda?: boolean;
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
  embarcacionId: number;
  clienteId: number;
  fechaHoraDeseada: string;
  estado: 'PENDIENTE' | 'EN_AGUA' | 'FINALIZADA' | 'CANCELADA';
  motivoCancelacion?: string;
  embarcacion: {
    nombre: string;
    matricula: string;
    tieneDeuda: boolean;
  };
  cliente: {
    nombre: string;
    email: string;
    telefono: string;
  };
}

export function useOperaciones(options: {
  pagePedidos?: number;
  limitPedidos?: number;
  pageMovimientos?: number;
  limitMovimientos?: number;
  pageSolicitudes?: number;
  limitSolicitudes?: number;
} = {}) {
  const queryClient = useQueryClient();

  const getPedidos = useQuery<Pedido[]>({
    queryKey: ['pedidos', options.pagePedidos, options.limitPedidos],
    queryFn: () => {
      const params = new URLSearchParams();
      if (options.pagePedidos) params.append('page', String(options.pagePedidos));
      if (options.limitPedidos) params.append('limit', String(options.limitPedidos));
      return httpClient.get<Paginated<Pedido>>(`/pedidos?${params.toString()}`);
    },
    select: selectData,
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
    queryKey: ['movimientos', options.pageMovimientos, options.limitMovimientos],
    queryFn: (): Promise<Movimiento[]> => {
      const params = new URLSearchParams();
      if (options.pageMovimientos) params.append('page', String(options.pageMovimientos));
      if (options.limitMovimientos) params.append('limit', String(options.limitMovimientos));
      return httpClient.get<Paginated<Movimiento>>(`/movimientos?${params.toString()}`).then(selectData);
    },
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

const MOVIMIENTOS_PAGE_SIZE = 20;

export function useMovimientosPaginados(page: number, limit = MOVIMIENTOS_PAGE_SIZE) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['movimientos', page, limit],
    queryFn: (): Promise<Paginated<Movimiento>> =>
      httpClient.get<Paginated<Movimiento>>(`/movimientos?page=${page}&limit=${limit}`),
    placeholderData: (prev) => prev,
    staleTime: 30_000,
  });

  const createMovimiento = useMutation({
    mutationFn: (data: Partial<Movimiento> & { embarcacionId: number; espacioId?: number }) =>
      httpClient.post('/movimientos', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movimientos'] });
      queryClient.invalidateQueries({ queryKey: ['embarcaciones'] });
    },
  });

  return { query, createMovimiento };
}


export function useSolicitudesBajada(options: { page?: number; limit?: number } = {}) {
  const queryClient = useQueryClient();

  const getSolicitudes = useQuery({
    queryKey: ['solicitudes-bajada', options.page, options.limit],
    queryFn: (): Promise<SolicitudBajada[]> => {
      const params = new URLSearchParams();
      if (options.page) params.append('page', String(options.page));
      if (options.limit) params.append('limit', String(options.limit));
      return httpClient.get<Paginated<SolicitudBajada>>(`/operaciones/solicitudes?${params.toString()}`).then(selectData);
    },
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
