import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager, DataSource } from 'typeorm';
import { Embarcacion, EstadoEmbarcacion } from './embarcaciones.entity';
import { Espacio } from '../espacios/espacio.entity';
import {
  paginate,
  PaginationQuery,
  PaginatedResult,
} from '../common/pagination/pagination.helper';
import { CreateEmbarcacionDto } from './dto/create-embarcacion.dto';
import { UpdateEmbarcacionDto } from './dto/update-embarcacion.dto';

import { BaseTenantService } from '../compartido/bases/base-tenant.service';
import { TenantContext } from '../compartido/interfaces/tenant-context.interface';

@Injectable()
export class EmbarcacionesService extends BaseTenantService {
  private readonly logger = new Logger(EmbarcacionesService.name);

  constructor(
    @InjectRepository(Embarcacion)
    private readonly embarcacionesRepository: Repository<Embarcacion>,
    @InjectRepository(Espacio)
    private readonly espacioRepo: Repository<Espacio>,
    private readonly dataSource: DataSource,
  ) {
    super();
  }

  async findAll(
    tenant: TenantContext,
    query: PaginationQuery & { search?: string } = {},
  ): Promise<PaginatedResult<Embarcacion>> {
    const { search, ...pagination } = query;

    const queryBuilder = this.embarcacionesRepository
      .createQueryBuilder('embarcacion')
      .leftJoinAndSelect('embarcacion.cliente', 'cliente')
      .leftJoinAndSelect('embarcacion.espacio', 'espacio')
      .leftJoinAndSelect('espacio.rack', 'rack')
      .leftJoinAndSelect('rack.zona', 'zona');

    this.applyTenantFilter(queryBuilder, tenant, 'embarcacion');

    queryBuilder.addSelect((subQuery) => {
      const sq = subQuery
        .select('COUNT(cargo.id)', 'count')
        .from('cargos', 'cargo')
        .where('cargo.cliente_id = embarcacion.clienteId')
        .andWhere('cargo.pagado = :pagado', { pagado: false });
      
      this.applyTenantFilter(sq, tenant, 'cargo');
      return sq;
    }, 'deudaCount')
    .orderBy('embarcacion.createdAt', 'DESC');

    if (search) {
      queryBuilder.andWhere(
        'embarcacion.nombre ILIKE :search OR embarcacion.matricula ILIKE :search OR cliente.nombre ILIKE :search',
        { search: `%${search}%` },
      );
    }

    const { data, total, page, limit, totalPages } = await paginate(
      queryBuilder,
      pagination,
    );

    // Mapear los resultados para incluir el flag tieneDeuda
    const itemsWithDebt = data.map((item) => {
      const row = item as Embarcacion & { deudaCount?: string };
      const { deudaCount, ...embarcacion } = row;
      return {
        ...embarcacion,
        tieneDeuda: parseInt(deudaCount || '0', 10) > 0,
      };
    });

    return {
      data: itemsWithDebt,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async findOne(tenant: TenantContext, id: number): Promise<Embarcacion> {
    const embarcacion = await this.embarcacionesRepository.findOne({
      where: this.buildTenantWhere(tenant, { id }),
      relations: ['cliente', 'espacio', 'espacio.rack', 'espacio.rack.zona'],
    });
    if (!embarcacion) {
      throw new NotFoundException(`Embarcación con ID ${id} no encontrada`);
    }
    return embarcacion;
  }

  private async validarDimensionesUbicacion(
    tenant: TenantContext,
    espacioId: number,
    eslora: number,
    manga: number,
    manager?: EntityManager,
  ) {
    if (!espacioId) return;

    const espRepo = manager ? manager.getRepository(Espacio) : this.espacioRepo;

    const espacio = await espRepo.findOne({
      where: this.buildTenantWhere(tenant, { id: espacioId }),
      relations: ['rack'],
    });

    if (!espacio) {
      throw new BadRequestException(`El espacio ${espacioId} no pertenece a esta sede o no existe`);
    }
    
    if (!espacio.rack) return;

    const largo = Number(espacio.rack.largo);
    const ancho = Number(espacio.rack.ancho);
    const esloraNum = Number(eslora);
    const mangaNum = Number(manga);

    // Solo validar si el rack tiene dimensiones configuradas (> 0)
    if (largo > 0 && esloraNum > largo) {
      throw new BadRequestException(
        `La eslora de la embarcación (${esloraNum}m) excede el largo disponible en el rack (${largo}m)`,
      );
    }

    if (ancho > 0 && mangaNum > ancho) {
      throw new BadRequestException(
        `La manga de la embarcación (${mangaNum}m) excede el ancho disponible en el rack (${ancho}m)`,
      );
    }
  }

  async create(
    tenant: TenantContext,
    dto: CreateEmbarcacionDto,
    manager?: EntityManager,
  ): Promise<Embarcacion> {
    const work = async (mgr: EntityManager) => {
      const boatRepo = mgr.getRepository(Embarcacion);
      const espRepo = mgr.getRepository(Espacio);

      if (dto.espacioId) {
        await this.validarDimensionesUbicacion(
          tenant,
          dto.espacioId,
          dto.eslora || 0,
          dto.manga || 0,
          mgr,
        );
      }

      // Validar que el cliente pertenezca al tenant
      if (dto.clienteId) {
        const clienteRepo = mgr.getRepository('Cliente');
        const cliente = await clienteRepo.findOne({
          where: this.buildTenantWhere(tenant, { id: dto.clienteId }),
        });
        if (!cliente) {
          throw new BadRequestException(`El cliente ${dto.clienteId} no pertenece a esta sede`);
        }
      }

      // Validar que el espacio no esté ocupado por otra embarcación (en el mismo tenant)
      if (dto.espacioId) {
        const boatWithSpace = await boatRepo.findOne({
          where: this.buildTenantWhere(tenant, { espacioId: dto.espacioId }),
        });
        if (boatWithSpace) {
          throw new BadRequestException(
            `El espacio seleccionado ya está asignado a la embarcación ${boatWithSpace.nombre} (${boatWithSpace.matricula})`,
          );
        }
      }

      const existing = await boatRepo.findOne({
        where: this.buildTenantWhere(tenant, { matricula: dto.matricula }),
      });
      if (existing) {
        throw new BadRequestException(
          `Ya existe una embarcación registrada con la matrícula ${dto.matricula}`,
        );
      }

      const nuevaEmbarcacion = boatRepo.create({
        ...dto,
        guarderiaId: tenant.guarderiaId as number,
      });
      const saved = await boatRepo.save(nuevaEmbarcacion);

      if (saved.espacioId) {
        await espRepo.update(saved.espacioId, { ocupado: true });
      }

      return saved;
    };

    if (manager) return await work(manager);
    return await this.dataSource.transaction(work);
  }

  async update(
    tenant: TenantContext,
    id: number,
    dto: UpdateEmbarcacionDto,
    manager?: EntityManager,
  ): Promise<Embarcacion> {
    const work = async (mgr: EntityManager) => {
      const boatRepo = mgr.getRepository(Embarcacion);
      const espRepo = mgr.getRepository(Espacio);

      const embarcacion = await this.findOne(tenant, id);
      const anteriorEspacioId = embarcacion.espacio?.id || null;

      const nuevaEslora = dto.eslora ?? embarcacion.eslora;
      const nuevaManga = dto.manga ?? embarcacion.manga;
      const nuevoEstado = dto.estado_operativo ?? embarcacion.estado_operativo;
      let nuevoEspacioId =
        'espacioId' in dto ? dto.espacioId : anteriorEspacioId;

      // Si se inactiva o ya está inactiva, liberar espacio automáticamente
      if (nuevoEstado === EstadoEmbarcacion.INACTIVA && nuevoEspacioId) {
        nuevoEspacioId = null;
      }

      if (nuevoEspacioId) {
        await this.validarDimensionesUbicacion(
          tenant,
          nuevoEspacioId,
          nuevaEslora,
          nuevaManga,
          mgr,
        );
      }

      // Validar que el nuevo cliente pertenezca al tenant
      if (dto.clienteId && dto.clienteId !== embarcacion.clienteId) {
        const clienteRepo = mgr.getRepository('Cliente');
        const cliente = await clienteRepo.findOne({
          where: this.buildTenantWhere(tenant, { id: dto.clienteId }),
        });
        if (!cliente) {
          throw new BadRequestException(`El cliente ${dto.clienteId} no pertenece a esta sede`);
        }
      }

      // Validar que el nuevo espacio no esté ocupado por otra embarcación (en el mismo tenant)
      if (nuevoEspacioId && nuevoEspacioId !== embarcacion.espacioId) {
        const boatWithSpace = await boatRepo.findOne({
          where: this.buildTenantWhere(tenant, { espacioId: nuevoEspacioId }),
        });
        if (boatWithSpace) {
          throw new BadRequestException(
            `El espacio seleccionado ya está asignado a la embarcación ${boatWithSpace.nombre} (${boatWithSpace.matricula})`,
          );
        }
      }

      // Si cambia la matrícula, validar que no exista otra igual
      if (dto.matricula && dto.matricula !== embarcacion.matricula) {
        const existing = await boatRepo.findOne({
          where: this.buildTenantWhere(tenant, { matricula: dto.matricula }),
        });
        if (existing) {
          throw new BadRequestException(
            `La matrícula ${dto.matricula} ya pertenece a otra embarcación`,
          );
        }
      }

      const setValues: Record<string, unknown> = {};

      if (dto.nombre !== undefined) setValues.nombre = dto.nombre;
      if (dto.matricula !== undefined) setValues.matricula = dto.matricula;
      if (dto.marca !== undefined) setValues.marca = dto.marca;
      if (dto.modelo !== undefined) setValues.modelo = dto.modelo;
      if (dto.eslora !== undefined) setValues.eslora = dto.eslora;
      if (dto.manga !== undefined) setValues.manga = dto.manga;
      if (dto.tipo !== undefined) setValues.tipo = dto.tipo;
      if (dto.estado_operativo !== undefined)
        setValues.estado_operativo = dto.estado_operativo;
      if (dto.descuento !== undefined) setValues.descuento = dto.descuento;
      if (dto.clienteId !== undefined) setValues.clienteId = dto.clienteId;

      // Forzar actualización de espacioId si cambió (por DTO o por inactivación)
      if (nuevoEspacioId !== anteriorEspacioId) {
        setValues.espacioId = nuevoEspacioId;
      }

      await boatRepo.update(id, setValues);

      if (anteriorEspacioId !== nuevoEspacioId) {
        if (anteriorEspacioId) {
          await espRepo.update(anteriorEspacioId, { ocupado: false });
        }
        if (nuevoEspacioId) {
          await espRepo.update(nuevoEspacioId, { ocupado: true });
        }
      }

      return await this.findOne(tenant, id);
    };

    if (manager) return await work(manager);
    return await this.dataSource.transaction(work);
  }

  async remove(tenant: TenantContext, id: number, manager?: EntityManager): Promise<void> {
    const work = async (mgr: EntityManager) => {
      const boatRepo = mgr.getRepository(Embarcacion);
      const espRepo = mgr.getRepository(Espacio);

      const embarcacion = await this.findOne(tenant, id);
      const espacioId = embarcacion.espacioId;

      // Liberar espacio si tenía uno
      if (espacioId) {
        await espRepo.update(espacioId, { ocupado: false });
      }

      Object.assign(embarcacion, {
        estado_operativo: 'INACTIVA',
        espacioId: null,
      });
      await boatRepo.save(embarcacion);
    };

    if (manager) return await work(manager);
    return await this.dataSource.transaction(work);
  }
}
