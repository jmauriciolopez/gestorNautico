import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchClient } from '../api/fetchClient';
import { Cliente } from './useClientes';

export interface Embarcacion {
  id: number;
  nombre: string;
  matricula: string;
  marca?: string;
  modelo?: string;
  eslora?: number;
  manga?: number;
  tipo: string;
  estado: string;
  cliente?: Cliente;
  espacio?: any; // To be defined later
  createdAt: string;
  updatedAt: string;
}

export const useEmbarcaciones = () => {
  const queryClient = useQueryClient();

  const getEmbarcaciones = useQuery({
    queryKey: ['embarcaciones'],
    queryFn: () => fetchClient<Embarcacion[]>('/embarcaciones'),
  });

  const getEmbarcacion = (id: number) =>
    useQuery({
      queryKey: ['embarcaciones', id],
      queryFn: () => fetchClient<Embarcacion>(`/embarcaciones/${id}`),
      enabled: !!id,
    });

  const createEmbarcacion = useMutation({
    mutationFn: (newEmbarcacion: Partial<Embarcacion>) =>
      fetchClient<Embarcacion>('/embarcaciones', {
        method: 'POST',
        body: newEmbarcacion,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['embarcaciones'] });
    },
  });

  const updateEmbarcacion = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Embarcacion> }) =>
      fetchClient<Embarcacion>(`/embarcaciones/${id}`, {
        method: 'PUT',
        body: data,
      }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['embarcaciones'] });
      queryClient.invalidateQueries({ queryKey: ['embarcaciones', data.id] });
    },
  });

  const deleteEmbarcacion = useMutation({
    mutationFn: (id: number) =>
      fetchClient<void>(`/embarcaciones/${id}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['embarcaciones'] });
    },
  });

  return {
    getEmbarcaciones,
    getEmbarcacion,
    createEmbarcacion,
    updateEmbarcacion,
    deleteEmbarcacion,
  };
};
