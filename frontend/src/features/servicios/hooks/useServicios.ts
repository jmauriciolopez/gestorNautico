import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { httpClient } from '../../../shared/api/HttpClient';
import { Paginated } from '../../../api/pagination';

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

export function useServicios(options: { 
  pageCatalogo?: number; 
  limitCatalogo?: number;
  pageRegistros?: number;
  limitRegistros?: number;
  searchRegistros?: string;
  estadoRegistros?: string;
} = {}) {
  const queryClient = useQueryClient();

  const getCatalogo = useQuery({
    queryKey: ['catalogo', options.pageCatalogo, options.limitCatalogo],
    queryFn: () => {
      const params = new URLSearchParams();
      if (options.pageCatalogo) params.append('page', String(options.pageCatalogo));
      if (options.limitCatalogo) params.append('limit', String(options.limitCatalogo));
      return httpClient.get<Paginated<ServicioCatalogo>>(`/catalogo?${params.toString()}`);
    },
  });

  const getRegistros = useQuery({
    queryKey: ['registros', options.pageRegistros, options.limitRegistros, options.searchRegistros, options.estadoRegistros],
    queryFn: () => {
      const params = new URLSearchParams();
      if (options.pageRegistros) params.append('page', String(options.pageRegistros));
      if (options.limitRegistros) params.append('limit', String(options.limitRegistros));
      if (options.searchRegistros) params.append('search', options.searchRegistros);
      if (options.estadoRegistros) params.append('estado', options.estadoRegistros);
      return httpClient.get<Paginated<RegistroServicio>>(`/registros?${params.toString()}`);
    },
  });

  const catalogo = getCatalogo.data?.data || [];
  const metaCatalogo = getCatalogo.data?.meta;
  const registros = getRegistros.data?.data || [];
  const metaRegistros = getRegistros.data?.meta;

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

  return { 
    getCatalogo, catalogo, metaCatalogo, 
    getRegistros, registros, metaRegistros,
    createServicioCatalogo, updateServicioCatalogo, deleteServicioCatalogo, 
    createRegistro, updateRegistro, completeRegistro, deleteRegistro 
  };
}
