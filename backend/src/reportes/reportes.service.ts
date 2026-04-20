import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Cargo } from '../cargos/cargo.entity';
import { Embarcacion } from '../embarcaciones/embarcaciones.entity';

@Injectable()
export class ReportesService {
  constructor(
    @InjectRepository(Cargo)
    private readonly cargoRepo: Repository<Cargo>,
    @InjectRepository(Embarcacion)
    private readonly embarcacionRepo: Repository<Embarcacion>,
  ) {}

  async getClientesMorosos() {
    const hoy = new Date();

    const cargosVencidos = await this.cargoRepo.find({
      where: { pagado: false, fechaVencimiento: LessThan(hoy) },
      relations: ['cliente'],
      order: { fechaVencimiento: 'ASC' },
    });

    // Agrupar por cliente
    const map = new Map<number, {
      clienteId: number;
      nombre: string;
      email: string;
      telefono: string;
      totalDeuda: number;
      cantidadCargos: number;
      diasMaxAtraso: number;
      fechaVencimientoMasAntigua: Date;
    }>();

    for (const cargo of cargosVencidos) {
      const dias = Math.floor(
        (hoy.getTime() - new Date(cargo.fechaVencimiento).getTime()) / 86400000,
      );
      const existing = map.get(cargo.cliente.id);
      if (existing) {
        existing.totalDeuda += Number(cargo.monto);
        existing.cantidadCargos += 1;
        if (dias > existing.diasMaxAtraso) existing.diasMaxAtraso = dias;
        if (new Date(cargo.fechaVencimiento) < existing.fechaVencimientoMasAntigua) {
          existing.fechaVencimientoMasAntigua = new Date(cargo.fechaVencimiento);
        }
      } else {
        map.set(cargo.cliente.id, {
          clienteId: cargo.cliente.id,
          nombre: cargo.cliente.nombre,
          email: cargo.cliente.email,
          telefono: cargo.cliente.telefono,
          totalDeuda: Number(cargo.monto),
          cantidadCargos: 1,
          diasMaxAtraso: dias,
          fechaVencimientoMasAntigua: new Date(cargo.fechaVencimiento),
        });
      }
    }

    return Array.from(map.values()).sort((a, b) => b.diasMaxAtraso - a.diasMaxAtraso);
  }

  async getMensualidadesConDescuentos() {
    const embarcaciones = await this.embarcacionRepo.find({
      where: { estado: 'EN_CUNA' },
      relations: ['cliente', 'espacio', 'espacio.rack'],
    });

    return embarcaciones
      .filter(e => e.cliente && e.espacio?.rack)
      .map(e => {
        const tarifaBase = Number(e.espacio!.rack!.tarifaBase);
        const descCliente = Number(e.cliente.descuento ?? 0);
        const descEmbarcacion = Number(e.descuento ?? 0);
        const montoDescCliente = tarifaBase * (descCliente / 100);
        const basePostCliente = tarifaBase - montoDescCliente;
        const montoDescEmbarcacion = basePostCliente * (descEmbarcacion / 100);
        const totalFinal = basePostCliente - montoDescEmbarcacion;

        return {
          clienteId: e.cliente.id,
          clienteNombre: e.cliente.nombre,
          descuentoCliente: descCliente,
          embarcacionId: e.id,
          embarcacionNombre: e.nombre,
          matricula: e.matricula,
          descuentoEmbarcacion: descEmbarcacion,
          rack: e.espacio!.rack!.codigo,
          espacio: e.espacio!.numero,
          tarifaBase,
          montoDescCliente: +montoDescCliente.toFixed(2),
          montoDescEmbarcacion: +montoDescEmbarcacion.toFixed(2),
          totalFinal: +totalFinal.toFixed(2),
        };
      })
      .sort((a, b) => a.clienteNombre.localeCompare(b.clienteNombre));
  }
}
