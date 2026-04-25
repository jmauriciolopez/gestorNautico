import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pago } from './pago.entity';
import { CajasService } from '../cajas/cajas.service';
import { CargosService } from '../cargos/cargos.service';
import { CreatePagoDto } from './dto/create-pago.dto';
import {
  paginate,
  PaginationQuery,
} from '../common/pagination/pagination.helper';

import { BaseTenantService } from '../compartido/bases/base-tenant.service';
import { TenantContext } from '../compartido/interfaces/tenant-context.interface';
import { Cliente } from '../clientes/clientes.entity';

@Injectable()
export class PagosService extends BaseTenantService {
  constructor(
    @InjectRepository(Pago)
    private readonly pagoRepo: Repository<Pago>,
    @InjectRepository(Cliente)
    private readonly clienteRepo: Repository<Cliente>,
    private readonly cajasService: CajasService,
    private readonly cargosService: CargosService,
  ) {
    super();
  }

  findAll(tenant: TenantContext, query: PaginationQuery = {}) {
    return paginate(this.pagoRepo, query, {
      where: this.buildTenantWhere(tenant),
      relations: ['cliente', 'cargo', 'caja'],
      order: { fecha: 'DESC' },
    });
  }

  async findOne(tenant: TenantContext, id: number) {
    const pago = await this.pagoRepo.findOne({
      where: this.buildTenantWhere(tenant, { id }),
      relations: ['cliente', 'cargo', 'caja'],
    });
    if (!pago) throw new NotFoundException(`Pago con ID ${id} no encontrado`);
    return pago;
  }

  async create(tenant: TenantContext, data: CreatePagoDto) {
    const { clienteId, cargoId, cajaId, metodo, referencia, ...rest } = data;

    // Validar que el cliente pertenezca al tenant
    const cliente = await this.clienteRepo.findOne({
      where: this.buildTenantWhere(tenant, { id: Number(clienteId) }),
    });
    if (!cliente) {
      throw new BadRequestException(
        `El cliente ${clienteId} no pertenece a esta sede`,
      );
    }

    // 1. Obtener una caja abierta
    const caja = cajaId
      ? await this.cajasService.findOne(tenant, cajaId)
      : await this.cajasService.findAbierta(tenant);

    if (!caja)
      throw new NotFoundException('No hay caja abierta para registrar el pago');

    // 2. Crear el pago
    const nuevoPago = this.pagoRepo.create({
      ...rest,
      metodoPago: metodo,
      comprobante: referencia,
      cliente: { id: Number(clienteId) },
      cargo: cargoId ? { id: Number(cargoId) } : null,
      caja: caja,
      guarderiaId: tenant.guarderiaId as number,
    });

    const pagoGuardado = await this.pagoRepo.save(nuevoPago);

    // 3. Si el pago está vinculado a un cargo, marcarlo como pagado
    if (cargoId) {
      await this.cargosService.setPagado(tenant, Number(cargoId), true);
    }

    return this.findOne(tenant, pagoGuardado.id);
  }

  async remove(tenant: TenantContext, id: number) {
    const pago = await this.findOne(tenant, id);
    // Si tenía un cargo, revertimos el estado pagado
    if (pago.cargo) {
      await this.cargosService.setPagado(tenant, pago.cargo.id, false);
    }
    return this.pagoRepo.remove(pago);
  }
}
