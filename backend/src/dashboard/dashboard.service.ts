import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Cliente } from '../clientes/clientes.entity';
import { Embarcacion } from '../embarcaciones/embarcaciones.entity';
import { Movimiento } from '../movimientos/movimientos.entity';
import { Cargo } from '../cargos/cargo.entity';
import { Pago } from '../pagos/pago.entity';

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
  ) {}

  async getSummary() {
    const [totalClientes, totalBarcos] = await Promise.all([
      this.clienteRepo.count(),
      this.barcoRepo.count(),
    ]);

    // Ocupación
    const enCuna = await this.barcoRepo.count({ where: { estado: 'EN_CUNA' } });
    const enAgua = await this.barcoRepo.count({ where: { estado: 'EN_AGUA' } });

    // Finanzas
    const cargosPendientes = await this.cargoRepo.find({ where: { pagado: false } });
    const deudaTotal = cargosPendientes.reduce((acc, c) => acc + Number(c.monto), 0);

    const pagos = await this.pagoRepo.find();
    const recaudacionTotal = pagos.reduce((acc, p) => acc + Number(p.monto), 0);

    // Actividad Reciente
    const ultimosMovimientos = await this.movRepo.find({
      relations: ['embarcacion'],
      order: { fecha: 'DESC' },
      take: 5,
    });

    // Datos para Gráficos (Simulados/Agrupados por mes)
    // En una implementación real usaríamos QueryBuilder para agrupar por mes en la DB
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
      actividadReclente: ultimosMovimientos,
      graficos: {
        finanzas: seriesFinanzas,
      },
    };
  }

  private async getFinanzasSeries() {
    // Generar últimos 6 meses
    const series = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const start = new Date(d.getFullYear(), d.getMonth(), 1);
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 0);

      const pagosMes = await this.pagoRepo.find({
        where: { fecha: Between(start, end) },
      });
      
      const totalMes = pagosMes.reduce((acc, p) => acc + Number(p.monto), 0);
      
      series.push({
        mes: d.toLocaleString('default', { month: 'short' }),
        monto: totalMes,
      });
    }
    return series;
  }
}
