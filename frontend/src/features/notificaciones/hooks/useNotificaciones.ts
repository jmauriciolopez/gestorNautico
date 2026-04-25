import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { httpClient } from '../../../shared/api/HttpClient';

import { Paginated, selectData } from '../../../api/pagination';
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

  const getNotificaciones = useQuery<Notificacion[]>({
    queryKey: ['notificaciones', guarderiaId, options.page, options.limit],
    queryFn: async () => {
      try {
        const params = new URLSearchParams();
        if (options.page) params.append('page', String(options.page));
        if (options.limit) params.append('limit', String(options.limit));
        return await httpClient.get<Paginated<Notificacion>>(`/notificaciones?${params.toString()}`).then(selectData);
      } catch (error) {
        console.error('Error fetching notifications:', error);
        return [];
      }
    },
    refetchInterval: 30000,
  });

  const markAsRead = useMutation({
    mutationFn: (id: number) => httpClient.patch(`/notificaciones/${id}/leer`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notificaciones'] }),
  });

  const markAllAsRead = useMutation({
    mutationFn: () => httpClient.post('/notificaciones/leer-todas'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notificaciones'] }),
  });

  const deleteNotificacion = useMutation({
    mutationFn: (id: number) => httpClient.delete(`/notificaciones/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notificaciones'] }),
  });

  const unreadCount = getNotificaciones.data?.filter(n => !n.leida).length || 0;

  return { getNotificaciones, markAsRead, markAllAsRead, deleteNotificacion, unreadCount };
}
