import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Movimiento } from './movimientos.entity';
import { Pedido } from '../pedidos/pedidos.entity';
import { EmbarcacionesService } from '../embarcaciones/embarcaciones.service';
import { EspaciosService } from '../espacios/espacios.service';
import { Embarcacion } from '../embarcaciones/embarcaciones.entity';
import { ConfiguracionService } from '../configuracion/configuracion.service';
import { NotificacionesService } from '../notificaciones/notificaciones.service';
import { NotificacionTipo } from '../notificaciones/notificacion.entity';
import { Role } from '../users/user.entity';
import {
  paginate,
  PaginationQuery,
} from '../common/pagination/pagination.helper';
import { CreateMovimientoDto } from './dto/create-movimiento.dto';

@Injectable()
export class MovimientosService {
  constructor(
    @InjectRepository(Movimiento)
    private readonly movimientoRepo: Repository<Movimiento>,
    @InjectRepository(Pedido)
    private readonly pedidoRepo: Repository<Pedido>,
    private readonly embarcacionesService: EmbarcacionesService,
    private readonly espaciosService: EspaciosService,
    private readonly configuracionService: ConfiguracionService,
    private readonly notificacionesService: NotificacionesService,
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
      // Boat comes to rack
      await this.embarcacionesService.update(embarcacion.id, {
        estado_operativo: 'EN_CUNA',
      });
      // Update or Create Order (subida)
      const pedidoExistente = await this.pedidoRepo.findOne({
        where: { embarcacion: { id: embarcacion.id }, estado: 'en_agua' },
      });

      if (pedidoExistente) {
        await this.pedidoRepo.update(pedidoExistente.id, {
          estado: 'finalizado',
        });
      } else {
        const nuevoPedido = this.pedidoRepo.create({
          embarcacion: { id: embarcacion.id },
          estado: 'finalizado',
          fechaProgramada: new Date(),
        });
        await this.pedidoRepo.save(nuevoPedido);
      }

      await this.notificacionesService.createForRole(Role.ADMIN, {
        titulo: 'Retorno a Cuna',
        mensaje: `La embarcación ${embarcacion.nombre} ha regresado a su cuna.`,
        tipo: NotificacionTipo.INFO,
      });
    } else if (tipo === 'salida') {
      // Boat goes to water
      await this.embarcacionesService.update(embarcacion.id, {
        estado_operativo: 'EN_AGUA',
      });
      // Update or Create Order (bajada)
      const pedidoExistente = await this.pedidoRepo.findOne({
        where: { embarcacion: { id: embarcacion.id }, estado: 'pendiente' },
      });

      if (pedidoExistente) {
        await this.pedidoRepo.update(pedidoExistente.id, {
          estado: 'en_agua',
        });
      } else {
        const nuevoPedido = this.pedidoRepo.create({
          embarcacion: { id: embarcacion.id },
          estado: 'en_agua',
          fechaProgramada: new Date(),
        });
        await this.pedidoRepo.save(nuevoPedido);
      }

      await this.notificacionesService.createForRole(Role.ADMIN, {
        titulo: 'Salida a Agua',
        mensaje: `La embarcación ${embarcacion.nombre} ha salido al agua.`,
        tipo: NotificacionTipo.INFO,
      });
    }

    return savedMovement;
  }

  async remove(id: number) {
    const movimiento = await this.findOne(id);
    return this.movimientoRepo.remove(movimiento);
  }
}
