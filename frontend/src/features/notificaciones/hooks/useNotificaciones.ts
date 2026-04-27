import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { httpClient } from '../../../shared/api/HttpClient';

import { Paginated } from '../../../api/pagination';
import { useActiveGuarderiaId } from '../../../shared/hooks/useActiveGuarderiaId';

export interface Notificacion {
  id: number;
  titulo: string;
  mensaje: string;
  leida: boolean;
  tipo: 'INFO' | 'EXITO' | 'ALERTA' | 'SISTEMA';
  createdAt: string;
}

export function useNotificaciones(options: { page?: number; limit?: number } = {}) {
  const queryClient = useQueryClient();
  const guarderiaId = useActiveGuarderiaId();

  // 1. Obtener la lista paginada de notificaciones
  const getNotificaciones = useQuery<Paginated<Notificacion>>({
    queryKey: ['notificaciones', guarderiaId, options.page, options.limit],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (options.page) params.append('page', String(options.page));
      if (options.limit) params.append('limit', String(options.limit));
      const response = await httpClient.get<Paginated<Notificacion>>(`/notificaciones?${params.toString()}`);
      return response;
    },
    refetchInterval: 30000, // Polling cada 30s
  });

  // 2. Obtener solo el conteo de no leídas (Para el Badge)
  const getUnreadCount = useQuery<{ count: number }>({
    queryKey: ['notificaciones', guarderiaId, 'unread-count'],
    queryFn: () => httpClient.get<{ count: number }>('/notificaciones/unread-count'),
    refetchInterval: 30000,
  });

  const markAsRead = useMutation({
    mutationFn: (id: number) => httpClient.patch(`/notificaciones/${id}/leer`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notificaciones'] });
    },
  });

  const markAllAsRead = useMutation({
    mutationFn: () => httpClient.post('/notificaciones/leer-todas'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notificaciones'] });
    },
  });

  const deleteNotificacion = useMutation({
    mutationFn: (id: number) => httpClient.delete(`/notificaciones/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notificaciones'] });
    },
  });

  // Extraer solo las notificaciones NO leídas para la lista
  const notifications = (getNotificaciones.data?.data || []).filter(n => !n.leida);
  const unreadCount = getUnreadCount.data?.count || 0;

  return { getNotificaciones, notifications, markAsRead, markAllAsRead, deleteNotificacion, unreadCount };
}
