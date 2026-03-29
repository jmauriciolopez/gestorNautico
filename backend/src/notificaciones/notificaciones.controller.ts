import {
  Controller,
  Get,
  Patch,
  Post,
  Delete,
  Param,
  UseGuards,
  Req,
  Body,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthTokenGuard } from '../auth/guards/AuthTokenGuard';
import { NotificacionesService } from './notificaciones.service';
import { Notificacion } from './notificacion.entity';

interface RequestWithUser extends Request {
  user: {
    sub: number;
    username: string;
    role: string;
  };
}

@UseGuards(AuthTokenGuard)
@Controller('notificaciones')
export class NotificacionesController {
  constructor(private readonly notificacionesService: NotificacionesService) {}

  @Get()
  async getMyNotifications(
    @Req() request: RequestWithUser,
  ): Promise<Notificacion[]> {
    const userId = request.user.sub;
    return this.notificacionesService.findAllByUser(userId);
  }

  @Patch(':id/leer')
  async markAsRead(
    @Param('id') id: string,
    @Req() request: RequestWithUser,
  ): Promise<Notificacion> {
    const userId = request.user.sub;
    return this.notificacionesService.markAsRead(+id, userId);
  }

  @Post('leer-todas')
  async markAllAsRead(@Req() request: RequestWithUser): Promise<void> {
    const userId = request.user.sub;
    return this.notificacionesService.markAllAsRead(userId);
  }

  @Delete(':id')
  async deleteNotification(
    @Param('id') id: string,
    @Req() request: RequestWithUser,
  ): Promise<void> {
    const userId = request.user.sub;
    return this.notificacionesService.delete(+id, userId);
  }

  /**
   * Endpoint de diagnóstico: dispara un email de prueba
   * al destinatario indicado (o al email del usuario autenticado).
   * Usar solo en desarrollo para validar la configuración SMTP.
   */
  @Post('test-email')
  async sendTestEmail(
    @Req() request: RequestWithUser,
    @Body('to') to?: string,
  ): Promise<{ status: string; to: string }> {
    const targetEmail = to ?? `${request.user.username}@test.com`;
    await this.notificacionesService.sendEmailNotification(
      targetEmail,
      '🧪 Test de Configuración SMTP — Gestor Náutico',
      'aviso-deuda',
      {
        clienteNombre: 'Usuario de Prueba',
        facturas: [
          {
            numero: 'TEST-0001',
            fechaVencimiento: new Date().toLocaleDateString('es-AR'),
            total: '0.00',
          },
        ],
        totalAdeudado: '0.00',
        anio: new Date().getFullYear(),
      },
    );
    return { status: 'Email enviado (revisar logs si falló)', to: targetEmail };
  }
}
