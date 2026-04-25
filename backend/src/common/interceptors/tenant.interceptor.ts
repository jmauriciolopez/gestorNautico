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

    // Para roles no-SuperAdmin: el guarderiaId del header DEBE coincidir con el del token
    // Esto previene que un usuario intente acceder a datos de otra sede enviando un header diferente
    if (user.role !== Role.SUPERADMIN && user.guarderiaId && guarderiaId) {
      if (Number(guarderiaId) !== Number(user.guarderiaId)) {
        throw new ForbiddenException('No tienes acceso a esta guardería');
      }
    }

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
