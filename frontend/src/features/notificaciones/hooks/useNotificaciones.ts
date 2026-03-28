import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchClient } from '../../../api/fetchClient';

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
        return await fetchClient('/notificaciones');
      } catch (error) {
        console.error('Error fetching notifications:', error);
        return [];
      }
    },
    refetchInterval: 60000, // Poll every 60 seconds (reduced frequency)
  });

  const markAsRead = useMutation({
    mutationFn: (id: number) =>
      fetchClient(`/notificaciones/${id}/leer`, {
        method: 'PATCH',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notificaciones'] });
    },
  });

  const markAllAsRead = useMutation({
    mutationFn: () =>
      fetchClient('/notificaciones/leer-todas', {
        method: 'POST',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notificaciones'] });
    },
  });

  const deleteNotificacion = useMutation({
    mutationFn: (id: number) =>
      fetchClient(`/notificaciones/${id}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notificaciones'] });
    },
  });

  const unreadCount = getNotificaciones.data?.filter(n => !n.leida).length || 0;

  return {
    getNotificaciones,
    markAsRead,
    markAllAsRead,
    deleteNotificacion,
    unreadCount,
  };
}
