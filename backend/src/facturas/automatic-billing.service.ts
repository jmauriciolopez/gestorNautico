import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, Between, Like } from 'typeorm';
import { Factura, EstadoFactura } from './factura.entity';
import { FacturasService } from './facturas.service';
import { Cargo, TipoCargo } from '../cargos/cargo.entity';
import { Cliente } from '../clientes/clientes.entity';
import { Embarcacion } from '../embarcaciones/embarcaciones.entity';
import { Rack } from '../racks/rack.entity';
import { NotificacionesService } from '../notificaciones/notificaciones.service';
import { NotificacionTipo } from '../notificaciones/notificacion.entity';
import { Role } from '../users/user.entity';
import { ConfiguracionService } from '../configuracion/configuracion.service';

@Injectable()
export class AutomaticBillingService {
  private readonly logger = new Logger(AutomaticBillingService.name);

  constructor(
    @InjectRepository(Factura)
    private readonly facturaRepo: Repository<Factura>,
    @InjectRepository(Cargo)
    private readonly cargoRepo: Repository<Cargo>,
    @InjectRepository(Cliente)
    private readonly clienteRepo: Repository<Cliente>,
    @InjectRepository(Embarcacion)
    private readonly embarcacionRepo: Repository<Embarcacion>,
    @InjectRepository(Rack)
    private readonly rackRepo: Repository<Rack>,
    private readonly facturasService: FacturasService,
    private readonly notificacionesService: NotificacionesService,
    private readonly configuracionService: ConfiguracionService,
  ) {}

  /**
   * Tarea programada: Genera cargos de amarre para clientes según su día de facturación (1-31)
   * Se ejecuta cada día a las 00:00
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async generateMonthlyMooringFees() {
    this.logger.log('Iniciando generación automática de cargos de amarre...');
    const today = new Date();
    const todayDay = today.getDate();

    const diasVencimiento = await this.configuracionService.getValorNumerico(
      'DIAS_VENCIMIENTO',
      15,
    );
    const fechaVencimiento = new Date(today);
    fechaVencimiento.setDate(fechaVencimiento.getDate() + diasVencimiento);

    // 1. Buscar clientes que facturan hoy
    const clientesAFacturar = await this.clienteRepo.find({
      where: { diaFacturacion: todayDay, activo: true },
    });

    this.logger.log(
      `Procesando facturación para ${clientesAFacturar.length} clientes.`,
    );

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(
      today.getFullYear(),
      today.getMonth() + 1,
      0,
      23,
      59,
      59,
    );

    for (const cliente of clientesAFacturar) {
      this.logger.log(`Procesando Cliente: ${cliente.nombre}`);
      const cargoIds: number[] = [];

      // A. Procesar Embarcaciones en Racks
      const embarcaciones = await this.embarcacionRepo.find({
        where: { cliente: { id: cliente.id } },
        relations: ['espacio', 'espacio.rack'],
      });

      for (const barco of embarcaciones) {
        if (barco.espacio && barco.espacio.rack) {
          // VALIDACIÓN: Verificar si ya existe un cargo de amarre para este barco en el mes actual
          const cargoExistente = await this.cargoRepo.findOne({
            where: {
              cliente: { id: cliente.id },
              tipo: TipoCargo.AMARRE,
              descripcion: Like(`%${barco.matricula}%`),
              fechaEmision: Between(startOfMonth, endOfMonth),
            },
          });

          if (cargoExistente) {
            this.logger.warn(
              `Omisión: El amarre para ${barco.nombre} (${barco.matricula}) ya fue facturado este mes (Cargo ID: ${cargoExistente.id}).`,
            );
            continue;
          }

          const rack = barco.espacio.rack;
          const tarifaBase = Number(rack.tarifaBase || 0);

          if (tarifaBase > 0) {
            // Aplicar descuentos
            const descCliente = Number(cliente.descuento || 0);
            const descBarco = Number(barco.descuento || 0);
            const subtotal =
              tarifaBase * (1 - descCliente / 100) * (1 - descBarco / 100);

            const nuevoCargo = this.cargoRepo.create({
              descripcion: `Amarre Mensual - ${barco.nombre} (${barco.matricula})`,
              monto: subtotal,
              tipo: TipoCargo.AMARRE,
              cliente: { id: cliente.id },
              pagado: false,
              fechaEmision: new Date(),
              fechaVencimiento,
            });
            const guardado = await this.cargoRepo.save(nuevoCargo);
            cargoIds.push(guardado.id);
          }
        }
      }

      // B. Procesar Cuota (Individual/Familiar)
      if (cliente.tipoCuota === 'INDIVIDUAL') {
        // VALIDACIÓN: Verificar existencia de cuota individual este mes
        const cuotaExistente = await this.cargoRepo.findOne({
          where: {
            cliente: { id: cliente.id },
            tipo: TipoCargo.SERVICIOS,
            descripcion: Like('%Individual%'),
            fechaEmision: Between(startOfMonth, endOfMonth),
          },
        });

        if (cuotaExistente) {
          this.logger.warn(
            `Omisión: Cuota Individual ya facturada para ${cliente.nombre}.`,
          );
        } else {
          const montoIndividual =
            await this.configuracionService.getValorNumerico(
              'CUOTA_INDIVIDUAL',
              50,
            );
          const cargoCuota = this.cargoRepo.create({
            descripcion: 'Cuota de Socio Individual',
            monto: montoIndividual,
            tipo: TipoCargo.SERVICIOS,
            cliente: { id: cliente.id },
            pagado: false,
            fechaEmision: new Date(),
            fechaVencimiento,
          });
          const guardado = await this.cargoRepo.save(cargoCuota);
          cargoIds.push(guardado.id);
        }
      } else if (
        cliente.tipoCuota === 'FAMILIAR' &&
        cliente.id === cliente.responsableFamiliaId
      ) {
        // VALIDACIÓN: Verificar existencia de cuota familiar este mes
        const cuotaExistente = await this.cargoRepo.findOne({
          where: {
            cliente: { id: cliente.id },
            tipo: TipoCargo.SERVICIOS,
            descripcion: Like('%Familiar%'),
            fechaEmision: Between(startOfMonth, endOfMonth),
          },
        });

        if (cuotaExistente) {
          this.logger.warn(
            `Omisión: Cuota Familiar ya facturada para ${cliente.nombre}.`,
          );
        } else {
          const montoFamiliar =
            await this.configuracionService.getValorNumerico(
              'CUOTA_FAMILIAR',
              120,
            );
          const cargoCuota = this.cargoRepo.create({
            descripcion: 'Cuota Grupo Familiar',
            monto: montoFamiliar,
            tipo: TipoCargo.SERVICIOS,
            cliente: { id: cliente.id },
            pagado: false,
            fechaEmision: new Date(),
            fechaVencimiento,
          });
          const guardado = await this.cargoRepo.save(cargoCuota);
          cargoIds.push(guardado.id);
        }
      }

      // C. Consolidar con consumos pendientes
      const consumosPendientes = await this.cargoRepo.find({
        where: {
          cliente: { id: cliente.id },
          factura: null,
          pagado: false,
          tipo: TipoCargo.OTROS, // Only unscheduled consumptions
        },
      });
      cargoIds.push(...consumosPendientes.map((c) => c.id));

      // D. Crear Factura si hay cargos
      if (cargoIds.length > 0) {
        try {
          await this.facturasService.create({
            clienteId: cliente.id,
            fechaEmision: today.toISOString(),
            cargoIds,
            observaciones: 'Facturación automática mensual por sistema.',
          });
          this.logger.log(`Factura generada con éxito para ${cliente.nombre}`);
        } catch (error: unknown) {
          const errMsg =
            error instanceof Error ? error.message : 'Unknown error';
          this.logger.error(
            `Error generando factura para ${cliente.nombre}: ${errMsg}`,
          );
        }
      }
    }

    this.logger.log('Proceso de facturación automática finalizado.');
  }

  /**
   * Auditoría de facturas vencidas y aplicación de recargos/intereses
   */
  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async checkOverdueInvoices() {
    this.logger.log(
      'Iniciando auditoría diaria de deudas y cálculo de mora...',
    );
    const now = new Date();

    const overdueInvoices = await this.facturaRepo.find({
      where: {
        estado: EstadoFactura.PENDIENTE,
        fechaVencimiento: LessThan(now),
      },
      relations: ['cliente', 'cargos'],
    });

    if (overdueInvoices.length === 0) {
      this.logger.log('No se detectaron facturas vencidas hoy.');
      return;
    }

    // Configuración de Mora
    const tasaInteresMensual = await this.configuracionService.getValorNumerico(
      'MORA_TASA_INTERES',
      3,
    );
    const tasaRecargoFijo = await this.configuracionService.getValorNumerico(
      'MORA_TASA_RECARGO',
      10,
    );
    const diasGracia = await this.configuracionService.getValorNumerico(
      'MORA_DIAS_GRACIA',
      5,
    );
    const baseUrl = await this.configuracionService.getValor(
      'PUBLIC_URL',
      'https://app.gestornautico.com',
    );

    for (const factura of overdueInvoices) {
      const fechaVto = new Date(factura.fechaVencimiento);
      const diffTime = Math.abs(now.getTime() - fechaVto.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays > diasGracia) {
        let huboCambios = false;
        const totalCargos = (factura.cargos ?? []).reduce(
          (sum, c) => sum + Number(c.monto),
          0,
        );

        // 1. Aplicar Recargo Fijo (Solo una vez si no se ha aplicado)
        if (Number(factura.recargo) === 0 && tasaRecargoFijo > 0) {
          factura.recargo = totalCargos * (tasaRecargoFijo / 100);
          huboCambios = true;
          this.logger.log(
            `Aplicando recargo fijo a Factura ${factura.numero}: $${factura.recargo}`,
          );
        }

        // 2. Calcular Interés Moratorio (Proporcional mensual)
        const nuevoInteres =
          totalCargos * (tasaInteresMensual / 100) * (diffDays / 30);
        if (Math.abs(Number(factura.interesMoratorio) - nuevoInteres) > 0.01) {
          factura.interesMoratorio = nuevoInteres;
          factura.fechaAplicacionMora = now;
          huboCambios = true;
        }

        if (huboCambios) {
          factura.total =
            totalCargos +
            Number(factura.recargo) +
            Number(factura.interesMoratorio);
          await this.facturaRepo.save(factura);
        }
      }

      // Notificaciones
      await this.notificacionesService.createForRole(Role.ADMIN, {
        titulo: 'Factura Vencida',
        mensaje: `La factura ${factura.numero} de ${factura.cliente.nombre} está vencida (${diffDays} días). Total actual: $${Number(factura.total).toLocaleString('es-AR')}`,
        tipo: NotificacionTipo.ALERTA,
      });

      if (factura.cliente.email) {
        await this.notificacionesService.sendEmailNotification(
          factura.cliente.email,
          'Recordatorio de Pago',
          'aviso-deuda',
          {
            clienteNombre: factura.cliente.nombre,
            numeroFactura: factura.numero,
            fechaEmision: new Date(factura.fechaEmision).toLocaleDateString(
              'es-AR',
            ),
            montoTotal: Number(factura.total).toLocaleString('es-AR'),
            paymentLink: `${baseUrl}/pago-publico?factura=${factura.numero}`,
          },
        );
      }
    }
    this.logger.log('Auditoría de deudas finalizada.');
  }
}
