import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { httpClient } from '../../../shared/api/HttpClient';
import { Paginated, selectData } from '../../../api/pagination';
import { useActiveGuarderiaId } from '../../../shared/hooks/useActiveGuarderiaId';

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
  totalRecaudado?: number;
  estado: 'ABIERTA' | 'CERRADA';
  pagos?: Pago[];
}

const CARGOS_PAGE_SIZE = 20;
const PAGOS_PAGE_SIZE = 20;

/** Paginated cargos hook — self-contained for components that manage their own pagination */
export function useCargosPaginados(
  page: number,
  limit = CARGOS_PAGE_SIZE,
  clienteId?: number,
  soloSinFacturar = false,
) {
  const queryClient = useQueryClient();
  const guarderiaId = useActiveGuarderiaId();

  const query = useQuery({
    queryKey: ['cargos', guarderiaId, page, limit, { clienteId, soloSinFacturar }],
    queryFn: (): Promise<Paginated<Cargo>> => {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      });
      if (clienteId) params.append('clienteId', String(clienteId));
      if (soloSinFacturar) params.append('soloSinFacturar', 'true');
      return httpClient.get<Paginated<Cargo>>(`/cargos?${params.toString()}`);
    },
    placeholderData: (prev) => prev,
    staleTime: 30_000,
  });

  const createCargo = useMutation({
    mutationFn: (data: Partial<Cargo> & { clienteId: number }) =>
      httpClient.post('/cargos', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cargos'] });
    },
  });

  const deleteCargo = useMutation({
    mutationFn: (id: number) => httpClient.delete(`/cargos/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cargos'] });
    },
  });

  return { query, createCargo, deleteCargo };
}

/** Paginated pagos hook — self-contained */
export function usePagosPaginados(page: number, limit = PAGOS_PAGE_SIZE) {
  const queryClient = useQueryClient();
  const guarderiaId = useActiveGuarderiaId();

  const query = useQuery({
    queryKey: ['pagos', guarderiaId, page, limit],
    queryFn: (): Promise<Paginated<Pago>> =>
      httpClient.get<Paginated<Pago>>(`/pagos?page=${page}&limit=${limit}`),
    placeholderData: (prev) => prev,
    staleTime: 30_000,
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

  return { query, createPago };
}

/** Keep backward-compat for useCargos (used in FacturaEditModal etc.) */
export function useCargos(clienteId?: number, soloSinFacturar: boolean = false) {
  const guarderiaId = useActiveGuarderiaId();
  return useQuery<Cargo[]>({
    queryKey: ['cargos', guarderiaId, { clienteId, soloSinFacturar }],
    queryFn: () => {
      const params = new URLSearchParams();
      if (clienteId) params.append('clienteId', clienteId.toString());
      if (soloSinFacturar) params.append('soloSinFacturar', 'true');
      params.append('limit', '200'); // explicit large limit for select pickers
      return httpClient.get<Paginated<Cargo>>(`/cargos?${params.toString()}`);
    },
    select: selectData,
  });
}

export function useFinanzas(options: { pageCajas?: number; limitCajas?: number } = {}) {
  const queryClient = useQueryClient();
  const guarderiaId = useActiveGuarderiaId();

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
    queryKey: ['caja-resumen', guarderiaId],
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
    queryKey: ['cajas', guarderiaId, options.pageCajas, options.limitCajas],
    queryFn: () => {
      const params = new URLSearchParams();
      if (options.pageCajas) params.append('page', String(options.pageCajas));
      if (options.limitCajas) params.append('limit', String(options.limitCajas));
      return httpClient.get<Paginated<Caja>>(`/cajas?${params.toString()}`).then(selectData);
    },
  });

  return { createPago, getCajaResumen, abrirCaja, cerrarCaja, getCajas };
}
