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
