import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchClient } from '../api/fetchClient';

export interface Cliente {
  id: number;
  nombre: string;
  dni: string;
  email: string;
  telefono: string;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}

export const useClientes = () => {
  const queryClient = useQueryClient();

  const getClientes = useQuery({
    queryKey: ['clientes'],
    queryFn: () => fetchClient<Cliente[]>('/clientes'),
  });

  const getCliente = (id: number) =>
    useQuery({
      queryKey: ['clientes', id],
      queryFn: () => fetchClient<Cliente>(`/clientes/${id}`),
      enabled: !!id,
    });

  const createCliente = useMutation({
    mutationFn: (newCliente: Partial<Cliente>) =>
      fetchClient<Cliente>('/clientes', {
        method: 'POST',
        body: newCliente,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
    },
  });

  const updateCliente = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Cliente> }) =>
      fetchClient<Cliente>(`/clientes/${id}`, {
        method: 'PUT',
        body: data,
      }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      queryClient.invalidateQueries({ queryKey: ['clientes', data.id] });
    },
  });

  const deleteCliente = useMutation({
    mutationFn: (id: number) =>
      fetchClient<void>(`/clientes/${id}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
    },
  });

  return {
    getClientes,
    getCliente,
    createCliente,
    updateCliente,
    deleteCliente,
  };
};
