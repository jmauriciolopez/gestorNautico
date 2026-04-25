import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
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
import { BaseTenantService } from '../compartido/bases/base-tenant.service';
import { TenantContext } from '../compartido/interfaces/tenant-context.interface';
import { Embarcacion } from '../embarcaciones/embarcaciones.entity';
import { Catalogo } from '../catalogo/catalogo.entity';

@Injectable()
export class RegistrosService extends BaseTenantService {
  constructor(
    @InjectRepository(RegistroServicio)
    private readonly registroRepo: Repository<RegistroServicio>,
    @InjectRepository(Embarcacion)
    private readonly embarcacionRepo: Repository<Embarcacion>,
    @InjectRepository(Catalogo)
    private readonly catalogoRepo: Repository<Catalogo>,
    private readonly cargosService: CargosService,
    private readonly notificacionesService: NotificacionesService,
  ) {
    super();
  }

  async findAll(
    tenant: TenantContext,
    query: PaginationQuery & { search?: string; estado?: string } = {},
    embarcacionId?: number,
  ): Promise<PaginatedResult<RegistroServicio>> {
    const { search, estado, ...pagination } = query;
    const options: FindManyOptions<RegistroServicio> = {
      where: {},
      relations: ['embarcacion', 'servicio'],
      order: { createdAt: 'DESC' },
    };

    const where: FindOptionsWhere<RegistroServicio> = this.buildTenantWhere(tenant);

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

  async findOne(tenant: TenantContext, id: number) {
    const registro = await this.registroRepo.findOne({
      where: this.buildTenantWhere(tenant, { id }),
      relations: ['embarcacion', 'servicio', 'embarcacion.cliente'],
    });
    if (!registro)
      throw new NotFoundException(
        `Registro de servicio con ID ${id} no encontrado`,
      );
    return registro;
  }

  async create(tenant: TenantContext, data: Partial<RegistroServicio>) {
    // Validar que la embarcación pertenezca al tenant
    if (data.embarcacionId) {
      const embarcacion = await this.embarcacionRepo.findOne({
        where: this.buildTenantWhere(tenant, { id: data.embarcacionId }),
      });
      if (!embarcacion) {
        throw new BadRequestException(
          `La embarcación ${data.embarcacionId} no pertenece a esta sede`,
        );
      }
    }

    // Validar que el servicio del catálogo pertenezca al tenant
    if (data.servicioId) {
      const servicio = await this.catalogoRepo.findOne({
        where: this.buildTenantWhere(tenant, { id: data.servicioId }),
      });
      if (!servicio) {
        throw new BadRequestException(
          `El servicio ${data.servicioId} no pertenece a esta sede`,
        );
      }
    }

    const registro = this.registroRepo.create({
      ...data,
      guarderiaId: tenant.guarderiaId,
    });
    const saved = await this.registroRepo.save(registro);

    // Cargar relaciones para la notificación
    const completo = await this.registroRepo.findOne({
      where: { id: saved.id },
      relations: ['embarcacion', 'embarcacion.cliente', 'servicio'],
    });

    if (completo) {
      // Notificar a operadores que hay un servicio programado
      await this.notificacionesService.createForRole(tenant, Role.OPERADOR, {
        titulo: 'Servicio Programado',
        mensaje: `${completo.servicio?.nombre ?? 'Servicio'} para "${completo.embarcacion?.nombre}" programado para el ${completo.fechaProgramada}.`,
        tipo: NotificacionTipo.INFO,
      });
    }

    return saved;
  }

  async update(tenant: TenantContext, id: number, data: Partial<RegistroServicio>) {
    await this.findOne(tenant, id);
    await this.registroRepo.update({ id, guarderiaId: tenant.guarderiaId }, data);
    return this.findOne(tenant, id);
  }

  async complete(tenant: TenantContext, id: number, costoFinal?: number): Promise<RegistroServicio> {
    const registro = await this.registroRepo.findOne({
      where: this.buildTenantWhere(tenant, { id }),
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
    const cargo = await this.cargosService.create(tenant, {
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
    await this.notificacionesService.createForRole(tenant, Role.ADMIN, {
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

  async remove(tenant: TenantContext, id: number) {
    const registro = await this.findOne(tenant, id);
    return this.registroRepo.remove(registro);
  }
}
