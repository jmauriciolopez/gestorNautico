import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchClient } from '../api/fetchClient';

export interface Pedido {
  id: number;
  estado: 'pendiente' | 'en_proceso' | 'completado' | 'cancelado';
  fechaProgramada: string;
  embarcacion: {
    id: number;
    nombre: string;
    matricula: string;
    cliente?: {
      id: number;
      nombre: string;
    };
  };
  createdAt: string;
}

export interface Movimiento {
  id: number;
  tipo: 'entrada' | 'salida';
  fecha: string;
  observaciones?: string;
  embarcacion: {
    id: number;
    nombre: string;
    matricula: string;
  };
  espacio?: {
    id: number;
    nombre: string;
  };
}

export function useOperaciones() {
  const queryClient = useQueryClient();

  // --- PEDIDOS ---
  const getPedidos = useQuery<Pedido[]>({
    queryKey: ['pedidos'],
    queryFn: () => fetchClient('/operaciones/pedidos'),
  });

  const getPedido = (id: number) => useQuery<Pedido>({
    queryKey: ['pedidos', id],
    queryFn: () => fetchClient(`/operaciones/pedidos/${id}`),
    enabled: !!id,
  });

  const createPedido = useMutation({
    mutationFn: (data: Partial<Pedido> & { embarcacionId: number }) => 
      fetchClient('/operaciones/pedidos', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pedidos'] });
    },
  });

  const updatePedido = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Pedido> }) => 
      fetchClient(`/operaciones/pedidos/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pedidos'] });
    },
  });

  const deletePedido = useMutation({
    mutationFn: (id: number) => 
      fetchClient(`/operaciones/pedidos/${id}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pedidos'] });
    },
  });

  // --- MOVIMIENTOS ---
  const getMovimientos = useQuery<Movimiento[]>({
    queryKey: ['movimientos'],
    queryFn: () => fetchClient('/operaciones/movimientos'),
  });

  const createMovimiento = useMutation({
    mutationFn: (data: Partial<Movimiento> & { embarcacionId: number; espacioId?: number }) => 
      fetchClient('/operaciones/movimientos', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movimientos'] });
    },
  });

  return {
    getPedidos,
    getPedido,
    createPedido,
    updatePedido,
    deletePedido,
    getMovimientos,
    createMovimiento,
  };
}
