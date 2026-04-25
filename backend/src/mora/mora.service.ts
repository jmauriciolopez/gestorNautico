import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, In } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Factura, EstadoFactura } from '../facturas/factura.entity';
import { ConfiguracionService } from '../configuracion/configuracion.service';
import { NotificacionesService } from '../notificaciones/notificaciones.service';
import { Role } from '../users/user.entity';
import { NotificacionTipo } from '../notificaciones/notificacion.entity';
import { Guarderia } from '../guarderias/guarderia.entity';
import { BaseTenantService } from '../compartido/bases/base-tenant.service';
import { TenantContext } from '../compartido/interfaces/tenant-context.interface';

export interface MoraResultado {
  diasAtraso: number;
  interesMoratorio: number;
  recargo: number;
  totalMora: number;
  totalAPagar: number;
}

@Injectable()
export class MoraService extends BaseTenantService {
  private readonly logger = new Logger(MoraService.name);

  constructor(
    @InjectRepository(Factura)
    private readonly facturaRepo: Repository<Factura>,
    @InjectRepository(Guarderia)
    private readonly guarderiaRepo: Repository<Guarderia>,
    private readonly configService: ConfiguracionService,
    private readonly notificacionesService: NotificacionesService,
  ) {
    super();
  }

  async getConfiguracion(tenant: TenantContext) {
    const tasaInteres = await this.configService.getValorNumerico(
      tenant,
      'MORA_TASA_INTERES',
      3,
    );
    const tasaRecargo = await this.configService.getValorNumerico(
      tenant,
      'MORA_TASA_RECARGO',
      10,
    );
    const diasGracia = await this.configService.getValorNumerico(
      tenant,
      'MORA_DIAS_GRACIA',
      5,
    );

    return {
      tasaInteres,
      tasaRecargo,
      diasGracia,
    };
  }

  async calcularMora(tenant: TenantContext, facturaId: number): Promise<MoraResultado> {
    const factura = await this.facturaRepo.findOne({
      where: this.buildTenantWhere(tenant, { id: facturaId }),
      relations: ['cliente'],
    });

    if (!factura) {
      throw new Error('Factura no encontrada');
    }

    if (factura.estado !== EstadoFactura.PENDIENTE) {
      return {
        diasAtraso: 0,
        interesMoratorio: 0,
        recargo: 0,
        totalMora: 0,
        totalAPagar: Number(factura.total),
      };
    }

    const { tasaInteres, tasaRecargo, diasGracia } =
      await this.getConfiguracion(tenant);

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const fechaVencimiento = new Date(factura.fechaVencimiento);
    fechaVencimiento.setHours(0, 0, 0, 0);

    const diffTime = hoy.getTime() - fechaVencimiento.getTime();
    let diasAtraso = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diasAtraso < 0) {
      diasAtraso = 0;
    }

    const diasConInteres = Math.max(0, diasAtraso - diasGracia);

    const montoBase = Number(factura.total);

    const interesMoratorio =
      diasConInteres > 0
        ? montoBase * (tasaInteres / 100 / 30) * diasConInteres
        : 0;

    const recargo =
      diasAtraso > diasGracia ? montoBase * (tasaRecargo / 100) : 0;

    const totalMora = Number((interesMoratorio + recargo).toFixed(2));
    const totalAPagar = Number((montoBase + totalMora).toFixed(2));

    return {
      diasAtraso,
      interesMoratorio: Number(interesMoratorio.toFixed(2)),
      recargo: Number(recargo.toFixed(2)),
      totalMora,
      totalAPagar,
    };
  }

  async aplicarMora(tenant: TenantContext, facturaId: number): Promise<Factura> {
    const factura = await this.facturaRepo.findOne({
      where: this.buildTenantWhere(tenant, { id: facturaId }),
      relations: ['cliente'],
    });

    if (!factura) {
      throw new Error('Factura no encontrada');
    }

    if (factura.estado !== EstadoFactura.PENDIENTE) {
      throw new Error('Solo se puede aplicar mora a facturas pendientes');
    }

    const { tasaInteres, tasaRecargo, diasGracia } =
      await this.getConfiguracion(tenant);

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const fechaVencimiento = new Date(factura.fechaVencimiento);
    fechaVencimiento.setHours(0, 0, 0, 0);

    const diffTime = hoy.getTime() - fechaVencimiento.getTime();
    let diasAtraso = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diasAtraso < 0) {
      diasAtraso = 0;
    }

    const diasConInteres = Math.max(0, diasAtraso - diasGracia);

    const montoBase = Number(factura.total);

    const interesMoratorio =
      diasConInteres > 0
        ? montoBase * (tasaInteres / 100 / 30) * diasConInteres
        : 0;

    const recargo =
      diasAtraso > diasGracia ? montoBase * (tasaRecargo / 100) : 0;

    const totalMora = Number((interesMoratorio + recargo).toFixed(2));

    if (totalMora <= 0) {
      this.logger.log(
        `Factura ${factura.numero} no tiene mora aplicable (días: ${diasAtraso})`,
      );
      return factura;
    }

    await this.facturaRepo.update(facturaId, {
      interesMoratorio: Number(interesMoratorio.toFixed(2)),
      recargo: Number(recargo.toFixed(2)),
      fechaAplicacionMora: new Date(),
    });

    this.logger.log(
      `Mora aplicada a factura ${factura.numero}: Interés ${interesMoratorio.toFixed(2)}, Recargo ${recargo.toFixed(2)}`,
    );

    await this.notificacionesService.createForRole(tenant, Role.ADMIN, {
      titulo: 'Mora Aplicada',
      mensaje: `Se aplicó mora de ${totalMora} a la factura ${factura.numero} del cliente ${factura.cliente.nombre}.`,
      tipo: NotificacionTipo.ALERTA,
    });

    return this.facturaRepo.findOne({
      where: this.buildTenantWhere(tenant, { id: facturaId }),
      relations: ['cliente', 'cargos'],
    });
  }

  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async aplicarMoraAutomaticamente(): Promise<number> {
    this.logger.log('Iniciando aplicación automática de mora para todos los tenants...');
    const guarderias = await this.guarderiaRepo.find();
    let totalAplicadas = 0;

    for (const g of guarderias) {
        const tenant: TenantContext = { 
          guarderiaId: g.id, 
          scope: 'guarderia',
          role: Role.SUPERADMIN, // System context
          userId: 0
        };
        totalAplicadas += await this.aplicarMoraPorTenant(tenant);
    }

    return totalAplicadas;
  }

  private async aplicarMoraPorTenant(tenant: TenantContext): Promise<number> {
    const facturasVencidas = await this.facturaRepo.find({
      where: this.buildTenantWhere(tenant, {
        estado: EstadoFactura.PENDIENTE,
      }),
      relations: ['cliente'],
    });

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const { tasaInteres, tasaRecargo, diasGracia } =
      await this.getConfiguracion(tenant);

    let aplicadas = 0;

    for (const factura of facturasVencidas) {
      if (!factura.fechaVencimiento) continue;

      const fechaVencimiento = new Date(factura.fechaVencimiento);
      fechaVencimiento.setHours(0, 0, 0, 0);

      const diffTime = hoy.getTime() - fechaVencimiento.getTime();
      const diasAtraso = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diasAtraso <= diasGracia) continue;

      if (factura.fechaAplicacionMora) {
        const ultimaAplicacion = new Date(factura.fechaAplicacionMora);
        ultimaAplicacion.setHours(0, 0, 0, 0);
        if (ultimaAplicacion.getTime() >= hoy.getTime()) continue;
      }

      const montoBase = Number(factura.total);
      const interesMoratorio =
        montoBase * (tasaInteres / 100 / 30) * (diasAtraso - diasGracia);
      const recargo = montoBase * (tasaRecargo / 100);

      const interesAcumulado = Number(factura.interesMoratorio || 0);
      const recargoAcumulado = Number(factura.recargo || 0);

      await this.facturaRepo.update(factura.id, {
        interesMoratorio: Number(
          (interesAcumulado + interesMoratorio).toFixed(2),
        ),
        recargo: Math.max(recargoAcumulado, Number(recargo.toFixed(2))),
        fechaAplicacionMora: new Date(),
      });

      aplicadas++;
      this.logger.log(
        `[Tenant ${tenant.guarderiaId}] Mora actualizada en factura ${factura.numero}: +${interesMoratorio.toFixed(2)} interés`,
      );
    }
    return aplicadas;
  }

  async getFacturasConMora(tenant: TenantContext) {
    return this.facturaRepo.find({
      where: [
        this.buildTenantWhere(tenant, { estado: EstadoFactura.PENDIENTE, interesMoratorio: Not(0) }),
        this.buildTenantWhere(tenant, { estado: EstadoFactura.PENDIENTE, recargo: Not(0) }),
      ],
      relations: ['cliente'],
      order: { fechaVencimiento: 'ASC' },
    });
  }

  async getFacturasVencidasSinMora(tenant: TenantContext) {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const qb = this.facturaRepo
      .createQueryBuilder('f')
      .leftJoin('f.cliente', 'c')
      .where('f.estado = :estado', { estado: EstadoFactura.PENDIENTE })
      .andWhere('f.fechaVencimiento < :hoy', { hoy })
      .andWhere('(f.interesMoratorio = 0 OR f.interesMoratorio IS NULL)')
      .andWhere('(f.recargo = 0 OR f.recargo IS NULL)');

    this.applyTenantFilter(qb, tenant, 'f');

    return qb
      .select(['f.id', 'f.numero', 'f.total', 'f.fechaVencimiento', 'c.nombre'])
      .getMany();
  }
}
