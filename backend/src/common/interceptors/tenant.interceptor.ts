import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  ForbiddenException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Role } from '../../users/user.entity';

@Injectable()
export class TenantInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const guarderiaId = request.guarderiaId;

    // Si no hay usuario (ruta pública), intentamos construir un contexto básico si hay guarderiaId
    if (!user) {
      if (guarderiaId) {
        request['tenant'] = {
          guarderiaId: guarderiaId,
          scope: 'guarderia',
          role: null,
          userId: null,
        };
      }
      return next.handle();
    }

    // Determinar el scope
    const scope =
      user.role === Role.SUPERADMIN && !guarderiaId ? 'global' : 'guarderia';

    // Construir contexto del tenant
    request['tenant'] = {
      guarderiaId: guarderiaId || user.guarderiaId || null,
      scope,
      role: user.role,
      userId: user.id || user.sub,
    };

    return next.handle();
  }
}
