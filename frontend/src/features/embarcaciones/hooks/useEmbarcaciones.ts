import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { httpClient } from '../../../shared/api/HttpClient';
import { Paginated } from '../../../api/pagination';

export interface Embarcacion {
  id: number;
  nombre: string;
  matricula: string;
  marca?: string;
  modelo?: string;
  eslora?: number;
  manga?: number;
  tipo: string;
  estado_operativo: string;
  cliente?: Cliente;
  espacio?: any;
  espacioId?: number | null;
  descuento?: number;
  tieneDeuda?: boolean;
  createdAt: string;
  updatedAt: string;
}

export const useEmbarcaciones = (options: { page?: number; limit?: number; search?: string } = {}) => {
  const queryClient = useQueryClient();

  const getEmbarcaciones = useQuery({
    queryKey: ['embarcaciones', options.page, options.limit, options.search],
    queryFn: () => {
      const params = new URLSearchParams();
      if (options.page) params.append('page', String(options.page));
      if (options.limit) params.append('limit', String(options.limit));
      if (options.search) params.append('search', options.search);
      return httpClient.get<Paginated<Embarcacion>>(`/embarcaciones?${params.toString()}`);
    },
  });

  const useEmbarcacion = (id: number) =>
    useQuery({
      queryKey: ['embarcaciones', id],
      queryFn: () => httpClient.get<Embarcacion>(`/embarcaciones/${id}`),
      enabled: !!id,
    });

  const createEmbarcacion = useMutation({
    mutationFn: (data: Partial<Embarcacion>) =>
      httpClient.post<Embarcacion>('/embarcaciones', data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['embarcaciones'], refetchType: 'all' });
      void queryClient.invalidateQueries({ queryKey: ['zonas'], refetchType: 'all' });
      void queryClient.invalidateQueries({ queryKey: ['ubicaciones'], refetchType: 'all' });
      void queryClient.invalidateQueries({ queryKey: ['infra-stats'], refetchType: 'all' });
      void queryClient.invalidateQueries({ queryKey: ['dashboard'], refetchType: 'all' });
    },
  });

  const updateEmbarcacion = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Embarcacion> }) =>
      httpClient.put<Embarcacion>(`/embarcaciones/${id}`, data),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: ['embarcaciones'], refetchType: 'all' });
      void queryClient.invalidateQueries({ queryKey: ['embarcaciones', data.id], refetchType: 'all' });
      void queryClient.invalidateQueries({ queryKey: ['zonas'], refetchType: 'all' });
      void queryClient.invalidateQueries({ queryKey: ['ubicaciones'], refetchType: 'all' });
      void queryClient.invalidateQueries({ queryKey: ['infra-stats'], refetchType: 'all' });
      void queryClient.invalidateQueries({ queryKey: ['dashboard'], refetchType: 'all' });
    },
  });

  const deleteEmbarcacion = useMutation({
    mutationFn: (id: number) =>
      httpClient.delete(`/embarcaciones/${id}`),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['embarcaciones'], refetchType: 'all' });
      void queryClient.invalidateQueries({ queryKey: ['zonas'], refetchType: 'all' });
      void queryClient.invalidateQueries({ queryKey: ['ubicaciones'], refetchType: 'all' });
      void queryClient.invalidateQueries({ queryKey: ['infra-stats'], refetchType: 'all' });
      void queryClient.invalidateQueries({ queryKey: ['dashboard'], refetchType: 'all' });
    },
  });

  const embarcaciones = getEmbarcaciones.data?.data || [];
  const meta = getEmbarcaciones.data ? {
    total: getEmbarcaciones.data.total,
    page: getEmbarcaciones.data.page,
    limit: getEmbarcaciones.data.limit,
    totalPages: getEmbarcaciones.data.totalPages
  } : undefined;

  return { getEmbarcaciones, embarcaciones, meta, useEmbarcacion, createEmbarcacion, updateEmbarcacion, deleteEmbarcacion };
};
