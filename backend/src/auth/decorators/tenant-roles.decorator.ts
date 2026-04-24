import { SetMetadata } from '@nestjs/common';
import { Role } from '../../users/user.entity';

export const TENANT_ROLES_KEY = 'tenant_roles';
export const TenantRoles = (...roles: Role[]) => SetMetadata(TENANT_ROLES_KEY, roles);
