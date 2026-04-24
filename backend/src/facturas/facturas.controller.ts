import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Patch,
  Res,
  Query,
} from '@nestjs/common';
import { FacturasService } from './facturas.service';
import { AuthTokenGuard } from '../auth/guards/AuthTokenGuard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../users/user.entity';
import { Response } from 'express';
import { PdfService } from '../common/pdf/pdf.service';
import { CreateFacturaDto, UpdateFacturaDto } from './dto/create-factura.dto';
import {
  UpdateEstadoFacturaDto,
  SendEmailFacturaDto,
} from './dto/update-estado-factura.dto';

import { TenantGuard } from '../auth/guards/tenant.guard';
import { TenantRoles } from '../auth/decorators/tenant-roles.decorator';
import { ActiveTenant } from '../auth/decorators/active-tenant.decorator';
import { TenantContext } from '../compartido/interfaces/tenant-context.interface';

@Controller('facturas')
@UseGuards(AuthTokenGuard, TenantGuard, RolesGuard)
export class FacturasController {
  constructor(
    private readonly facturasService: FacturasService,
    private readonly pdfService: PdfService,
  ) {}

  @Get('next-numero')
  @TenantRoles(Role.ADMIN, Role.SUPERVISOR, Role.OPERADOR)
  async getNextNumero(@ActiveTenant() tenant: TenantContext) {
    const nextNumero = await this.facturasService.generateNextNumero(tenant);
    return { nextNumero };
  }

  @Get(':id/pdf')
  @TenantRoles(Role.ADMIN, Role.SUPERVISOR, Role.OPERADOR)
  async downloadPdf(
    @ActiveTenant() tenant: TenantContext,
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    const factura = await this.facturasService.findOne(tenant, +id);
    const buffer = await this.pdfService.generateInvoice(tenant, factura);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=factura-${factura.numero}.pdf`,
      'Content-Length': buffer.length,
    });

    res.end(buffer);
  }

  @Get('stats')
  @TenantRoles(Role.ADMIN, Role.SUPERVISOR, Role.OPERADOR)
  async getStats(
    @ActiveTenant() tenant: TenantContext,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.facturasService.getStats(tenant, startDate, endDate);
  }

  @Get()
  @TenantRoles(Role.ADMIN, Role.SUPERVISOR, Role.OPERADOR)
  findAll(
    @ActiveTenant() tenant: TenantContext,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.facturasService.findAll(tenant, {
      page,
      limit,
      search,
      startDate,
      endDate,
    });
  }

  @Get(':id')
  @TenantRoles(Role.ADMIN, Role.SUPERVISOR, Role.OPERADOR)
  findOne(@ActiveTenant() tenant: TenantContext, @Param('id') id: string) {
    return this.facturasService.findOne(tenant, +id);
  }

  @Post()
  @TenantRoles(Role.ADMIN, Role.SUPERVISOR)
  create(@ActiveTenant() tenant: TenantContext, @Body() data: CreateFacturaDto) {
    return this.facturasService.create(tenant, data);
  }

  @Patch(':id/estado')
  @TenantRoles(Role.ADMIN, Role.SUPERVISOR)
  updateEstado(
    @ActiveTenant() tenant: TenantContext,
    @Param('id') id: string,
    @Body() dto: UpdateEstadoFacturaDto,
  ) {
    return this.facturasService.updateEstado(
      tenant,
      +id,
      dto.estado,
      dto.metodoPago,
    );
  }

  @Patch(':id')
  @TenantRoles(Role.ADMIN)
  update(
    @ActiveTenant() tenant: TenantContext,
    @Param('id') id: string,
    @Body() data: UpdateFacturaDto,
  ) {
    return this.facturasService.update(tenant, +id, data);
  }

  @Post(':id/send-email')
  @TenantRoles(Role.ADMIN, Role.SUPERVISOR)
  sendEmail(
    @ActiveTenant() tenant: TenantContext,
    @Param('id') id: string,
    @Body() dto: SendEmailFacturaDto,
  ) {
    return this.facturasService.sendEmail(tenant, +id, dto.email);
  }

  @Delete(':id')
  @TenantRoles(Role.ADMIN, Role.SUPERVISOR)
  remove(@ActiveTenant() tenant: TenantContext, @Param('id') id: string) {
    return this.facturasService.remove(tenant, +id);
  }
}
