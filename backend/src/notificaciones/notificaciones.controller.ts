import {
  Controller,
  Get,
  Patch,
  Post,
  Delete,
  Param,
  UseGuards,
  Req,
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
}
