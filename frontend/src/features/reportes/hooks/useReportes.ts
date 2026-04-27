import { useQuery } from '@tanstack/react-query';
import { httpClient } from '../../../shared/api/HttpClient';
import { useActiveGuarderiaId } from '../../../shared/hooks/useActiveGuarderiaId';

export interface ClienteMoroso {
  clienteId: number;
  nombre: string;
  email: string;
  telefono: string;
  totalDeuda: number;
  cantidadCargos: number;
  diasMaxAtraso: number;
  fechaVencimientoMasAntigua: string;
}

export interface MensualidadDescuento {
  clienteId: number;
  clienteNombre: string;
  descuentoCliente: number;
  embarcacionId: number;
  embarcacionNombre: string;
  matricula: string;
  descuentoEmbarcacion: number;
  rack: string;
  espacio: string;
  tarifaBase: number;
  montoDescCliente: number;
  montoDescEmbarcacion: number;
  totalFinal: number;
}

export const useClientesMorosos = () => {
  const guarderiaId = useActiveGuarderiaId();
  return useQuery<ClienteMoroso[]>({
    queryKey: ['reportes', guarderiaId, 'morosos'],
    queryFn: () => httpClient.get('/reportes/morosos'),
    staleTime: 1000 * 60 * 1, // 1 minuto
  });
};

export const useMensualidades = () => {
  const guarderiaId = useActiveGuarderiaId();
  return useQuery<MensualidadDescuento[]>({
    queryKey: ['reportes', guarderiaId, 'mensualidades'],
    queryFn: () => httpClient.get('/reportes/mensualidades'),
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};

export interface OcupacionReport {
  total: number;
  ocupados: number;
  libres: number;
  porcentajeOcupacion: number;
  porZona: {
    nombre: string;
    total: number;
    ocupados: number;
    porcentaje: number;
  }[];
}

export const useOcupacion = () => {
  const guarderiaId = useActiveGuarderiaId();
  return useQuery<OcupacionReport>({
    queryKey: ['reportes', guarderiaId, 'ocupacion'],
    queryFn: () => httpClient.get('/reportes/ocupacion'),
    staleTime: 1000 * 60 * 2, // 2 minutos
  });
};

export interface IngresoReport {
  mes: string;
  total: number;
}

export const useIngresos = (params: { startDate?: string; endDate?: string } = {}) => {
  const guarderiaId = useActiveGuarderiaId();
  return useQuery<IngresoReport[]>({
    queryKey: ['reportes', guarderiaId, 'ingresos', params],
    queryFn: () => {
      const searchParams = new URLSearchParams();
      if (params.startDate) searchParams.append('startDate', params.startDate);
      if (params.endDate) searchParams.append('endDate', params.endDate);
      return httpClient.get(`/reportes/ingresos?${searchParams.toString()}`);
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};

export const useProximosVencimientos = () => {
  const guarderiaId = useActiveGuarderiaId();
  return useQuery<any[]>({
    queryKey: ['reportes', guarderiaId, 'vencimientos'],
    queryFn: () => httpClient.get('/reportes/vencimientos'),
  });
};

export const useOccupancyMetrics = () => {
  const guarderiaId = useActiveGuarderiaId();
  return useQuery({
    queryKey: ['dashboard', guarderiaId, 'gerencial', 'ocupacion'],
    queryFn: () => httpClient.get('/dashboard/gerencial/ocupacion'),
  });
};

export const useProfitabilityHistory = () => {
  const guarderiaId = useActiveGuarderiaId();
  return useQuery({
    queryKey: ['dashboard', guarderiaId, 'gerencial', 'rentabilidad'],
    queryFn: () => httpClient.get('/dashboard/gerencial/rentabilidad'),
  });
};

export const useDemandPeaks = () => {
  const guarderiaId = useActiveGuarderiaId();
  return useQuery({
    queryKey: ['dashboard', guarderiaId, 'gerencial', 'picos-demanda'],
    queryFn: () => httpClient.get('/dashboard/gerencial/picos-demanda'),
  });
};

export const useCollectionTime = () => {
  const guarderiaId = useActiveGuarderiaId();
  return useQuery({
    queryKey: ['dashboard', guarderiaId, 'gerencial', 'tiempo-cobro'],
    queryFn: () => httpClient.get('/dashboard/gerencial/tiempo-cobro'),
  });
};

export const useARPU = () => {
  const guarderiaId = useActiveGuarderiaId();
  return useQuery({
    queryKey: ['dashboard', guarderiaId, 'gerencial', 'arpu'],
    queryFn: () => httpClient.get('/dashboard/gerencial/arpu'),
  });
};

export const useVIPClients = () => {
  const guarderiaId = useActiveGuarderiaId();
  return useQuery({
    queryKey: ['dashboard', guarderiaId, 'gerencial', 'vip-clients'],
    queryFn: () => httpClient.get('/dashboard/gerencial/vip-clients'),
    staleTime: 1000 * 60 * 30, // 30 minutos
  });
};
