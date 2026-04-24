import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { SearchService } from './search.service';
import { AuthTokenGuard } from '../auth/guards/AuthTokenGuard';
import { TenantGuard } from '../auth/guards/tenant.guard';
import { TenantRoles } from '../auth/decorators/tenant-roles.decorator';
import { Role } from '../users/user.entity';
import { ActiveTenant } from '../auth/decorators/active-tenant.decorator';
import { TenantContext } from '../compartido/interfaces/tenant-context.interface';

@Controller('search')
@UseGuards(AuthTokenGuard, TenantGuard)
@TenantRoles(Role.SUPERADMIN, Role.ADMIN, Role.SUPERVISOR, Role.OPERADOR)
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  search(@ActiveTenant() tenant: TenantContext, @Query('q') query: string) {
    return this.searchService.search(tenant, query ?? '');
  }
}
