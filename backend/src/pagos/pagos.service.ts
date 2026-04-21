import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pago } from './pago.entity';
import { CajasService } from '../cajas/cajas.service';
import { CargosService } from '../cargos/cargos.service';
import { CreatePagoDto } from './dto/create-pago.dto';
import { paginate, PaginationQuery } from '../common/pagination/pagination.helper';

@Injectable()
export class PagosService {
  constructor(
    @InjectRepository(Pago)
    private readonly pagoRepo: Repository<Pago>,
    private readonly cajasService: CajasService,
    private readonly cargosService: CargosService,
  ) {}

  findAll(query: PaginationQuery = {}) {
    return paginate(this.pagoRepo, query, {
      relations: ['cliente', 'cargo', 'caja'],
      order: { fecha: 'DESC' },
    });
  }

  async findOne(id: number) {
    const pago = await this.pagoRepo.findOne({
      where: { id },
      relations: ['cliente', 'cargo', 'caja'],
    });
    if (!pago) throw new NotFoundException(`Pago con ID ${id} no encontrado`);
    return pago;
  }

  async create(data: CreatePagoDto) {
    const { clienteId, cargoId, cajaId, metodo, referencia, notas, ...rest } = data;

    // 1. Obtener una caja abierta
    const caja = cajaId
      ? await this.cajasService.findOne(cajaId)
      : await this.cajasService.findAbierta();

    if (!caja)
      throw new NotFoundException('No hay caja abierta para registrar el pago');

    // 2. Crear el pago
    const nuevoPago = this.pagoRepo.create({
      ...rest,
      metodoPago: metodo as any,
      comprobante: referencia,
      cliente: { id: Number(clienteId) },
      cargo: cargoId ? { id: Number(cargoId) } : null,
      caja: caja,
    });

    const pagoGuardado = await this.pagoRepo.save(nuevoPago);

    // 3. Si el pago está vinculado a un cargo, marcarlo como pagado
    if (cargoId) {
      await this.cargosService.setPagado(Number(cargoId), true);
    }

    return pagoGuardado;
  }

  async remove(id: number) {
    const pago = await this.findOne(id);
    // Si tenía un cargo, revertimos el estado pagado
    if (pago.cargo) {
      await this.cargosService.setPagado(pago.cargo.id, false);
    }
    return this.pagoRepo.remove(pago);
  }
}
