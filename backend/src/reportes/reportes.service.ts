import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Cargo } from '../cargos/cargo.entity';
import {
  Embarcacion,
  EstadoEmbarcacion,
} from '../embarcaciones/embarcaciones.entity';
import { Espacio } from '../espacios/espacio.entity';
import { Pago } from '../pagos/pago.entity';
import { BaseTenantService } from '../compartido/bases/base-tenant.service';
import { TenantContext } from '../compartido/interfaces/tenant-context.interface';

@Injectable()
export class ReportesService extends BaseTenantService {
  constructor(
    @InjectRepository(Cargo)
    private readonly cargoRepo: Repository<Cargo>,
    @InjectRepository(Embarcacion)
    private readonly embarcacionRepo: Repository<Embarcacion>,
    @InjectRepository(Espacio)
    private readonly espacioRepo: Repository<Espacio>,
    @InjectRepository(Pago)
    private readonly pagoRepo: Repository<Pago>,
  ) {
    super();
  }

  async getClientesMorosos(tenant: TenantContext): Promise<any[]> {
    const hoy = new Date();

    const cargosVencidos = await this.cargoRepo.find({
      where: this.buildTenantWhere(tenant, { pagado: false, fechaVencimiento: LessThan(hoy) }),
      relations: ['cliente'],
      order: { fechaVencimiento: 'ASC' },
    });

    // Agrupar por cliente
    const map = new Map<
      number,
      {
        clienteId: number;
        nombre: string;
        email: string;
        telefono: string;
        totalDeuda: number;
        cantidadCargos: number;
        diasMaxAtraso: number;
        fechaVencimientoMasAntigua: Date;
      }
    >();

    for (const cargo of cargosVencidos) {
      const dias = Math.floor(
        (hoy.getTime() - new Date(cargo.fechaVencimiento).getTime()) / 86400000,
      );
      const existing = map.get(cargo.cliente.id);
      if (existing) {
        existing.totalDeuda += Number(cargo.monto);
        existing.cantidadCargos += 1;
        if (dias > existing.diasMaxAtraso) existing.diasMaxAtraso = dias;
        if (
          new Date(cargo.fechaVencimiento) < existing.fechaVencimientoMasAntigua
        ) {
          existing.fechaVencimientoMasAntigua = new Date(
            cargo.fechaVencimiento,
          );
        }
      } else {
        map.set(cargo.cliente.id, {
          clienteId: cargo.cliente.id,
          nombre: cargo.cliente.nombre,
          email: cargo.cliente.email,
          telefono: cargo.cliente.telefono,
          totalDeuda: Number(cargo.monto),
          cantidadCargos: 1,
          diasMaxAtraso: dias,
          fechaVencimientoMasAntigua: new Date(cargo.fechaVencimiento),
        });
      }
    }

    return Array.from(map.values()).sort(
      (a, b) => b.diasMaxAtraso - a.diasMaxAtraso,
    );
  }

  async getMensualidadesConDescuentos(tenant: TenantContext): Promise<any[]> {
    const embarcaciones = await this.embarcacionRepo.find({
      where: this.buildTenantWhere(tenant, { estado_operativo: EstadoEmbarcacion.EN_CUNA }),
      relations: ['cliente', 'espacio', 'espacio.rack'],
    });

    return embarcaciones
      .filter((e) => e.cliente && e.espacio?.rack)
      .map((e) => {
        const tarifaBase = Number(e.espacio.rack.tarifaBase);
        const descCliente = Number(e.cliente.descuento ?? 0);
        const descEmbarcacion = Number(e.descuento ?? 0);
        const montoDescCliente = tarifaBase * (descCliente / 100);
        const basePostCliente = tarifaBase - montoDescCliente;
        const montoDescEmbarcacion = basePostCliente * (descEmbarcacion / 100);
        const totalFinal = basePostCliente - montoDescEmbarcacion;

        return {
          clienteId: e.cliente.id,
          clienteNombre: e.cliente.nombre,
          descuentoCliente: descCliente,
          embarcacionId: e.id,
          embarcacionNombre: e.nombre,
          matricula: e.matricula,
          descuentoEmbarcacion: descEmbarcacion,
          rack: e.espacio.rack.codigo,
          espacio: e.espacio.numero,
          tarifaBase,
          montoDescCliente: +montoDescCliente.toFixed(2),
          montoDescEmbarcacion: +montoDescEmbarcacion.toFixed(2),
          totalFinal: +totalFinal.toFixed(2),
        };
      })
      .sort((a, b) => a.clienteNombre.localeCompare(b.clienteNombre));
  }

  async getOcupacion(tenant: TenantContext): Promise<any> {
    const espacios = await this.espacioRepo.find({
      where: this.buildTenantWhere(tenant),
      relations: ['rack', 'rack.zona'],
    });

    const total = espacios.length;
    const ocupados = espacios.filter((e) => e.ocupado).length;
    const libres = total - ocupados;

    const zonasMap = new Map<string, { total: number; ocupados: number }>();
    espacios.forEach((e) => {
      const zona = e.rack?.zona?.nombre || 'Sin Zona';
      const current = zonasMap.get(zona) || { total: 0, ocupados: 0 };
      current.total++;
      if (e.ocupado) current.ocupados++;
      zonasMap.set(zona, current);
    });

    return {
      total,
      ocupados,
      libres,
      porcentajeOcupacion: total > 0 ? (ocupados / total) * 100 : 0,
      porZona: Array.from(zonasMap.entries()).map(([nombre, stats]) => ({
        nombre,
        ...stats,
        porcentaje: (stats.ocupados / stats.total) * 100,
      })),
    };
  }

  async getIngresosMensuales(
    tenant: TenantContext,
    startDate?: string,
    endDate?: string,
  ): Promise<{ mes: string; total: number }[]> {
    const query = this.pagoRepo
      .createQueryBuilder('p')
      .select("TO_CHAR(p.fecha, 'YYYY-MM')", 'mes')
      .addSelect('SUM(p.monto)', 'total');

    this.applyTenantFilter(query, tenant, 'p');

    if (startDate) {
      query.andWhere('p.fecha >= :startDate', { startDate });
    } else {
      const unAnioAtras = new Date();
      unAnioAtras.setFullYear(unAnioAtras.getFullYear() - 1);
      query.andWhere('p.fecha >= :unAnioAtras', { unAnioAtras });
    }

    if (endDate) {
      query.andWhere('p.fecha <= :endDate', { endDate });
    }

    const rawPagos = await query
      .groupBy('mes')
      .orderBy('mes', 'ASC')
      .getRawMany();

    return rawPagos.map((p: { mes: string; total: string | number }) => ({
      mes: p.mes,
      total: Number(p.total),
    }));
  }

  async getProximosVencimientos(tenant: TenantContext): Promise<Cargo[]> {
    const hoy = new Date();
    const proximaSemana = new Date();
    proximaSemana.setDate(hoy.getDate() + 30);

    const qb = this.cargoRepo
      .createQueryBuilder('c')
      .leftJoinAndSelect('c.cliente', 'cliente')
      .where('c.pagado = false');

    this.applyTenantFilter(qb, tenant, 'c');

    return qb
      .andWhere('c.fechaVencimiento >= :hoy', { hoy })
      .andWhere('c.fechaVencimiento <= :proximaSemana', { proximaSemana })
      .orderBy('c.fechaVencimiento', 'ASC')
      .getMany();
  }
}
