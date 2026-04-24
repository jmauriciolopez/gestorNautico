import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { Cliente } from '../clientes/clientes.entity';
import {
  Embarcacion,
  EstadoEmbarcacion,
} from '../embarcaciones/embarcaciones.entity';
import { Movimiento } from '../movimientos/movimientos.entity';
import { Cargo } from '../cargos/cargo.entity';
import { Pago } from '../pagos/pago.entity';
import { Zona } from '../zonas/zona.entity';
import { Espacio } from '../espacios/espacio.entity';
import { Rack } from '../racks/rack.entity';
import { TipoCargo } from '../cargos/cargo.entity';
import { NotificacionesService } from '../notificaciones/notificaciones.service';
import { BaseTenantService } from '../compartido/bases/base-tenant.service';
import { TenantContext } from '../compartido/interfaces/tenant-context.interface';

@Injectable()
export class DashboardService extends BaseTenantService {
  constructor(
    @InjectRepository(Cliente)
    private readonly clienteRepo: Repository<Cliente>,
    @InjectRepository(Embarcacion)
    private readonly barcoRepo: Repository<Embarcacion>,
    @InjectRepository(Movimiento)
    private readonly movRepo: Repository<Movimiento>,
    @InjectRepository(Cargo)
    private readonly cargoRepo: Repository<Cargo>,
    @InjectRepository(Pago)
    private readonly pagoRepo: Repository<Pago>,
    @InjectRepository(Zona)
    private readonly zonaRepo: Repository<Zona>,
    @InjectRepository(Espacio)
    private readonly espacioRepo: Repository<Espacio>,
    @InjectRepository(Rack)
    private readonly rackRepo: Repository<Rack>,
    private readonly notificacionesService: NotificacionesService,
  ) {
    super();
  }

  async getSummary(tenant: TenantContext) {
    const [totalClientes, totalBarcos] = await Promise.all([
      this.clienteRepo.count({ where: this.buildTenantWhere(tenant) }),
      this.barcoRepo.count({ where: this.buildTenantWhere(tenant) }),
    ]);

    // Ocupación
    const [enCuna, enAgua] = await Promise.all([
      this.barcoRepo.count({
        where: this.buildTenantWhere(tenant, {
          estado_operativo: EstadoEmbarcacion.EN_CUNA,
        }),
      }),
      this.barcoRepo.count({
        where: this.buildTenantWhere(tenant, {
          estado_operativo: EstadoEmbarcacion.EN_AGUA,
        }),
      }),
    ]);

    // Finanzas
    const [deudaRes, recaudacionRes] = await Promise.all([
      this.cargoRepo
        .createQueryBuilder('c')
        .select('SUM(c.monto)', 'total')
        .where('c.pagado = :pagado', { pagado: false })
        .andWhere('c.guarderiaId = :gId', { gId: tenant.guarderiaId })
        .getRawOne<{ total: string }>(),
      this.pagoRepo
        .createQueryBuilder('p')
        .select('SUM(p.monto)', 'total')
        .where('p.guarderiaId = :gId', { gId: tenant.guarderiaId })
        .getRawOne<{ total: string }>(),
    ]);

    const deudaTotal = Number(deudaRes?.total || 0);
    const recaudacionTotal = Number(recaudacionRes?.total || 0);

    // Actividad Reciente
    const [ultimosMovimientos, ultimasNotificaciones] = await Promise.all([
      this.movRepo.find({
        where: this.buildTenantWhere(tenant),
        relations: ['embarcacion'],
        order: { fecha: 'DESC' },
        take: 6,
      }),
      this.notificacionesService.findAllRecentGlobal(tenant, 6),
    ]);

    const [
      seriesFinanzas,
      recaudacionDetalle,
      deudaDetalle,
      embarcacionesLibres,
    ] = await Promise.all([
      this.getFinanzasSeries(tenant),
      this.getRecaudacionDetalleAll(tenant),
      this.getDeudaDetalleAll(tenant),
      this.barcoRepo.find({
        where: this.buildTenantWhere(tenant, {
          espacioId: null,
          estado_operativo: Not(EstadoEmbarcacion.INACTIVA),
        }),
        relations: ['cliente'],
      }),
    ]);

    return {
      stats: {
        totalClientes,
        totalBarcos,
        ocupacion: {
          enCuna,
          enAgua,
          total: totalBarcos,
        },
        finanzas: {
          recaudacionTotal,
          deudaTotal,
          detalles: {
            recaudacion: recaudacionDetalle,
            deuda: deudaDetalle,
          },
        },
      },
      embarcacionesLibres,
      actividadReciente: ultimosMovimientos,
      notificacionesRecientes: ultimasNotificaciones,
      graficos: {
        finanzas: seriesFinanzas,
      },
    };
  }

  private async getRecaudacionDetalleAll(tenant: TenantContext) {
    // 1 query: SUM agrupado por día/semana/mes usando DATE_TRUNC
    const now = new Date();
    const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - now.getDay(),
    );
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const raw = await this.pagoRepo
      .createQueryBuilder('p')
      .select([
        "CASE WHEN p.fecha >= :monthStart THEN 'mes' WHEN p.fecha >= :weekStart THEN 'semana' WHEN p.fecha >= :dayStart THEN 'dia' ELSE 'pasado' END as case",
        'SUM(p.monto) as sum',
      ])
      .where('p.fecha >= :monthStart', { monthStart })
      .andWhere('p.guarderiaId = :gId', { gId: tenant.guarderiaId })
      .setParameter('weekStart', weekStart)
      .setParameter('dayStart', dayStart)
      .groupBy('1')
      .getRawMany<{ case: string; sum: string }>();

    const byPeriodo = new Map(raw.map((r) => [r.case, Number(r.sum || 0)]));
    return {
      dia: byPeriodo.get('dia') ?? 0,
      semana: byPeriodo.get('semana') ?? 0,
      mes: byPeriodo.get('mes') ?? 0,
    };
  }

  private async getDeudaDetalleAll(tenant: TenantContext) {
    // 1 query: SUM + COUNT agrupado por bucket
    const now = new Date();
    const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - now.getDay(),
    );
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const vencidoEnd = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      now.getDate(),
    );

    const raw = await this.cargoRepo
      .createQueryBuilder('c')
      .select([
        "CASE WHEN c.fechaVencimiento < :vencidoEnd THEN 'vencido' WHEN c.fechaVencimiento >= :monthStart THEN 'mes' WHEN c.fechaVencimiento >= :weekStart THEN 'semana' WHEN c.fechaVencimiento >= :dayStart THEN 'dia' ELSE 'pasado' END as case",
        'SUM(c.monto) as sum',
        'COUNT(c.id) as count',
      ])
      .where('c.pagado = false')
      .andWhere('c.fechaVencimiento < :monthStart', { monthStart })
      .andWhere('c.guarderiaId = :gId', { gId: tenant.guarderiaId })
      .setParameter('weekStart', weekStart)
      .setParameter('dayStart', dayStart)
      .setParameter('vencidoEnd', vencidoEnd)
      .groupBy('1')
      .getRawMany<{ case: string; sum: string; count: string }>();

    const byPeriodo = new Map(
      raw.map((r) => [
        r.case,
        { total: Number(r.sum || 0), cantidad: Number(r.count || 0) },
      ]),
    );
    return {
      dia: byPeriodo.get('dia') ?? { total: 0, cantidad: 0 },
      semana: byPeriodo.get('semana') ?? { total: 0, cantidad: 0 },
      mes: byPeriodo.get('mes') ?? { total: 0, cantidad: 0 },
      vencido: byPeriodo.get('vencido') ?? { total: 0, cantidad: 0 },
    };
  }

  private async getFinanzasSeries(tenant: TenantContext) {
    // 1 sola query SQL para los últimos 6 meses
    const now = new Date();
    const startWindow = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    const raw = await this.pagoRepo
      .createQueryBuilder('p')
      .select([
        "TO_CHAR(p.fecha, 'YYYY-MM') as mes_key",
        "TO_CHAR(p.fecha, 'Mon') as mes_label",
        'SUM(p.monto) as sum',
      ])
      .where('p.fecha >= :start', { start: startWindow })
      .andWhere('p.guarderiaId = :gId', { gId: tenant.guarderiaId })
      .groupBy('mes_key, mes_label')
      .orderBy('mes_key', 'ASC')
      .getRawMany<{ mes_key: string; mes_label: string; sum: string }>();

    // Rellenar meses sin movimientos con 0
    const seriesMap = new Map(raw.map((r) => [r.mes_key, Number(r.sum || 0)]));
    const result: { mes: string; monto: number }[] = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      result.push({
        mes: d.toLocaleString('es-AR', { month: 'short' }),
        monto: seriesMap.get(key) ?? 0,
      });
    }

    return result;
  }

  async getRecaudacionPorPeriodo(
    tenant: TenantContext,
    periodo: 'dia' | 'semana' | 'mes',
  ) {
    const now = new Date();
    let start: Date;

    if (periodo === 'dia') {
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (periodo === 'semana') {
      const day = now.getDay(); // 0=dom
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - day);
    } else {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    const res = await this.pagoRepo
      .createQueryBuilder('p')
      .select('SUM(p.monto)', 'total')
      .where('p.fecha BETWEEN :start AND :end', { start, end: now })
      .andWhere('p.guarderiaId = :gId', { gId: tenant.guarderiaId })
      .getRawOne<{ total: string }>();

    return { total: Number(res?.total || 0), periodo };
  }

  async getDeudaPorPeriodo(
    tenant: TenantContext,
    periodo: 'dia' | 'semana' | 'mes' | 'vencido',
  ) {
    const now = new Date();
    let start: Date;
    let end: Date = now;

    if (periodo === 'dia') {
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (periodo === 'semana') {
      const day = now.getDay();
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - day);
    } else if (periodo === 'vencido') {
      // Vencidos hace más de 1 mes
      start = new Date(0); // desde siempre
      end = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    } else {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    const res = await this.cargoRepo
      .createQueryBuilder('c')
      .select('SUM(c.monto)', 'total')
      .addSelect('COUNT(c.id)', 'cantidad')
      .where('c.pagado = :pagado', { pagado: false })
      .andWhere('c.fechaVencimiento BETWEEN :start AND :end', { start, end })
      .andWhere('c.guarderiaId = :gId', { gId: tenant.guarderiaId })
      .getRawOne<{ total: string; cantidad: string }>();

    return {
      total: Number(res?.total || 0),
      periodo,
      cantidad: Number(res?.cantidad || 0),
    };
  }

  async getRackMap(tenant: TenantContext) {
    const zonas = await this.zonaRepo.find({
      where: this.buildTenantWhere(tenant),
      relations: [
        'ubicacion',
        'racks',
        'racks.espacios',
        'racks.espacios.embarcacion',
      ],
      order: {
        id: 'ASC',
        racks: {
          codigo: 'ASC',
          espacios: { piso: 'ASC', fila: 'ASC', columna: 'ASC' },
        },
      },
    });

    return zonas.map((zona) => ({
      ...zona,
      racks: zona.racks?.map((rack) => ({
        ...rack,
        espacios: rack.espacios?.map((espacio) => ({
          ...espacio,
          embarcacion: espacio.embarcacion
            ? {
                id: espacio.embarcacion.id,
                nombre: espacio.embarcacion.nombre,
                matricula: espacio.embarcacion.matricula,
                eslora: espacio.embarcacion.eslora,
                manga: espacio.embarcacion.manga,
                tipo: espacio.embarcacion.tipo,
                estado_operativo: espacio.embarcacion.estado_operativo,
              }
            : null,
        })),
      })),
    }));
  }

  async getOccupancyMetrics(tenant: TenantContext) {
    const [totalEspacios, ocupados] = await Promise.all([
      this.espacioRepo.count({ where: this.buildTenantWhere(tenant) }),
      this.espacioRepo.count({
        where: this.buildTenantWhere(tenant, { ocupado: true }),
      }),
    ]);

    const metrosOcupadosRes = await this.barcoRepo
      .createQueryBuilder('b')
      .select('SUM(b.eslora)', 'total')
      .where('b.espacioId IS NOT NULL')
      .andWhere('b.guarderiaId = :gId', { gId: tenant.guarderiaId })
      .getRawOne<{ total: string }>();

    const porZona = await this.zonaRepo.find({
      where: this.buildTenantWhere(tenant),
      relations: ['racks', 'racks.espacios'],
    });

    const ocupacionPorZona = porZona.map((zona) => {
      const espacios = zona.racks.flatMap((r) => r.espacios);
      const total = espacios.length;
      const ocupados = espacios.filter((e) => e.ocupado).length;
      return {
        zona: zona.nombre,
        total,
        ocupados,
        porcentaje: total > 0 ? (ocupados / total) * 100 : 0,
      };
    });

    return {
      global: {
        totalEspacios,
        ocupados,
        libres: totalEspacios - ocupados,
        porcentajeOcupacion:
          totalEspacios > 0 ? (ocupados / totalEspacios) * 100 : 0,
        metrosLinealesOcupados: Number(metrosOcupadosRes?.total || 0),
      },
      porZona: ocupacionPorZona,
    };
  }

  async getHistoricalProfitability(tenant: TenantContext, months: number = 12) {
    const now = new Date();
    const startDate = new Date(
      now.getFullYear(),
      now.getMonth() - (months - 1),
      1,
    );

    // Ingresos por categoría y mes
    const rawIngresos = await this.pagoRepo
      .createQueryBuilder('p')
      .leftJoin('p.cargo', 'c')
      .select([
        "TO_CHAR(p.fecha, 'YYYY-MM') as mes_key",
        'c.tipo as tipo',
        'SUM(p.monto) as total',
      ])
      .where('p.fecha >= :start', { start: startDate })
      .andWhere('p.guarderiaId = :gId', { gId: tenant.guarderiaId })
      .groupBy('mes_key, c.tipo')
      .orderBy('mes_key', 'ASC')
      .getRawMany<{ mes_key: string; tipo: TipoCargo; total: string }>();

    // Procesar datos para Recharts
    type MonthData = {
      name: string;
      total: number;
      [key: string]: string | number;
    };
    const dataByMonth = new Map<string, MonthData>();

    // Inicializar meses
    for (let i = months - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleString('es-AR', {
        month: 'short',
        year: '2-digit',
      });
      dataByMonth.set(key, { name: label, total: 0 });
    }

    rawIngresos.forEach((row) => {
      const monthData = dataByMonth.get(row.mes_key);
      if (monthData) {
        const tipo = row.tipo || 'OTROS';
        monthData[tipo] = Number(row.total || 0);
        monthData.total += Number(row.total || 0);
      }
    });

    return Array.from(dataByMonth.values());
  }

  async getDemandPeaks(tenant: TenantContext) {
    const raw = await this.movRepo
      .createQueryBuilder('m')
      .select([
        "TO_CHAR(m.fecha, 'ID') as dow", // 1-7
        'EXTRACT(HOUR FROM m.fecha) as hora',
        'COUNT(m.id) as cantidad',
      ])
      .where('m.guarderiaId = :gId', { gId: tenant.guarderiaId })
      .groupBy('dow, hora')
      .orderBy('dow', 'ASC')
      .addOrderBy('hora', 'ASC')
      .getRawMany<{ dow: string; hora: string; cantidad: string }>();

    return raw.map((r) => ({
      dia: Number(r.dow),
      hora: Number(r.hora),
      cantidad: Number(r.cantidad),
    }));
  }

  async getAverageCollectionTime(tenant: TenantContext) {
    const raw = await this.pagoRepo
      .createQueryBuilder('p')
      .leftJoin('p.cargo', 'c')
      .select(
        'AVG(EXTRACT(DAY FROM (p.fecha::timestamp - c."fechaEmision"::timestamp)))',
        'avg_days',
      )
      .where('c."fechaEmision" IS NOT NULL')
      .andWhere('p.guarderiaId = :gId', { gId: tenant.guarderiaId })
      .getRawOne<{ avg_days: string }>();

    return {
      promedioDias: Math.round(Number(raw?.avg_days || 0)),
    };
  }

  async getRevenuePerMeter(tenant: TenantContext) {
    const [revenueRes, esloraRes] = await Promise.all([
      this.pagoRepo
        .createQueryBuilder('p')
        .select('SUM(p.monto)', 'total')
        .where("p.fecha >= DATE_TRUNC('month', CURRENT_DATE)")
        .andWhere('p.guarderiaId = :gId', { gId: tenant.guarderiaId })
        .getRawOne<{ total: string }>(),
      this.barcoRepo
        .createQueryBuilder('b')
        .select('SUM(b.eslora)', 'total')
        .where('b.espacioId IS NOT NULL')
        .andWhere('b.guarderiaId = :gId', { gId: tenant.guarderiaId })
        .getRawOne<{ total: string }>(),
    ]);

    const revenue = Number(revenueRes?.total || 0);
    const eslora = Number(esloraRes?.total || 1); // Avoid division by zero

    return {
      revenueTotalMes: revenue,
      esloraTotalOcupada: eslora,
      arpu: Number((revenue / eslora).toFixed(2)),
    };
  }

  async getTopVIPClients(tenant: TenantContext) {
    const raw = await this.pagoRepo
      .createQueryBuilder('p')
      .leftJoin('p.cliente', 'cl')
      .select([
        'cl.id as id',
        'cl.nombre as nombre',
        'SUM(p.monto) as total_pagado',
        'COUNT(p.id) as cantidad_pagos',
      ])
      .where('p.guarderiaId = :gId', { gId: tenant.guarderiaId })
      .groupBy('cl.id, cl.nombre')
      .orderBy('total_pagado', 'DESC')
      .limit(10)
      .getRawMany<{
        id: string;
        nombre: string;
        total_pagado: string;
        cantidad_pagos: string;
      }>();

    return raw.map((r) => ({
      id: Number(r.id),
      nombre: r.nombre,
      total: Number(r.total_pagado),
      pagos: Number(r.cantidad_pagos),
    }));
  }
}
