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
  factura?: {
    id: number;
    numero: string;
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

export interface Caja {
  id: number;
  fechaApertura: string;
  fechaCierre?: string;
  saldoInicial: number;
  saldoFinal?: number;
  estado: 'ABIERTA' | 'CERRADA';
  pagos?: Pago[];
}

export function useCargos(clienteId?: number, soloSinFacturar: boolean = false) {
  return useQuery<Cargo[]>({
    queryKey: ['cargos', { clienteId, soloSinFacturar }],
    queryFn: () => {
      const params = new URLSearchParams();
      if (clienteId) params.append('clienteId', clienteId.toString());
      if (soloSinFacturar) params.append('soloSinFacturar', 'true');
      return fetchClient(`/cargos?${params.toString()}`);
    },
  });
}

export function useFinanzas() {
  const queryClient = useQueryClient();

  const getCargos = useCargos();

  const createCargo = useMutation({
    mutationFn: (data: Partial<Cargo> & { clienteId: number }) =>
      fetchClient('/cargos', {
        method: 'POST',
        body: data,
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
        body: data,
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

  const abrirCaja = useMutation({
    mutationFn: (saldoInicial: number) =>
      fetchClient('/cajas/abrir', {
        method: 'POST',
        body: { saldoInicial },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['caja-resumen'] });
      queryClient.invalidateQueries({ queryKey: ['cajas'] });
    },
  });

  const cerrarCaja = useMutation({
    mutationFn: ({ id, saldoFinal }: { id: number; saldoFinal: number }) =>
      fetchClient(`/cajas/${id}/cerrar`, {
        method: 'PATCH',
        body: { saldoFinal },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['caja-resumen'] });
      queryClient.invalidateQueries({ queryKey: ['cajas'] });
    },
  });

  const getCajas = useQuery<Caja[]>({
    queryKey: ['cajas'],
    queryFn: () => fetchClient('/cajas'),
  });

  return {
    getCargos,
    createCargo,
    getPagos,
    createPago,
    getCajaResumen,
    abrirCaja,
    cerrarCaja,
    getCajas,
  };
}
