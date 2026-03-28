import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchClient } from '../../../api/fetchClient';

// --- Catálogo de Servicios ---
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

// --- Registro de Servicio ---
export interface RegistroServicio {
  id: number;
  embarcacionId: number;
  servicioId: number;
  fechaProgramada: string;
  fechaCompletada?: string;
  estado: 'PENDIENTE' | 'EN_PROCESO' | 'COMPLETADO' | 'CANCELADO';
  observaciones?: string;
  costoFinal: number;
  embarcacion: {
    id: number;
    nombre: string;
    matricula: string;
  };
  servicio: {
    id: number;
    nombre: string;
    precioBase: number;
    categoria: string;
  };
  createdAt: string;
  updatedAt: string;
}

export function useServicios() {
  const queryClient = useQueryClient();

  // ===== CATÁLOGO =====
  const getCatalogo = useQuery<ServicioCatalogo[]>({
    queryKey: ['catalogo'],
    queryFn: () => fetchClient('/catalogo'),
  });

  const createServicioCatalogo = useMutation({
    mutationFn: (data: Partial<ServicioCatalogo>) =>
      fetchClient('/catalogo', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalogo'] });
    },
  });

  const updateServicioCatalogo = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<ServicioCatalogo> }) =>
      fetchClient(`/catalogo/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalogo'] });
    },
  });

  const deleteServicioCatalogo = useMutation({
    mutationFn: (id: number) =>
      fetchClient(`/catalogo/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalogo'] });
    },
  });

  // ===== REGISTROS =====
  const getRegistros = useQuery<RegistroServicio[]>({
    queryKey: ['registros'],
    queryFn: () => fetchClient('/registros'),
  });

  const createRegistro = useMutation({
    mutationFn: (data: Partial<RegistroServicio> & { embarcacionId: number; servicioId: number }) =>
      fetchClient('/registros', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['registros'] });
    },
  });

  const updateRegistro = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<RegistroServicio> }) =>
      fetchClient(`/registros/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['registros'] });
    },
  });

  const completeRegistro = useMutation({
    mutationFn: ({ id, costoFinal }: { id: number; costoFinal?: number }) =>
      fetchClient(`/registros/${id}/completar`, {
        method: 'PATCH',
        body: JSON.stringify({ costoFinal }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['registros'] });
    },
  });

  const deleteRegistro = useMutation({
    mutationFn: (id: number) =>
      fetchClient(`/registros/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['registros'] });
    },
  });

  return {
    // Catálogo
    getCatalogo,
    createServicioCatalogo,
    updateServicioCatalogo,
    deleteServicioCatalogo,
    // Registros
    getRegistros,
    createRegistro,
    updateRegistro,
    completeRegistro,
    deleteRegistro,
  };
}
