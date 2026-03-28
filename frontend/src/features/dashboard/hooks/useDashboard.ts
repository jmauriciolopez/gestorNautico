import { useQuery } from '@tanstack/react-query';
import { fetchClient } from '../../../api/fetchClient';

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
    };
  };
  actividadReciente: any[];
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
    queryFn: () => fetchClient('dashboard/summary'),
  });
};

export const useRackMap = () => {
  return useQuery<RackMap[]>({
    queryKey: ['dashboard', 'rack-map'],
    queryFn: () => fetchClient('dashboard/rack-map'),
  });
};
