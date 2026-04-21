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

@Controller('facturas')
@UseGuards(AuthTokenGuard, RolesGuard)
export class FacturasController {
  constructor(
    private readonly facturasService: FacturasService,
    private readonly pdfService: PdfService,
  ) {}

  @Get('next-numero')
  @Roles(Role.SUPERADMIN, Role.ADMIN, Role.SUPERVISOR, Role.OPERADOR)
  async getNextNumero() {
    const nextNumero = await this.facturasService.generateNextNumero();
    return { nextNumero };
  }

  @Get(':id/pdf')
  @Roles(Role.SUPERADMIN, Role.ADMIN, Role.SUPERVISOR, Role.OPERADOR)
  async downloadPdf(@Param('id') id: string, @Res() res: Response) {
    const factura = await this.facturasService.findOne(+id);
    const buffer = await this.pdfService.generateInvoice(factura);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=factura-${factura.numero}.pdf`,
      'Content-Length': buffer.length,
    });

    res.end(buffer);
  }

  @Get('stats')
  @Roles(Role.SUPERADMIN, Role.ADMIN, Role.SUPERVISOR, Role.OPERADOR)
  async getStats(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.facturasService.getStats(startDate, endDate);
  }

  @Get()
  @Roles(Role.SUPERADMIN, Role.ADMIN, Role.SUPERVISOR, Role.OPERADOR)
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.facturasService.findAll({
      page,
      limit,
      search,
      startDate,
      endDate,
    });
  }

  @Get(':id')
  @Roles(Role.SUPERADMIN, Role.ADMIN, Role.SUPERVISOR, Role.OPERADOR)
  findOne(@Param('id') id: string) {
    return this.facturasService.findOne(+id);
  }

  @Post()
  @Roles(Role.SUPERADMIN, Role.ADMIN, Role.SUPERVISOR)
  create(@Body() data: CreateFacturaDto) {
    return this.facturasService.create(data);
  }

  @Patch(':id/estado')
  @Roles(Role.SUPERADMIN, Role.ADMIN, Role.SUPERVISOR)
  updateEstado(@Param('id') id: string, @Body() dto: UpdateEstadoFacturaDto) {
    return this.facturasService.updateEstado(+id, dto.estado, dto.metodoPago);
  }

  @Patch(':id')
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  update(@Param('id') id: string, @Body() data: UpdateFacturaDto) {
    return this.facturasService.update(+id, data);
  }

  @Post(':id/send-email')
  @Roles(Role.SUPERADMIN, Role.ADMIN, Role.SUPERVISOR)
  sendEmail(@Param('id') id: string, @Body() dto: SendEmailFacturaDto) {
    return this.facturasService.sendEmail(+id, dto.email);
  }

  @Delete(':id')
  @Roles(Role.SUPERADMIN, Role.ADMIN, Role.SUPERVISOR)
  remove(@Param('id') id: string) {
    return this.facturasService.remove(+id);
  }
}
