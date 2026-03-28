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
  actividadReclente: any[];
  graficos: {
    finanzas: { mes: string; monto: number }[];
  };
}

export const useDashboard = () => {
  return useQuery<DashboardSummary>({
    queryKey: ['dashboard', 'summary'],
    queryFn: () => fetchClient('dashboard/summary'),
  });
};
