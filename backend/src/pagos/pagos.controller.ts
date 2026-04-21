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

@Controller('pagos')
@UseGuards(AuthTokenGuard, RolesGuard)
export class PagosController {
  constructor(
    private readonly pagosService: PagosService,
    private readonly pdfService: PdfService,
  ) {}

  @Get(':id/pdf')
  @Roles(Role.SUPERADMIN, Role.ADMIN, Role.SUPERVISOR, Role.OPERADOR)
  async downloadPdf(@Param('id') id: string, @Res() res: Response) {
    const pago = await this.pagosService.findOne(+id);
    const buffer = await this.pdfService.generateReceipt(pago);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=recibo-pago-${id}.pdf`,
      'Content-Length': buffer.length,
    });

    res.end(buffer);
  }

  @Get()
  @Roles(Role.SUPERADMIN, Role.ADMIN, Role.SUPERVISOR, Role.OPERADOR)
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.pagosService.findAll({ page, limit });
  }

  @Get(':id')
  @Roles(Role.SUPERADMIN, Role.ADMIN, Role.SUPERVISOR, Role.OPERADOR)
  findOne(@Param('id') id: string) {
    return this.pagosService.findOne(+id);
  }

  @Post()
  @Roles(Role.SUPERADMIN, Role.ADMIN, Role.SUPERVISOR, Role.OPERADOR)
  create(@Body() data: CreatePagoDto) {
    return this.pagosService.create(data);
  }

  @Delete(':id')
  @Roles(Role.SUPERADMIN, Role.ADMIN, Role.SUPERVISOR)
  remove(@Param('id') id: string) {
    return this.pagosService.remove(+id);
  }
}
