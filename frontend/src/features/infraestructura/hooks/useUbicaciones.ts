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
  espacios: Espacio[];
}

export interface Espacio {
  id: number;
  numero: string;
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
    mutationFn: (data: { zonaId: number; codigo: string; numEspacios: number }) =>
      fetchClient<Rack>('/racks', {
        method: 'POST',
        body: data
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
    createRack,
    updateEspacio,
  };
};
