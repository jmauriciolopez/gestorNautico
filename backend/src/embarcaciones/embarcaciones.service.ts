import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository, FindManyOptions } from 'typeorm';
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

    const options: FindManyOptions<Embarcacion> = {
      relations: ['cliente', 'espacio', 'espacio.rack', 'espacio.rack.zona'],
      order: { createdAt: 'DESC' },
    };

    if (search) {
      options.where = [
        { nombre: ILike(`%${search}%`) },
        { matricula: ILike(`%${search}%`) },
        { cliente: { nombre: ILike(`%${search}%`) } },
      ];
    }

    return paginate(this.embarcacionesRepository, pagination, options);
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

    const { largo, ancho } = espacio.rack;

    // Solo validar si el rack tiene dimensiones configuradas (> 0)
    if (largo > 0 && eslora > largo) {
      throw new BadRequestException(
        `La eslora de la embarcación (${eslora}m) excede el largo disponible en el rack (${largo}m)`,
      );
    }

    if (ancho > 0 && manga > ancho) {
      throw new BadRequestException(
        `La manga de la embarcación (${manga}m) excede el ancho disponible en el rack (${ancho}m)`,
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
    const nuevoEspacioId =
      'espacioId' in dto ? dto.espacioId : anteriorEspacioId;

    if (nuevoEspacioId) {
      await this.validarDimensionesUbicacion(
        nuevoEspacioId,
        nuevaEslora,
        nuevaManga,
      );
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
    if ('espacioId' in dto) setValues.espacioId = dto.espacioId;

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
