import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Factura, EstadoFactura } from './factura.entity';

@Injectable()
export class FacturasService {
  constructor(
    @InjectRepository(Factura)
    private readonly facturaRepo: Repository<Factura>,
  ) {}

  findAll() {
    return this.facturaRepo.find({
      relations: ['cliente'],
      order: { fechaEmision: 'DESC' }
    });
  }

  async findOne(id: number) {
    const factura = await this.facturaRepo.findOne({
      where: { id },
      relations: ['cliente']
    });
    if (!factura) throw new NotFoundException(`Factura con ID ${id} no encontrada`);
    return factura;
  }

  async create(data: any) {
    const { clienteId, ...rest } = data;
    const nueva = this.facturaRepo.create({
      ...rest,
      cliente: { id: clienteId },
      estado: EstadoFactura.PENDIENTE
    });
    return this.facturaRepo.save(nueva);
  }

  async updateEstado(id: number, estado: EstadoFactura) {
    await this.facturaRepo.update(id, { estado });
    return this.findOne(id);
  }

  async remove(id: number) {
    const factura = await this.findOne(id);
    return this.facturaRepo.remove(factura);
  }
}
