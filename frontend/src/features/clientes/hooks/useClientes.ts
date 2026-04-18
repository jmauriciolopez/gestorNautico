import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { httpClient } from '../../../shared/api/HttpClient';
import { Paginated, selectData } from '../../../api/pagination';

export interface Cliente {
  id: number;
  nombre: string;
  dni: string;
  email: string;
  telefono: string;
  activo: boolean;
  diaFacturacion?: number;
  descuento?: number;
  tipoCuota?: string;
  tarifaBase?: number;
  responsableFamiliaId?: number | null;
  createdAt: string;
  updatedAt: string;
}

export const useClientes = () => {
  const queryClient = useQueryClient();

  const getClientes = useQuery({
    queryKey: ['clientes'],
    queryFn: () => httpClient.get<Paginated<Cliente>>('/clientes'),
    select: selectData,
  });

  const useCliente = (id: number) =>
    useQuery({
      queryKey: ['clientes', id],
      queryFn: () => httpClient.get<Cliente>(`/clientes/${id}`),
      enabled: !!id,
    });

  const createCliente = useMutation({
    mutationFn: (data: Partial<Cliente>) =>
      httpClient.post<Cliente>('/clientes', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
    },
  });

  const updateCliente = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Cliente> }) =>
      httpClient.put<Cliente>(`/clientes/${id}`, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      queryClient.invalidateQueries({ queryKey: ['clientes', data.id] });
    },
  });

  const deleteCliente = useMutation({
    mutationFn: (id: number) =>
      httpClient.delete(`/clientes/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
    },
  });

  return { getClientes, useCliente, createCliente, updateCliente, deleteCliente };
};
