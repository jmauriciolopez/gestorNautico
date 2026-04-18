import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { httpClient } from '../../../shared/api/HttpClient';
import { Paginated, selectData } from '../../../api/pagination';

export interface ServicioCatalogo {
  id: number;
  nombre: string;
  descripcion: string;
  precioBase: number;
  categoria: string;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RegistroServicio {
  id: number;
  embarcacionId: number;
  servicioId: number;
  fechaProgramada: string;
  fechaCompletada?: string;
  estado: 'PENDIENTE' | 'EN_PROCESO' | 'COMPLETADO' | 'CANCELADO';
  observaciones?: string;
  costoFinal: number;
  facturado?: boolean;
  facturaId?: number;
  embarcacion: { id: number; nombre: string; matricula: string };
  servicio: { id: number; nombre: string; precioBase: number; categoria: string };
  createdAt: string;
  updatedAt: string;
}

export function useServicios() {
  const queryClient = useQueryClient();

  const getCatalogo = useQuery<ServicioCatalogo[]>({
    queryKey: ['catalogo'],
    queryFn: () => httpClient.get<Paginated<ServicioCatalogo>>('/catalogo'),
    select: selectData,
  });

  const createServicioCatalogo = useMutation({
    mutationFn: (data: Partial<ServicioCatalogo>) =>
      httpClient.post('/catalogo', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['catalogo'] }),
  });

  const updateServicioCatalogo = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<ServicioCatalogo> }) =>
      httpClient.put(`/catalogo/${id}`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['catalogo'] }),
  });

  const deleteServicioCatalogo = useMutation({
    mutationFn: (id: number) => httpClient.delete(`/catalogo/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['catalogo'] }),
  });

  const getRegistros = useQuery<RegistroServicio[]>({
    queryKey: ['registros'],
    queryFn: () => httpClient.get<RegistroServicio[]>('/registros'),
  });

  const createRegistro = useMutation({
    mutationFn: (data: Partial<RegistroServicio> & { embarcacionId: number; servicioId: number }) =>
      httpClient.post('/registros', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['registros'] }),
  });

  const updateRegistro = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<RegistroServicio> }) =>
      httpClient.put(`/registros/${id}`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['registros'] }),
  });

  const completeRegistro = useMutation({
    mutationFn: ({ id, costoFinal }: { id: number; costoFinal?: number }) =>
      httpClient.patch(`/registros/${id}/completar`, { costoFinal }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['registros'] }),
  });

  const deleteRegistro = useMutation({
    mutationFn: (id: number) => httpClient.delete(`/registros/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['registros'] }),
  });

  return { getCatalogo, createServicioCatalogo, updateServicioCatalogo, deleteServicioCatalogo, getRegistros, createRegistro, updateRegistro, completeRegistro, deleteRegistro };
}
