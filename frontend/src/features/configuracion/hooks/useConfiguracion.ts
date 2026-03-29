import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchClient } from '../../../api/fetchClient';

export interface Configuracion {
  id: number;
  clave: string;
  valor: string;
  descripcion: string;
  updatedAt: string;
}

export const useConfiguracion = () => {
  const queryClient = useQueryClient();

  const getConfiguraciones = useQuery({
    queryKey: ['configuracion'],
    queryFn: () => fetchClient<Configuracion[]>('/configuracion'),
  });

  const updateConfiguracion = useMutation({
    mutationFn: (updates: Record<string, string>) =>
      fetchClient<Configuracion[]>('/configuracion/bulk', {
        method: 'PUT',
        body: updates,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['configuracion'] });
    },
  });

  return {
    getConfiguraciones,
    updateConfiguracion,
  };
};
