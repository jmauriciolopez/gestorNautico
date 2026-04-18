import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Movimiento } from './movimientos.entity';
import { EmbarcacionesService } from '../embarcaciones/embarcaciones.service';
import { EspaciosService } from '../espacios/espacios.service';
import { Embarcacion } from '../embarcaciones/embarcaciones.entity';
import { ConfiguracionService } from '../configuracion/configuracion.service';
import { paginate, PaginationQuery } from '../common/pagination/pagination.helper';

export interface CreateMovimientoDto {
  embarcacionId: number;
  espacioId?: number;
  tipo: 'entrada' | 'salida';
  fecha?: Date;
  notas?: string;
}

@Injectable()
export class MovimientosService {
  constructor(
    @InjectRepository(Movimiento)
    private readonly movimientoRepo: Repository<Movimiento>,
    private readonly embarcacionesService: EmbarcacionesService,
    private readonly espaciosService: EspaciosService,
    private readonly configuracionService: ConfiguracionService,
  ) {}

  findAll(query: PaginationQuery = {}) {
    return paginate(this.movimientoRepo, query, {
      relations: ['embarcacion', 'espacio', 'espacio.rack'],
      order: { fecha: 'DESC' },
    });
  }

  async findOne(id: number) {
    const movimiento = await this.movimientoRepo.findOne({
      where: { id },
      relations: ['embarcacion', 'espacio'],
    });
    if (!movimiento)
      throw new NotFoundException(`Movimiento con ID ${id} no encontrado`);
    return movimiento;
  }

  async create(data: CreateMovimientoDto) {
    const { embarcacionId, espacioId, tipo, ...rest } = data;

    // Find the current boat to get its assigned space if needed
    const embarcacion: Embarcacion = await this.embarcacionesService.findOne(
      Number(embarcacionId),
    );
    const targetEspacioId = espacioId
      ? Number(espacioId)
      : embarcacion.espacio?.id || null;

    // --- CHECK AFTER HOURS (Only for ENTRADA/SUBIDA) ---
    let fueraHora = false;
    if (tipo === 'entrada') {
      const maxHora = await this.configuracionService.getValor(
        'HORARIO_MAX_SUBIDA',
        '18:00',
      );
      const now = new Date();
      const currentHHMM =
        now.getHours().toString().padStart(2, '0') +
        ':' +
        now.getMinutes().toString().padStart(2, '0');

      if (currentHHMM > maxHora) {
        fueraHora = true;
      }
    }

    const createData = {
      ...rest,
      tipo,
      fueraHora,
      embarcacion: { id: Number(embarcacionId) },
      espacio: targetEspacioId ? { id: Number(targetEspacioId) } : null,
    };

    const nuevoMovimiento = this.movimientoRepo.create(createData);
    const savedMovement = await this.movimientoRepo.save(nuevoMovimiento);

    // --- SYNC STATUS ---
    if (tipo === 'entrada') {
      // Boat comes to rack -> Occupy space
      await this.embarcacionesService.update(embarcacion.id, {
        estado: 'EN_CUNA',
      });
      if (targetEspacioId) {
        await this.espaciosService.update(Number(targetEspacioId), {
          ocupado: true,
        });
      }
    } else if (tipo === 'salida') {
      // Boat goes to water -> Free space
      await this.embarcacionesService.update(embarcacion.id, {
        estado: 'EN_AGUA',
      });
      if (targetEspacioId) {
        await this.espaciosService.update(Number(targetEspacioId), {
          ocupado: false,
        });
      }
    }

    return savedMovement;
  }

  async remove(id: number) {
    const movimiento = await this.findOne(id);
    return this.movimientoRepo.remove(movimiento);
  }
}
