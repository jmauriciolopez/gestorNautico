import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
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
        .getRawOne(),
      this.pagoRepo
        .createQueryBuilder('p')
        .select('SUM(p.monto)', 'total')
        .getRawOne(),
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
    const [dia, semana, mes] = await Promise.all([
      this.getRecaudacionPorPeriodo('dia'),
      this.getRecaudacionPorPeriodo('semana'),
      this.getRecaudacionPorPeriodo('mes'),
    ]);
    return { dia: dia.total, semana: semana.total, mes: mes.total };
  }

  private async getDeudaDetalleAll() {
    const [dia, semana, mes, vencido] = await Promise.all([
      this.getDeudaPorPeriodo('dia'),
      this.getDeudaPorPeriodo('semana'),
      this.getDeudaPorPeriodo('mes'),
      this.getDeudaPorPeriodo('vencido'),
    ]);
    return {
      dia: { total: dia.total, cantidad: dia.cantidad },
      semana: { total: semana.total, cantidad: semana.cantidad },
      mes: { total: mes.total, cantidad: mes.cantidad },
      vencido: { total: vencido.total, cantidad: vencido.cantidad },
    };
  }

  private async getFinanzasSeries() {
    // Generar últimos 6 meses
    const now = new Date();
    const promises = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const start = new Date(d.getFullYear(), d.getMonth(), 1);
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);

      promises.push(
        this.pagoRepo
          .createQueryBuilder('p')
          .select('SUM(p.monto)', 'total')
          .where('p.fecha BETWEEN :start AND :end', { start, end })
          .getRawOne()
          .then(res => ({
            mes: d.toLocaleString('es-AR', { month: 'short' }),
            monto: Number(res?.total || 0)
          }))
      );
    }
    
    return Promise.all(promises);
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
      .getRawOne();

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
      .getRawOne();

    return { 
      total: Number(res?.total || 0), 
      periodo, 
      cantidad: Number(res?.cantidad || 0) 
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
      } as any, // TypeORM nested order typing can be complex; maintaining 'as any' for now to ensure query correctness while keeping structure
    });
  }
}
