import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { httpClient } from '../../../shared/api/HttpClient';
import { Paginated, selectData } from '../../../api/pagination';

export interface Cargo {
  id: number;
  descripcion: string;
  monto: number;
  fechaEmision: string;
  fechaVencimiento?: string;
  pagado: boolean;
  tipo: 'AMARRE' | 'MANTENIMIENTO' | 'SERVICIOS' | 'OTROS';
  cliente: { id: number; nombre: string };
  factura?: { id: number; numero: string };
}

export interface Pago {
  id: number;
  monto: number;
  fecha: string;
  metodoPago: 'EFECTIVO' | 'TRANSFERENCIA' | 'TARJETA' | 'CHEQUE';
  comprobante?: string;
  cliente: { id: number; nombre: string };
  cargo?: { id: number; descripcion: string };
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
      return httpClient.get<Paginated<Cargo>>(`/cargos?${params.toString()}`);
    },
    select: selectData,
  });
}

export function useFinanzas() {
  const queryClient = useQueryClient();

  const getCargos = useCargos();

  const createCargo = useMutation({
    mutationFn: (data: Partial<Cargo> & { clienteId: number }) =>
      httpClient.post('/cargos', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cargos'] });
    },
  });

  const getPagos = useQuery<Pago[]>({
    queryKey: ['pagos'],
    queryFn: () => httpClient.get<Pago[]>('/pagos'),
  });

  const createPago = useMutation({
    mutationFn: (data: Partial<Pago> & { clienteId: number; cargoId?: number; cajaId?: number }) =>
      httpClient.post('/pagos', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pagos'] });
      queryClient.invalidateQueries({ queryKey: ['cargos'] });
      queryClient.invalidateQueries({ queryKey: ['caja-resumen'] });
      queryClient.invalidateQueries({ queryKey: ['cajas'] });
    },
  });

  const getCajaResumen = useQuery<CajaResumen>({
    queryKey: ['caja-resumen'],
    queryFn: () => httpClient.get<CajaResumen>('/cajas/resumen'),
  });

  const abrirCaja = useMutation({
    mutationFn: (saldoInicial: number) =>
      httpClient.post('/cajas/abrir', { saldoInicial }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['caja-resumen'] });
      queryClient.invalidateQueries({ queryKey: ['cajas'] });
    },
  });

  const cerrarCaja = useMutation({
    mutationFn: ({ id, saldoFinal }: { id: number; saldoFinal: number }) =>
      httpClient.patch(`/cajas/${id}/cerrar`, { saldoFinal }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['caja-resumen'] });
      queryClient.invalidateQueries({ queryKey: ['cajas'] });
    },
  });

  const getCajas = useQuery<Caja[]>({
    queryKey: ['cajas'],
    queryFn: () => httpClient.get<Paginated<Caja>>('/cajas'),
    select: selectData,
  });

  return { getCargos, createCargo, getPagos, createPago, getCajaResumen, abrirCaja, cerrarCaja, getCajas };
}
