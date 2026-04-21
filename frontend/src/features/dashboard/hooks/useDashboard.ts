import { useQuery } from '@tanstack/react-query';
import { httpClient } from '../../../shared/api/HttpClient';

export interface DashboardSummary {
  stats: {
    totalClientes: number;
    totalBarcos: number;
    ocupacion: {
      enCuna: number;
      enAgua: number;
      total: number;
    };
    finanzas: {
      recaudacionTotal: number;
      deudaTotal: number;
      detalles: {
        recaudacion: { dia: number; semana: number; mes: number };
        deuda: {
          dia: { total: number; cantidad: number };
          semana: { total: number; cantidad: number };
          mes: { total: number; cantidad: number };
          vencido: { total: number; cantidad: number };
        };
      };
    };
  };
  actividadReciente: any[];
  notificacionesRecientes: any[];
  embarcacionesLibres: any[];
  graficos: {
    finanzas: { mes: string; monto: number }[];
  };
}

export interface RackMap {
  id: number;
  nombre: string;
  ubicacion: { nombre: string };
  racks: {
    id: number;
    codigo: string;
    pisos: number;
    filas: number;
    columnas: number;
    alto: number;
    ancho: number;
    largo: number;
    espacios: {
      id: number;
      numero: string;
      ocupado: boolean;
      piso?: number;
      fila: number;
      columna: number;
      embarcacion?: {
        nombre: string;
        matricula: string;
        eslora: number;
        manga: number;
        tipo: string;
      };
    }[];
  }[];
}

export const useDashboard = () => {
  return useQuery<DashboardSummary>({
    queryKey: ['dashboard', 'summary'],
    queryFn: () => httpClient.get('/dashboard/summary'),
  });
};

export const useRackMap = () => {
  return useQuery<RackMap[]>({
    queryKey: ['dashboard', 'rack-map'],
    queryFn: () => httpClient.get('/dashboard/rack-map'),
  });
};

export type PeriodoRecaudacion = 'dia' | 'semana' | 'mes';
export type PeriodoDeuda = 'dia' | 'semana' | 'mes' | 'vencido';

export const useRecaudacion = (periodo: PeriodoRecaudacion) => {
  return useQuery<{ total: number; periodo: string }>({
    queryKey: ['dashboard', 'recaudacion', periodo],
    queryFn: () => httpClient.get(`/dashboard/recaudacion?periodo=${periodo}`),
  });
};

export const useDeuda = (periodo: PeriodoDeuda) => {
  return useQuery<{ total: number; periodo: string; cantidad: number }>({
    queryKey: ['dashboard', 'deuda', periodo],
    queryFn: () => httpClient.get(`/dashboard/deuda?periodo=${periodo}`),
  });
};
