import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Patch,
} from '@nestjs/common';
import { FacturasService } from './facturas.service';
import { AuthTokenGuard } from '../auth/guards/AuthTokenGuard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../users/user.entity';
import { EstadoFactura } from './factura.entity';

@Controller('facturas')
@UseGuards(AuthTokenGuard, RolesGuard)
export class FacturasController {
  constructor(private readonly facturasService: FacturasService) {}

  @Get()
  @Roles(Role.SUPERADMIN, Role.ADMIN, Role.OPERADOR)
  findAll() {
    return this.facturasService.findAll();
  }

  @Get(':id')
  @Roles(Role.SUPERADMIN, Role.ADMIN, Role.OPERADOR)
  findOne(@Param('id') id: string) {
    return this.facturasService.findOne(+id);
  }

  @Get('next-numero')
  @Roles(Role.SUPERADMIN, Role.ADMIN, Role.OPERADOR)
  getNextNumero() {
    return this.facturasService.generateNextNumero();
  }

  @Post()
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  create(
    @Body()
    data: {
      clienteId: number;
      numero?: string;
      fechaEmision: string;
      cargoIds: number[];
      observaciones?: string;
    },
  ) {
    return this.facturasService.create(data);
  }

  @Patch(':id/estado')
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  updateEstado(@Param('id') id: string, @Body('estado') estado: EstadoFactura) {
    return this.facturasService.updateEstado(+id, estado);
  }

  @Delete(':id')
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.facturasService.remove(+id);
  }
}
