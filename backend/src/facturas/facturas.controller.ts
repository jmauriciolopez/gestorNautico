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
  BadRequestException,
} from '@nestjs/common';
import { FacturasService } from './facturas.service';
import { AuthTokenGuard } from '../auth/guards/AuthTokenGuard';
import { RolesGuard } from '../auth/guards/roles.guard';
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
import { Public } from '../auth/decorators/public.decorator';

@Controller('facturas')
@UseGuards(AuthTokenGuard, TenantGuard, RolesGuard)
export class FacturasController {
  constructor(
    private readonly facturasService: FacturasService,
    private readonly pdfService: PdfService,
  ) {}

  @Get('next-numero')
  @TenantRoles(Role.ADMIN)
  async getNextNumero(@ActiveTenant() tenant: TenantContext) {
    const nextNumero = await this.facturasService.generateNextNumero(tenant);
    return { nextNumero };
  }

  @Public()
  @Get('public/:token')
  async findByToken(@Param('token') token: string) {
    return this.facturasService.findByTokenPublic(token);
  }

  @Public()
  @Get('public/:token/pdf')
  async downloadPdfPublic(
    @Param('token') token: string,
    @Res() res: any,
  ) {
    const { buffer, numero } = await this.facturasService.generatePdfByToken(token);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=factura-${numero}.pdf`,
      'Content-Length': buffer.length,
    });

    res.end(buffer);
  }

  @Public()
  @Post('public/reportar-pago')
  async reportarPago(
    @Body()
    body: {
      token: string;
      idComprobante: string;
      fechaPago: string;
      medioPago: string;
      observaciones?: string;
    },
  ) {
    if (!body.token || !body.idComprobante) {
      throw new BadRequestException('Faltan datos requeridos para el reporte');
    }

    return this.facturasService.reportarPagoByToken(
      body.token,
      {
        idComprobante: body.idComprobante,
        fechaPago: body.fechaPago,
        medioPago: body.medioPago,
        observaciones: body.observaciones,
      },
    );
  }

  @Get(':id/pdf')
  @TenantRoles(Role.ADMIN)
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
  @TenantRoles(Role.ADMIN)
  async getStats(
    @ActiveTenant() tenant: TenantContext,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.facturasService.getStats(tenant, startDate, endDate);
  }

  @Get()
  @TenantRoles(Role.ADMIN)
  findAll(
    @ActiveTenant() tenant: TenantContext,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('soloReportados') soloReportados?: string,
  ) {
    return this.facturasService.findAll(tenant, {
      page,
      limit,
      search,
      startDate,
      endDate,
      soloReportados: soloReportados === 'true',
    });
  }

  @Get(':id')
  @TenantRoles(Role.ADMIN)
  findOne(@ActiveTenant() tenant: TenantContext, @Param('id') id: string) {
    return this.facturasService.findOne(tenant, +id);
  }

  @Post()
  @TenantRoles(Role.ADMIN)
  create(
    @ActiveTenant() tenant: TenantContext,
    @Body() data: CreateFacturaDto,
  ) {
    return this.facturasService.create(tenant, data);
  }

  @Patch(':id/estado')
  @TenantRoles(Role.ADMIN)
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
  @TenantRoles(Role.ADMIN)
  sendEmail(
    @ActiveTenant() tenant: TenantContext,
    @Param('id') id: string,
    @Body() dto: SendEmailFacturaDto,
  ) {
    return this.facturasService.sendEmail(tenant, +id, dto.email);
  }

  @Delete(':id')
  @TenantRoles(Role.ADMIN)
  remove(@ActiveTenant() tenant: TenantContext, @Param('id') id: string) {
    return this.facturasService.remove(tenant, +id);
  }
}
