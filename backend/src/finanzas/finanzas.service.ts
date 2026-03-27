import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Caja, EstadoCaja } from './entities/caja.entity';
import { Cargo } from './entities/cargo.entity';
import { Pago } from './entities/pago.entity';

@Injectable()
export class FinanzasService {
  constructor(
    @InjectRepository(Caja)
    private readonly cajaRepository: Repository<Caja>,
    @InjectRepository(Cargo)
    private readonly cargoRepository: Repository<Cargo>,
    @InjectRepository(Pago)
    private readonly pagoRepository: Repository<Pago>,
  ) {}

  // --- CARGOS ---
  async findAllCargos() {
    return this.cargoRepository.find({
      relations: ['cliente'],
      order: { fechaEmision: 'DESC' }
    });
  }

  async createCargo(data: any) {
    const { clienteId, ...rest } = data;
    const nuevo = this.cargoRepository.create({
      ...rest,
      cliente: { id: clienteId }
    });
    return this.cargoRepository.save(nuevo);
  }

  async findOneCargo(id: number) {
    const cargo = await this.cargoRepository.findOne({
      where: { id },
      relations: ['cliente']
    });
    if (!cargo) throw new NotFoundException('Cargo no encontrado');
    return cargo;
  }

  // --- PAGOS ---
  async findAllPagos() {
    return this.pagoRepository.find({
      relations: ['cliente', 'cargo', 'caja'],
      order: { fecha: 'DESC' }
    });
  }

  async createPago(data: any) {
    const { clienteId, cargoId, cajaId, ...rest } = data;
    
    // 1. Obtener una caja abierta (o usar la enviada)
    const caja = cajaId 
      ? await this.cajaRepository.findOneBy({ id: cajaId }) 
      : await this.cajaRepository.findOne({ where: { estado: EstadoCaja.ABIERTA } });
    
    if (!caja) throw new NotFoundException('No hay caja abierta para registrar el pago');

    // 2. Crear el pago
    const nuevoPago = this.pagoRepository.create({
      ...rest,
      cliente: { id: clienteId },
      cargo: cargoId ? { id: cargoId } : null,
      caja: caja
    });

    const pagoGuardado = await this.pagoRepository.save(nuevoPago);

    // 3. Si el pago está vinculado a un cargo, marcar el cargo como pagado
    if (cargoId) {
      await this.cargoRepository.update(cargoId, { pagado: true });
    }

    return pagoGuardado;
  }

  // --- CAJA ---
  async findAllCajas() {
    return this.cajaRepository.find({
      order: { createdAt: 'DESC' }
    });
  }

  async getCajaResumen() {
    const cajaAbierta = await this.cajaRepository.findOne({ 
      where: { estado: EstadoCaja.ABIERTA },
      relations: ['pagos']
    });
    
    if (!cajaAbierta) return null;

    const totalEfectivo = cajaAbierta.pagos
      .filter(p => p.metodoPago === 'EFECTIVO')
      .reduce((sum, p) => sum + Number(p.monto), 0);

    const totalRecaudado = cajaAbierta.pagos
      .reduce((sum, p) => sum + Number(p.monto), 0);

    return {
      id: cajaAbierta.id,
      saldoInicial: cajaAbierta.saldoInicial,
      totalRecaudado,
      totalEfectivo,
      fechaApertura: cajaAbierta.fechaApertura
    };
  }
}
