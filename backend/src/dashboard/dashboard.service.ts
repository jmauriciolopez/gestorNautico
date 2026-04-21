import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsOrder } from 'typeorm';
import { Cliente } from '../clientes/clientes.entity';
import { Embarcacion } from '../embarcaciones/embarcaciones.entity';
import { Movimiento } from '../movimientos/movimientos.entity';
import { Cargo } from '../cargos/cargo.entity';
import { Pago } from '../pagos/pago.entity';
import { Zona } from '../zonas/zona.entity';
import { NotificacionesService } from '../notificaciones/notificaciones.service';

@Injectable()
export class DashboardService {
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
    private readonly notificacionesService: NotificacionesService,
  ) {}

  async getSummary() {
    const [totalClientes, totalBarcos] = await Promise.all([
      this.clienteRepo.count(),
      this.barcoRepo.count(),
    ]);

    // Ocupación
    const [enCuna, enAgua] = await Promise.all([
      this.barcoRepo.count({ where: { estado: 'EN_CUNA' } }),
      this.barcoRepo.count({ where: { estado: 'EN_AGUA' } }),
    ]);

    // Finanzas
    const [deudaRes, recaudacionRes] = await Promise.all([
      this.cargoRepo
        .createQueryBuilder('c')
        .select('SUM(c.monto)', 'total')
        .where('c.pagado = :pagado', { pagado: false })
        .getRawOne<{ total: string }>(),
      this.pagoRepo
        .createQueryBuilder('p')
        .select('SUM(p.monto)', 'total')
        .getRawOne<{ total: string }>(),
    ]);

    const deudaTotal = Number(deudaRes?.total || 0);
    const recaudacionTotal = Number(recaudacionRes?.total || 0);

    // Actividad Reciente
    const [ultimosMovimientos, ultimasNotificaciones] = await Promise.all([
      this.movRepo.find({
        relations: ['embarcacion'],
        order: { fecha: 'DESC' },
        take: 6,
      }),
      this.notificacionesService.findAllRecentGlobal(6),
    ]);

    const [
      seriesFinanzas,
      recaudacionDetalle,
      deudaDetalle,
      embarcacionesLibres,
    ] = await Promise.all([
      this.getFinanzasSeries(),
      this.getRecaudacionDetalleAll(),
      this.getDeudaDetalleAll(),
      this.barcoRepo.find({
        where: { espacioId: null, estado: 'ACTIVA' },
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

  private async getRecaudacionDetalleAll() {
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
        'CASE',
        "  WHEN p.fecha >= :monthStart THEN 'mes'",
        "  WHEN p.fecha >= :weekStart THEN 'semana'",
        "  WHEN p.fecha >= :dayStart THEN 'dia'",
        "  ELSE 'pasado'",
        'END',
        'SUM(p.monto)',
      ])
      .where('p.fecha >= :monthStart', { monthStart })
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

  private async getDeudaDetalleAll() {
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
        'CASE',
        "  WHEN c.fechaVencimiento < :vencidoEnd THEN 'vencido'",
        "  WHEN c.fechaVencimiento >= :monthStart THEN 'mes'",
        "  WHEN c.fechaVencimiento >= :weekStart THEN 'semana'",
        "  WHEN c.fechaVencimiento >= :dayStart THEN 'dia'",
        "  ELSE 'pasado'",
        'END',
        'SUM(c.monto)',
        'COUNT(c.id)',
      ])
      .where('c.pagado = false')
      .andWhere('c.fechaVencimiento < :monthStart', { monthStart })
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

  private async getFinanzasSeries() {
    // 1 sola query SQL para los últimos 6 meses
    const now = new Date();
    const startWindow = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    const raw = await this.pagoRepo
      .createQueryBuilder('p')
      .select([
        "TO_CHAR(p.fecha, 'YYYY-MM') as to_char",
        "TO_CHAR(p.fecha, 'Mon', 'es_AR') as to_char_1",
        'SUM(p.monto) as sum',
      ])
      .where('p.fecha >= :start', { start: startWindow })
      .groupBy("TO_CHAR(p.fecha, 'YYYY-MM')")
      .orderBy("TO_CHAR(p.fecha, 'YYYY-MM')", 'ASC')
      .getRawMany<{ to_char: string; to_char_1: string; sum: string }>();

    // Rellenar meses sin movimientos con 0
    const seriesMap = new Map(raw.map((r) => [r.to_char, Number(r.sum || 0)]));
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

  async getRecaudacionPorPeriodo(periodo: 'dia' | 'semana' | 'mes') {
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
      .getRawOne<{ total: string }>();

    return { total: Number(res?.total || 0), periodo };
  }

  async getDeudaPorPeriodo(periodo: 'dia' | 'semana' | 'mes' | 'vencido') {
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
      .getRawOne<{ total: string; cantidad: string }>();

    return {
      total: Number(res?.total || 0),
      periodo,
      cantidad: Number(res?.cantidad || 0),
    };
  }

  async getRackMap() {
    return this.zonaRepo.find({
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
          espacios: {
            piso: 'ASC',
            fila: 'ASC',
            columna: 'ASC',
          },
        },
      } as FindOptionsOrder<Zona>,
    });
  }
}
