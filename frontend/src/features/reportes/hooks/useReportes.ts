import { useQuery } from '@tanstack/react-query';
import { httpClient } from '../../../shared/api/HttpClient';

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

export const useClientesMorosos = () =>
  useQuery<ClienteMoroso[]>({
    queryKey: ['reportes', 'morosos'],
    queryFn: () => httpClient.get('/reportes/morosos'),
  });

export const useMensualidades = () =>
  useQuery<MensualidadDescuento[]>({
    queryKey: ['reportes', 'mensualidades'],
    queryFn: () => httpClient.get('/reportes/mensualidades'),
  });

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

export const useOcupacion = () =>
  useQuery<OcupacionReport>({
    queryKey: ['reportes', 'ocupacion'],
    queryFn: () => httpClient.get('/reportes/ocupacion'),
  });

export interface IngresoReport {
  mes: string;
  total: number;
}

export const useIngresos = () =>
  useQuery<IngresoReport[]>({
    queryKey: ['reportes', 'ingresos'],
    queryFn: () => httpClient.get('/reportes/ingresos'),
  });

export const useProximosVencimientos = () =>
  useQuery<any[]>({
    queryKey: ['reportes', 'vencimientos'],
    queryFn: () => httpClient.get('/reportes/vencimientos'),
  });

export const useOccupancyMetrics = () =>
  useQuery({
    queryKey: ['dashboard', 'gerencial', 'ocupacion'],
    queryFn: () => httpClient.get('/dashboard/gerencial/ocupacion'),
  });

export const useProfitabilityHistory = () =>
  useQuery({
    queryKey: ['dashboard', 'gerencial', 'rentabilidad'],
    queryFn: () => httpClient.get('/dashboard/gerencial/rentabilidad'),
  });

export const useDemandPeaks = () =>
  useQuery({
    queryKey: ['dashboard', 'gerencial', 'picos-demanda'],
    queryFn: () => httpClient.get('/dashboard/gerencial/picos-demanda'),
  });

export const useCollectionTime = () =>
  useQuery({
    queryKey: ['dashboard', 'gerencial', 'tiempo-cobro'],
    queryFn: () => httpClient.get('/dashboard/gerencial/tiempo-cobro'),
  });

export const useARPU = () =>
  useQuery({
    queryKey: ['dashboard', 'gerencial', 'arpu'],
    queryFn: () => httpClient.get('/dashboard/gerencial/arpu'),
  });

export const useVIPClients = () =>
  useQuery({
    queryKey: ['dashboard', 'gerencial', 'vip-clients'],
    queryFn: () => httpClient.get('/dashboard/gerencial/vip-clients'),
  });
