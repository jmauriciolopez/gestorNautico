import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, FindManyOptions, FindOptionsWhere } from 'typeorm';
import { RegistroServicio, EstadoServicio } from './registro.entity';
import { CargosService } from '../cargos/cargos.service';
import { TipoCargo } from '../cargos/cargo.entity';
import { NotificacionesService } from '../notificaciones/notificaciones.service';
import { Role } from '../users/user.entity';
import { NotificacionTipo } from '../notificaciones/notificacion.entity';
import {
  paginate,
  PaginationQuery,
  PaginatedResult,
} from '../common/pagination/pagination.helper';

@Injectable()
export class RegistrosService {
  constructor(
    @InjectRepository(RegistroServicio)
    private readonly registroRepo: Repository<RegistroServicio>,
    private readonly cargosService: CargosService,
    private readonly notificacionesService: NotificacionesService,
  ) {}

  async findAll(
    query: PaginationQuery & { search?: string; estado?: string } = {},
    embarcacionId?: number,
  ): Promise<PaginatedResult<RegistroServicio>> {
    const { search, estado, ...pagination } = query;
    const options: FindManyOptions<RegistroServicio> = {
      where: {},
      relations: ['embarcacion', 'servicio'],
      order: { createdAt: 'DESC' },
    };

    const where: FindOptionsWhere<RegistroServicio> = {};

    if (embarcacionId) {
      where.embarcacionId = embarcacionId;
    }

    if (estado) {
      where.estado = estado as EstadoServicio;
    }

    if (search) {
      options.where = [
        { ...where, embarcacion: { nombre: ILike(`%${search}%`) } },
        { ...where, servicio: { nombre: ILike(`%${search}%`) } },
      ];
    } else {
      options.where = where;
    }

    return paginate(this.registroRepo, pagination, options);
  }

  async findOne(id: number) {
    const registro = await this.registroRepo.findOne({
      where: { id },
      relations: ['embarcacion', 'servicio', 'embarcacion.cliente'],
    });
    if (!registro)
      throw new NotFoundException(
        `Registro de servicio con ID ${id} no encontrado`,
      );
    return registro;
  }

  async create(data: Partial<RegistroServicio>) {
    const registro = this.registroRepo.create(data);
    const saved = await this.registroRepo.save(registro);

    // Cargar relaciones para la notificación
    const completo = await this.registroRepo.findOne({
      where: { id: saved.id },
      relations: ['embarcacion', 'embarcacion.cliente', 'servicio'],
    });

    if (completo) {
      // Notificar a operadores que hay un servicio programado
      await this.notificacionesService.createForRole(Role.OPERADOR, {
        titulo: 'Servicio Programado',
        mensaje: `${completo.servicio?.nombre ?? 'Servicio'} para "${completo.embarcacion?.nombre}" programado para el ${completo.fechaProgramada}.`,
        tipo: NotificacionTipo.INFO,
      });
    }

    return saved;
  }

  async update(id: number, data: Partial<RegistroServicio>) {
    await this.findOne(id);
    await this.registroRepo.update(id, data);
    return this.findOne(id);
  }

  async complete(id: number, costoFinal?: number): Promise<RegistroServicio> {
    const registro = await this.registroRepo.findOne({
      where: { id },
      relations: ['embarcacion', 'embarcacion.cliente', 'servicio'],
    });

    if (!registro) {
      throw new NotFoundException('Registro de servicio no encontrado');
    }

    registro.estado = EstadoServicio.COMPLETADO;
    registro.fechaCompletada = new Date().toISOString().split('T')[0];
    if (costoFinal !== undefined) {
      registro.costoFinal = costoFinal;
    }

    // 1. Marcar como facturado y generar Cargo automático
    registro.facturado = true;
    const cargo = await this.cargosService.create({
      clienteId: registro.embarcacion.cliente.id,
      descripcion: `Servicio: ${registro.servicio.nombre} - ${registro.embarcacion.nombre}`,
      monto: registro.costoFinal || registro.servicio.precioBase,
      fechaEmision: new Date().toISOString().split('T')[0],
      tipo: TipoCargo.SERVICIOS,
      pagado: false,
    });
    registro.facturaId = cargo.id;

    const saved = await this.registroRepo.save(registro);

    // 2. Notificación Interna (App In-box) para Admins
    await this.notificacionesService.createForRole(Role.ADMIN, {
      titulo: 'Mantenimiento Finalizado',
      mensaje: `El servicio "${registro.servicio.nombre}" para "${registro.embarcacion.nombre}" ha sido completado.`,
      tipo: NotificacionTipo.EXITO,
    });

    // 3. Notificación Email para el Cliente
    if (registro.embarcacion.cliente.email) {
      await this.notificacionesService.sendEmailNotification(
        registro.embarcacion.cliente.email,
        'Servicio Náutico Completado',
        'servicio-completado',
        {
          clienteNombre: registro.embarcacion.cliente.nombre,
          embarcacionNombre: registro.embarcacion.nombre,
          servicioNombre: registro.servicio.nombre,
          montoFinal: registro.costoFinal,
          fecha: new Date().toLocaleDateString(),
        },
      );
    }

    return saved;
  }

  async remove(id: number) {
    const registro = await this.findOne(id);
    return this.registroRepo.remove(registro);
  }
}
