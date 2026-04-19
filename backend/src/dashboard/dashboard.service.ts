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
    const cargosPendientes = await this.cargoRepo.find({
      where: { pagado: false },
    });
    const deudaTotal = cargosPendientes.reduce(
      (acc, c) => acc + Number(c.monto || 0),
      0,
    );

    const pagos = await this.pagoRepo.find();
    const recaudacionTotal = pagos.reduce(
      (acc, p) => acc + Number(p.monto || 0),
      0,
    );

    // Actividad Reciente
    const [ultimosMovimientos, ultimasNotificaciones] = await Promise.all([
      this.movRepo.find({
        relations: ['embarcacion'],
        order: { fecha: 'DESC' },
        take: 6,
      }),
      this.notificacionesService.findAllRecentGlobal(6),
    ]);

    const seriesFinanzas = await this.getFinanzasSeries();

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
        },
      },
      actividadReciente: ultimosMovimientos,
      notificacionesRecientes: ultimasNotificaciones,
      graficos: {
        finanzas: seriesFinanzas,
      },
    };
  }

  private async getFinanzasSeries() {
    // Generar últimos 6 meses
    const series: Array<{ mes: string; monto: number }> = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const start = new Date(d.getFullYear(), d.getMonth(), 1);
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 0);

      const pagosMes = await this.pagoRepo.find({
        where: { fecha: Between(start, end) },
      });

      const totalMes = pagosMes.reduce(
        (acc, p) => acc + Number(p.monto || 0),
        0,
      );

      series.push({
        mes: d.toLocaleString('default', { month: 'short' }),
        monto: totalMes,
      });
    }
    return series;
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

    const pagos = await this.pagoRepo.find({
      where: { fecha: Between(start, now) },
    });

    const total = pagos.reduce((acc, p) => acc + Number(p.monto || 0), 0);
    return { total, periodo };
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

    const cargos = await this.cargoRepo.find({
      where: { pagado: false, fechaVencimiento: Between(start, end) },
    });

    const total = cargos.reduce((acc, c) => acc + Number(c.monto || 0), 0);
    return { total, periodo, cantidad: cargos.length };
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
