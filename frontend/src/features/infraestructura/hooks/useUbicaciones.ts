import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchClient } from '../../../api/fetchClient';

export interface Zona {
  id: number;
  nombre: string;
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

  const getZonas = useQuery({
    queryKey: ['zonas'],
    queryFn: () => fetchClient<Zona[]>('/zonas'),
  });

  const getEstadisticas = useQuery({
    queryKey: ['infra-stats'],
    queryFn: () => fetchClient<EstadisticasInfraestructura>('/espacios/estadisticas'),
  });

  const createZona = useMutation({
    mutationFn: (nombre: string) => 
      fetchClient<Zona>('/zonas', {
        method: 'POST',
        body: { nombre }
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['zonas'] }),
  });

  const createRack = useMutation({
    mutationFn: (data: { zonaId: number; codigo: string; numEspacios: number }) =>
      fetchClient<Rack>('/racks', {
        method: 'POST',
        body: data
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['zonas'] }),
  });

  const updateEspacio = useMutation({
    mutationFn: ({ id, ocupado }: { id: number; ocupado: boolean }) =>
      fetchClient<Espacio>(`/espacios/${id}`, {
        method: 'PUT',
        body: { ocupado }
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['zonas'] });
      queryClient.invalidateQueries({ queryKey: ['infra-stats'] });
    },
  });

  return {
    getZonas,
    getEstadisticas,
    createZona,
    createRack,
    updateEspacio,
  };
};
