import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Res,
  Query,
} from '@nestjs/common';
import { PagosService } from './pagos.service';
import { CreatePagoDto } from './dto/create-pago.dto';
import { AuthTokenGuard } from '../auth/guards/AuthTokenGuard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../users/user.entity';
import { Response } from 'express';
import { PdfService } from '../common/pdf/pdf.service';

import { TenantGuard } from '../auth/guards/tenant.guard';
import { TenantRoles } from '../auth/decorators/tenant-roles.decorator';
import { ActiveTenant } from '../auth/decorators/active-tenant.decorator';
import { TenantContext } from '../compartido/interfaces/tenant-context.interface';

@Controller('pagos')
@UseGuards(AuthTokenGuard, TenantGuard, RolesGuard)
export class PagosController {
  constructor(
    private readonly pagosService: PagosService,
    private readonly pdfService: PdfService,
  ) {}

  @Get(':id/pdf')
  @TenantRoles(Role.ADMIN, Role.SUPERVISOR, Role.OPERADOR)
  async downloadPdf(
    @ActiveTenant() tenant: TenantContext,
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    const pago = await this.pagosService.findOne(tenant, +id);
    const buffer = await this.pdfService.generateReceipt(tenant, pago);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=recibo-pago-${id}.pdf`,
      'Content-Length': buffer.length,
    });

    res.end(buffer);
  }

  @Get()
  @TenantRoles(Role.ADMIN, Role.SUPERVISOR, Role.OPERADOR)
  findAll(
    @ActiveTenant() tenant: TenantContext,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.pagosService.findAll(tenant, { page, limit });
  }

  @Get(':id')
  @TenantRoles(Role.ADMIN, Role.SUPERVISOR, Role.OPERADOR)
  findOne(@ActiveTenant() tenant: TenantContext, @Param('id') id: string) {
    return this.pagosService.findOne(tenant, +id);
  }

  @Post()
  @TenantRoles(Role.ADMIN, Role.SUPERVISOR, Role.OPERADOR)
  create(@ActiveTenant() tenant: TenantContext, @Body() data: CreatePagoDto) {
    return this.pagosService.create(tenant, data);
  }

  @Delete(':id')
  @TenantRoles(Role.ADMIN, Role.SUPERVISOR)
  remove(@ActiveTenant() tenant: TenantContext, @Param('id') id: string) {
    return this.pagosService.remove(tenant, +id);
  }
}
