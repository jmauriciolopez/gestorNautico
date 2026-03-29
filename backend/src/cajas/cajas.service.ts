import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Caja, EstadoCaja } from './caja.entity';
import { MetodoPago } from '../pagos/pago.entity';
import { NotificacionesService } from '../notificaciones/notificaciones.service';
import { Role } from '../users/user.entity';
import { NotificacionTipo } from '../notificaciones/notificacion.entity';

export interface CajasResumen {
  id: number;
  saldoInicial: number;
  totalRecaudado: number;
  totalEfectivo: number;
  fechaApertura: Date;
}

@Injectable()
export class CajasService {
  private readonly logger = new Logger(CajasService.name);

  constructor(
    @InjectRepository(Caja)
    private readonly cajaRepo: Repository<Caja>,
    private readonly notificacionesService: NotificacionesService,
  ) {}

  findAll() {
    return this.cajaRepo.find({
      relations: ['pagos'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number) {
    const caja = await this.cajaRepo.findOne({
      where: { id },
      relations: ['pagos'],
    });
    if (!caja) throw new NotFoundException(`Caja con ID ${id} no encontrada`);
    return caja;
  }

  async findAbierta() {
    return this.cajaRepo.findOne({
      where: { estado: EstadoCaja.ABIERTA },
      relations: ['pagos'],
    });
  }

  async abrir(saldoInicial: number) {
    try {
      this.logger.log(
        `Intentando abrir caja con saldo inicial: ${saldoInicial}`,
      );

      return await this.cajaRepo.manager.transaction(
        async (transactionalEntityManager) => {
          const abierta = await transactionalEntityManager.findOne(Caja, {
            where: { estado: EstadoCaja.ABIERTA },
          });

          if (abierta) {
            throw new ConflictException(
              'Ya existe una caja abierta en el sistema',
            );
          }

          const nueva = transactionalEntityManager.create(Caja, {
            saldoInicial: Number(saldoInicial || 0),
            estado: EstadoCaja.ABIERTA,
            fechaApertura: new Date(),
          });

          const guardada = await transactionalEntityManager.save(Caja, nueva);
          this.logger.log(
            `Caja aperturada exitosamente con ID: ${guardada.id}`,
          );

          // Notificar apertura de caja
          await this.notificacionesService.createForRole(Role.ADMIN, {
            titulo: 'Apertura de Caja',
            mensaje: `Se ha abierto una nueva sesión de caja con un saldo inicial de $${saldoInicial}.`,
            tipo: NotificacionTipo.SISTEMA,
          });

          return guardada;
        },
      );
    } catch (error: any) {
      this.logger.error(
        `Error crítico al abrir caja: ${error.message}`,
        error.stack,
      );
      if (error instanceof ConflictException) throw error;
      throw new BadRequestException(
        `No se pudo abrir la caja: ${error.message}`,
      );
    }
  }

  async cerrar(id: number, saldoFinal: number) {
    try {
      return await this.cajaRepo.manager.transaction(
        async (transactionalEntityManager) => {
          const caja = await transactionalEntityManager.findOne(Caja, {
            where: { id },
          });

          if (!caja)
            throw new NotFoundException(`Caja con ID ${id} no encontrada`);
          if (caja.estado === EstadoCaja.CERRADA) {
            throw new ConflictException(
              'La sesión de caja seleccionada ya se encuentra cerrada',
            );
          }

          caja.estado = EstadoCaja.CERRADA;
          caja.saldoFinal = Number(saldoFinal || 0);
          caja.fechaCierre = new Date();

          this.logger.log(
            `Cerrando caja ID ${id} con saldo final ${saldoFinal}`,
          );
          const guardada = await transactionalEntityManager.save(Caja, caja);

          // Notificar cierre de caja
          await this.notificacionesService.createForRole(Role.ADMIN, {
            titulo: 'Cierre de Caja',
            mensaje: `Se ha cerrado la sesión de caja ID ${id} con un saldo final de $${saldoFinal}.`,
            tipo: NotificacionTipo.EXITO,
          });

          return guardada;
        },
      );
    } catch (error: any) {
      this.logger.error(`Error al cerrar caja: ${error.message}`, error.stack);
      if (
        error instanceof ConflictException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new BadRequestException(
        `No se pudo cerrar la caja: ${error.message}`,
      );
    }
  }

  async getResumen(): Promise<CajasResumen | null> {
    const cajaAbierta = await this.findAbierta();
    if (!cajaAbierta) return null;

    const totalRecaudado = (cajaAbierta.pagos || []).reduce(
      (sum, p) => sum + Number(p.monto || 0),
      0,
    );

    const totalEfectivo = (cajaAbierta.pagos || [])
      .filter((p) => p.metodoPago === MetodoPago.EFECTIVO)
      .reduce((sum, p) => sum + Number(p.monto || 0), 0);

    return {
      id: cajaAbierta.id,
      saldoInicial: Number(cajaAbierta.saldoInicial || 0),
      totalRecaudado,
      totalEfectivo,
      fechaApertura: cajaAbierta.fechaApertura,
    };
  }
}
