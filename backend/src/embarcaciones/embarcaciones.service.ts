import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Embarcacion } from './embarcaciones.entity';
import { Espacio } from '../espacios/espacio.entity';
import {
  paginate,
  PaginationQuery,
  PaginatedResult,
} from '../common/pagination/pagination.helper';
import { CreateEmbarcacionDto } from './dto/create-embarcacion.dto';
import { UpdateEmbarcacionDto } from './dto/update-embarcacion.dto';

@Injectable()
export class EmbarcacionesService {
  private readonly logger = new Logger(EmbarcacionesService.name);

  constructor(
    @InjectRepository(Embarcacion)
    private readonly embarcacionesRepository: Repository<Embarcacion>,
    @InjectRepository(Espacio)
    private readonly espacioRepo: Repository<Espacio>,
  ) {}

  async findAll(
    query: PaginationQuery & { search?: string } = {},
  ): Promise<PaginatedResult<Embarcacion>> {
    const { search, ...pagination } = query;

    const queryBuilder = this.embarcacionesRepository
      .createQueryBuilder('embarcacion')
      .leftJoinAndSelect('embarcacion.cliente', 'cliente')
      .leftJoinAndSelect('embarcacion.espacio', 'espacio')
      .leftJoinAndSelect('espacio.rack', 'rack')
      .leftJoinAndSelect('rack.zona', 'zona')
      .addSelect((subQuery) => {
        return subQuery
          .select('COUNT(cargo.id)', 'count')
          .from('cargos', 'cargo')
          .where('cargo.cliente_id = embarcacion.clienteId')
          .andWhere('cargo.pagado = :pagado', { pagado: false });
      }, 'deudaCount')
      .orderBy('embarcacion.createdAt', 'DESC');

    if (search) {
      queryBuilder.where(
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

  async findOne(id: number): Promise<Embarcacion> {
    const embarcacion = await this.embarcacionesRepository.findOne({
      where: { id },
      relations: ['cliente', 'espacio', 'espacio.rack', 'espacio.rack.zona'],
    });
    if (!embarcacion) {
      throw new NotFoundException(`Embarcación con ID ${id} no encontrada`);
    }
    return embarcacion;
  }

  private async validarDimensionesUbicacion(
    espacioId: number,
    eslora: number,
    manga: number,
  ) {
    if (!espacioId) return;

    const espacio = await this.espacioRepo.findOne({
      where: { id: espacioId },
      relations: ['rack'],
    });

    if (!espacio || !espacio.rack) return;

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

  async create(dto: CreateEmbarcacionDto): Promise<Embarcacion> {
    if (dto.espacioId) {
      await this.validarDimensionesUbicacion(
        dto.espacioId,
        dto.eslora || 0,
        dto.manga || 0,
      );
    }

    // Validar que el espacio no esté ocupado por otra embarcación
    if (dto.espacioId) {
      const boatWithSpace = await this.embarcacionesRepository.findOne({
        where: { espacioId: dto.espacioId },
      });
      if (boatWithSpace) {
        throw new BadRequestException(
          `El espacio seleccionado ya está asignado a la embarcación ${boatWithSpace.nombre} (${boatWithSpace.matricula})`,
        );
      }
    }

    const existing = await this.embarcacionesRepository.findOne({
      where: { matricula: dto.matricula },
    });
    if (existing) {
      throw new BadRequestException(
        `Ya existe una embarcación registrada con la matrícula ${dto.matricula}`,
      );
    }

    const nuevaEmbarcacion = this.embarcacionesRepository.create(dto);
    const saved = await this.embarcacionesRepository.save(nuevaEmbarcacion);

    if (saved.espacioId) {
      await this.espacioRepo.update(saved.espacioId, { ocupado: true });
    }

    return saved;
  }

  async update(id: number, dto: UpdateEmbarcacionDto): Promise<Embarcacion> {
    const embarcacion = await this.findOne(id);
    const anteriorEspacioId = embarcacion.espacio?.id || null;

    const nuevaEslora = dto.eslora ?? embarcacion.eslora;
    const nuevaManga = dto.manga ?? embarcacion.manga;
    const nuevoEstado = dto.estado ?? embarcacion.estado;
    let nuevoEspacioId = 'espacioId' in dto ? dto.espacioId : anteriorEspacioId;

    // Si se inactiva o ya está inactiva, liberar espacio automáticamente
    if (nuevoEstado === 'INACTIVA' && nuevoEspacioId) {
      this.logger.log(
        `[EmbarcacionesService] Asegurando liberación de espacio para embarcación INACTIVA ${id}.`,
      );
      nuevoEspacioId = null;
    }

    if (nuevoEspacioId) {
      await this.validarDimensionesUbicacion(
        nuevoEspacioId,
        nuevaEslora,
        nuevaManga,
      );
    }

    // Validar que el nuevo espacio no esté ocupado por otra embarcación
    if (nuevoEspacioId && nuevoEspacioId !== embarcacion.espacioId) {
      const boatWithSpace = await this.embarcacionesRepository.findOne({
        where: { espacioId: nuevoEspacioId },
      });
      if (boatWithSpace) {
        throw new BadRequestException(
          `El espacio seleccionado ya está asignado a la embarcación ${boatWithSpace.nombre} (${boatWithSpace.matricula})`,
        );
      }
    }

    // Si cambia la matrícula, validar que no exista otra igual
    if (dto.matricula && dto.matricula !== embarcacion.matricula) {
      const existing = await this.embarcacionesRepository.findOne({
        where: { matricula: dto.matricula },
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
    if (dto.estado !== undefined) setValues.estado = dto.estado;
    if (dto.descuento !== undefined) setValues.descuento = dto.descuento;
    if (dto.clienteId !== undefined) setValues.clienteId = dto.clienteId;

    // Forzar actualización de espacioId si cambió (por DTO o por inactivación)
    if (nuevoEspacioId !== anteriorEspacioId) {
      setValues.espacioId = nuevoEspacioId;
    }

    await this.embarcacionesRepository
      .createQueryBuilder()
      .update(Embarcacion)
      .set(setValues)
      .where('id = :id', { id })
      .execute();

    if (anteriorEspacioId !== nuevoEspacioId) {
      if (anteriorEspacioId) {
        await this.espacioRepo.update(anteriorEspacioId, { ocupado: false });
      }
      if (nuevoEspacioId) {
        await this.espacioRepo.update(nuevoEspacioId, { ocupado: true });
      }
    }

    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const embarcacion = await this.findOne(id);
    const espacioId = embarcacion.espacioId;

    // Liberar espacio si tenía uno
    if (espacioId) {
      await this.espacioRepo.update(espacioId, { ocupado: false });
    }

    Object.assign(embarcacion, { estado: 'INACTIVA', espacioId: null });
    await this.embarcacionesRepository.save(embarcacion);
  }
}
