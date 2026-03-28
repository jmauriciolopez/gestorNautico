import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchClient } from '../../../api/fetchClient';

export interface Cargo {
  id: number;
  descripcion: string;
  monto: number;
  fechaEmision: string;
  fechaVencimiento?: string;
  pagado: boolean;
  tipo: 'AMARRE' | 'MANTENIMIENTO' | 'SERVICIOS' | 'OTROS';
  cliente: {
    id: number;
    nombre: string;
  };
}

export interface Pago {
  id: number;
  monto: number;
  fecha: string;
  metodoPago: 'EFECTIVO' | 'TRANSFERENCIA' | 'TARJETA' | 'CHEQUE';
  comprobante?: string;
  cliente: {
    id: number;
    nombre: string;
  };
  cargo?: {
    id: number;
    descripcion: string;
  };
}

export interface CajaResumen {
  id: number;
  saldoInicial: number;
  totalRecaudado: number;
  totalEfectivo: number;
  fechaApertura: string;
}

export function useFinanzas() {
  const queryClient = useQueryClient();

  // --- CARGOS ---
  const getCargos = useQuery<Cargo[]>({
    queryKey: ['cargos'],
    queryFn: () => fetchClient('/cargos'),
  });

  const createCargo = useMutation({
    mutationFn: (data: Partial<Cargo> & { clienteId: number }) => 
      fetchClient('/cargos', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cargos'] });
    },
  });

  // --- PAGOS ---
  const getPagos = useQuery<Pago[]>({
    queryKey: ['pagos'],
    queryFn: () => fetchClient('/pagos'),
  });

  const createPago = useMutation({
    mutationFn: (data: Partial<Pago> & { clienteId: number; cargoId?: number; cajaId?: number }) => 
      fetchClient('/pagos', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pagos'] });
      queryClient.invalidateQueries({ queryKey: ['cargos'] });
      queryClient.invalidateQueries({ queryKey: ['caja-resumen'] });
    },
  });

  // --- CAJA ---
  const getCajaResumen = useQuery<CajaResumen>({
    queryKey: ['caja-resumen'],
    queryFn: () => fetchClient('/cajas/resumen'),
  });

  return {
    getCargos,
    createCargo,
    getPagos,
    createPago,
    getCajaResumen,
  };
}
