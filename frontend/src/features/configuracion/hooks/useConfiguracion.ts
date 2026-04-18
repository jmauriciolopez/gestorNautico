import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { httpClient } from '../../../shared/api/HttpClient';

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
    queryFn: () => httpClient.get<Configuracion[]>('/configuracion'),
  });

  const updateConfiguracion = useMutation({
    mutationFn: (updates: Record<string, string>) =>
      httpClient.put<Configuracion[]>('/configuracion/bulk', updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['configuracion'] });
    },
  });

  return { getConfiguraciones, updateConfiguracion };
};
