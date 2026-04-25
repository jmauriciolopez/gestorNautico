import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { TenantContext } from '../../compartido/interfaces/tenant-context.interface';

export const ActiveTenant = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): TenantContext => {
    const request = ctx.switchToHttp().getRequest();
    return request.tenant;
  },
);
