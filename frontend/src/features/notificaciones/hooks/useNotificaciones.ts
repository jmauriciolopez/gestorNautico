import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { httpClient } from '../../../shared/api/HttpClient';

export interface Notificacion {
  id: number;
  titulo: string;
  mensaje: string;
  leida: boolean;
  tipo: 'INFO' | 'EXITO' | 'ALERTA' | 'SISTEMA';
  createdAt: string;
}

export function useNotificaciones() {
  const queryClient = useQueryClient();

  const getNotificaciones = useQuery<Notificacion[]>({
    queryKey: ['notificaciones'],
    queryFn: async () => {
      try {
        return await httpClient.get<Notificacion[]>('/notificaciones');
      } catch (error) {
        console.error('Error fetching notifications:', error);
        return [];
      }
    },
    refetchInterval: 60000,
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
