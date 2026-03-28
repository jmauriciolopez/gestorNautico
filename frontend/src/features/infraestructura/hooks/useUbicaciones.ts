import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchClient } from '../../../api/fetchClient';

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
}

export interface EstadisticasInfraestructura {
  total: number;
  ocupados: number;
  libres: number;
  porcentajeOcupacion: number;
}

export const useUbicaciones = () => {
  const queryClient = useQueryClient();

  const useUbicacionesQuery = useQuery({
    queryKey: ['ubicaciones'],
    queryFn: () => fetchClient<Ubicacion[]>('/ubicaciones'),
  });

  const useZonas = useQuery({
    queryKey: ['zonas'],
    queryFn: () => fetchClient<Zona[]>('/zonas'),
  });

  const useEstadisticas = useQuery({
    queryKey: ['infra-stats'],
    queryFn: () => fetchClient<EstadisticasInfraestructura>('/espacios/estadisticas'),
  });

  const createUbicacion = useMutation({
    mutationFn: (data: { nombre: string; descripcion?: string }) =>
      fetchClient<Ubicacion>('/ubicaciones', {
        method: 'POST',
        body: data
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['ubicaciones'] }),
  });

  const createZona = useMutation({
    mutationFn: (data: { nombre: string; ubicacionId: number }) => 
      fetchClient<Zona>('/zonas', {
        method: 'POST',
        body: data
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['zonas'] });
      queryClient.invalidateQueries({ queryKey: ['ubicaciones'] });
    },
  });

  const createRack = useMutation({
    mutationFn: (data: { 
      zonaId: number; 
      codigo: string; 
      pisos: number;
      filas: number; 
      columnas: number;
      alto: number;
      ancho: number;
      largo: number;
    }) =>
      fetchClient<Rack>('/racks', {
        method: 'POST',
        body: data
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['zonas'] });
      queryClient.invalidateQueries({ queryKey: ['ubicaciones'] });
    },
  });

  const updateZona = useMutation({
    mutationFn: ({ id, ...data }: { id: number; nombre: string; ubicacionId: number }) =>
      fetchClient<Zona>(`/zonas/${id}`, {
        method: 'PUT',
        body: data
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['zonas'] });
      queryClient.invalidateQueries({ queryKey: ['ubicaciones'] });
    },
  });

  const deleteZona = useMutation({
    mutationFn: (id: number) =>
      fetchClient(`/zonas/${id}`, {
        method: 'DELETE'
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['zonas'] });
      queryClient.invalidateQueries({ queryKey: ['ubicaciones'] });
    },
  });

  const updateRack = useMutation({
    mutationFn: ({ id, ...data }: { 
      id: number;
      zonaId: number; 
      codigo: string; 
      pisos: number;
      filas: number; 
      columnas: number;
      alto: number;
      ancho: number;
      largo: number;
    }) =>
      fetchClient<Rack>(`/racks/${id}`, {
        method: 'PUT',
        body: data
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['zonas'] });
      queryClient.invalidateQueries({ queryKey: ['ubicaciones'] });
    },
  });

  const deleteRack = useMutation({
    mutationFn: (id: number) =>
      fetchClient(`/racks/${id}`, {
        method: 'DELETE'
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['zonas'] });
      queryClient.invalidateQueries({ queryKey: ['ubicaciones'] });
    },
  });

  const updateEspacio = useMutation({
    mutationFn: ({ id, ocupado }: { id: number; ocupado: boolean }) =>
      fetchClient<Espacio>(`/espacios/${id}`, {
        method: 'PUT',
        body: { ocupado }
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['zonas'] });
      queryClient.invalidateQueries({ queryKey: ['ubicaciones'] });
      queryClient.invalidateQueries({ queryKey: ['infra-stats'] });
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
  };
};
