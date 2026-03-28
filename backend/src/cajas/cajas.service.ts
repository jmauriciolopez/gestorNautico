import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Caja, EstadoCaja } from './caja.entity';
import { MetodoPago } from '../pagos/pago.entity';

@Injectable()
export class CajasService {
  constructor(
    @InjectRepository(Caja)
    private readonly cajaRepo: Repository<Caja>,
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
    const abierta = await this.findAbierta();
    if (abierta) throw new Error('Ya existe una caja abierta');

    const nueva = this.cajaRepo.create({
      saldoInicial,
      estado: EstadoCaja.ABIERTA,
      fechaApertura: new Date(),
    });
    return this.cajaRepo.save(nueva);
  }

  async cerrar(id: number, saldoFinal: number) {
    const caja = await this.findOne(id);
    if (caja.estado === EstadoCaja.CERRADA)
      throw new Error('La caja ya está cerrada');

    caja.estado = EstadoCaja.CERRADA;
    caja.saldoFinal = saldoFinal;
    caja.fechaCierre = new Date();
    return this.cajaRepo.save(caja);
  }

  async getResumen() {
    const cajaAbierta = await this.findAbierta();
    if (!cajaAbierta) return null;

    const totalRecaudado = cajaAbierta.pagos.reduce(
      (sum, p) => sum + Number(p.monto),
      0,
    );

    const totalEfectivo = cajaAbierta.pagos
      .filter((p) => p.metodoPago === MetodoPago.EFECTIVO)
      .reduce((sum, p) => sum + Number(p.monto), 0);

    return {
      id: cajaAbierta.id,
      saldoInicial: cajaAbierta.saldoInicial,
      totalRecaudado,
      totalEfectivo,
      fechaApertura: cajaAbierta.fechaApertura,
    };
  }
}
