import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { httpClient } from '../../../shared/api/HttpClient';
import { Paginated, selectData } from '../../../api/pagination';

export interface Ubicacion {
  id: number;
  nombre: string;
  descripcion?: string;
  zonas: Zona[];
}

export interface Zona {
  id: number;
  nombre: string;
  ubicacionId: number;
  racks: Rack[];
}

export interface Rack {
  id: number;
  codigo: string;
  zonaId: number;
  pisos: number;
  filas: number;
  columnas: number;
  alto: number;
  ancho: number;
  largo: number;
  tarifaBase: number;
  espacios: Espacio[];
}

export interface Espacio {
  id: number;
  numero: string;
  piso?: number;
  fila?: number;
  columna?: number;
  ocupado: boolean;
  rackId: number;
  embarcacion?: { id: number; nombre: string; eslora: number; propietario?: string };
}

export interface EstadisticasInfraestructura {
  total: number;
  ocupados: number;
  libres: number;
  porcentajeOcupacion: number;
}

export const useUbicaciones = (options: {
  pageUbicaciones?: number;
  limitUbicaciones?: number;
  pageZonas?: number;
  limitZonas?: number;
} = {}) => {
  const queryClient = useQueryClient();

  const useUbicacionesQuery = useQuery({
    queryKey: ['ubicaciones', options.pageUbicaciones, options.limitUbicaciones],
    queryFn: () => {
      const params = new URLSearchParams();
      if (options.pageUbicaciones) params.append('page', String(options.pageUbicaciones));
      if (options.limitUbicaciones) params.append('limit', String(options.limitUbicaciones));
      return httpClient.get<Paginated<Ubicacion>>(`/ubicaciones?${params.toString()}`).then(selectData);
    },
  });

  const useZonas = useQuery({
    queryKey: ['zonas', options.pageZonas, options.limitZonas],
    queryFn: () => {
      const params = new URLSearchParams();
      if (options.pageZonas) params.append('page', String(options.pageZonas));
      if (options.limitZonas) params.append('limit', String(options.limitZonas));
      return httpClient.get<Paginated<Zona>>(`/zonas?${params.toString()}`).then(selectData);
    },
  });

  const useEstadisticas = useQuery({
    queryKey: ['infra-stats'],
    queryFn: () => httpClient.get<EstadisticasInfraestructura>('/espacios/estadisticas'),
  });

  const createUbicacion = useMutation({
    mutationFn: (data: { nombre: string; descripcion?: string }) =>
      httpClient.post<Ubicacion>('/ubicaciones', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['ubicaciones'] }),
  });

  const createZona = useMutation({
    mutationFn: (data: { nombre: string; ubicacionId: number }) =>
      httpClient.post<Zona>('/zonas', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['zonas'] });
      queryClient.invalidateQueries({ queryKey: ['ubicaciones'] });
    },
  });

  const createRack = useMutation({
    mutationFn: (data: { zonaId: number; codigo: string; pisos: number; filas: number; columnas: number; alto: number; ancho: number; largo: number; tarifaBase: number }) =>
      httpClient.post<Rack>('/racks', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['zonas'] });
      queryClient.invalidateQueries({ queryKey: ['ubicaciones'] });
      queryClient.refetchQueries({ queryKey: ['zonas'] });
      queryClient.refetchQueries({ queryKey: ['ubicaciones'] });
    },
  });

  const updateZona = useMutation({
    mutationFn: ({ id, ...data }: { id: number; nombre: string; ubicacionId: number }) =>
      httpClient.put<Zona>(`/zonas/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['zonas'] });
      queryClient.invalidateQueries({ queryKey: ['ubicaciones'] });
    },
  });

  const deleteZona = useMutation({
    mutationFn: (id: number) => httpClient.delete(`/zonas/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['zonas'] });
      queryClient.invalidateQueries({ queryKey: ['ubicaciones'] });
    },
  });

  const updateRack = useMutation({
    mutationFn: ({ id, ...data }: { id: number; zonaId: number; codigo: string; pisos: number; filas: number; columnas: number; alto: number; ancho: number; largo: number; tarifaBase: number }) =>
      httpClient.put<Rack>(`/racks/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['zonas'] });
      queryClient.invalidateQueries({ queryKey: ['ubicaciones'] });
      queryClient.refetchQueries({ queryKey: ['zonas'] });
      queryClient.refetchQueries({ queryKey: ['ubicaciones'] });
    },
  });

  const deleteRack = useMutation({
    mutationFn: (id: number) => httpClient.delete(`/racks/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['zonas'] });
      queryClient.invalidateQueries({ queryKey: ['ubicaciones'] });
    },
  });

  const updateEspacio = useMutation({
    mutationFn: ({ id, ocupado }: { id: number; ocupado: boolean }) =>
      httpClient.put<Espacio>(`/espacios/${id}`, { ocupado }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['zonas'] });
      queryClient.invalidateQueries({ queryKey: ['ubicaciones'] });
      queryClient.invalidateQueries({ queryKey: ['infra-stats'] });
    },
  });

  const syncHealth = useMutation({
    mutationFn: () => httpClient.post<{ corregidos: number }>('/espacios/sync', {}),
    onSuccess: (data) => {
      toast.success(`Saneamiento completado. Registros corregidos: ${data.corregidos}`);
      void queryClient.invalidateQueries({ queryKey: ['ubicaciones'] });
      void queryClient.invalidateQueries({ queryKey: ['zonas'] });
      void queryClient.invalidateQueries({ queryKey: ['infra-stats'] });
    },
    onError: (error: any) => {
      toast.error(`Error en saneamiento: ${error.message}`);
    },
  });

  return {
    useUbicacionesQuery,
    useZonas,
    useEstadisticas,
    createUbicacion,
    createZona,
    updateZona,
    deleteZona,
    createRack,
    updateRack,
    deleteRack,
    updateEspacio,
    syncHealth,
  };
};
