import { Role } from '../../users/user.entity';

export interface JwtUser {
  sub: number;
  id: number;
  usuario: string;
  role: Role;
  guarderiaId?: number | null;
}

export interface TenantContext {
  guarderiaId: number | null;
  scope: 'global' | 'guarderia';
  role: Role;
  userId: number;
}
