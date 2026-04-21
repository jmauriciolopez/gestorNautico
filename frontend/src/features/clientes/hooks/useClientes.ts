import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { httpClient } from '../../../shared/api/HttpClient';
import { Paginated } from '../../../api/pagination';

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

export const useClientes = (options: { page?: number; limit?: number; search?: string } = {}) => {
  const queryClient = useQueryClient();

  const getClientes = useQuery({
    queryKey: ['clientes', options.page, options.limit, options.search],
    queryFn: () => {
      const params = new URLSearchParams();
      if (options.page) params.append('page', String(options.page));
      if (options.limit) params.append('limit', String(options.limit));
      if (options.search) params.append('search', options.search);
      return httpClient.get<Paginated<Cliente>>(`/clientes?${params.toString()}`);
    },
  });

  // Derived data for backward compatibility in components using { data: clientes = [] } = getClientes
  const clientes = getClientes.data?.data || [];
  const meta = getClientes.data?.meta;

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

  return { getClientes, clientes, meta, deleteCliente, updateCliente, createCliente, useCliente };
};
