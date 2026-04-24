import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImportService, ImportResult } from './import.service';
import { AuthTokenGuard } from '../auth/guards/AuthTokenGuard';
import { TenantGuard } from '../auth/guards/tenant.guard';
import { TenantRoles } from '../auth/decorators/tenant-roles.decorator';
import { Role } from '../users/user.entity';
import { ActiveTenant } from '../auth/decorators/active-tenant.decorator';
import { TenantContext } from '../compartido/interfaces/tenant-context.interface';

interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination: string;
  filename: string;
  path: string;
  buffer: Buffer;
}

@Controller('import')
@UseGuards(AuthTokenGuard, TenantGuard)
export class ImportController {
  constructor(private readonly importService: ImportService) {}

  @Post('clientes')
  @TenantRoles(Role.SUPERADMIN, Role.ADMIN)
  @UseInterceptors(FileInterceptor('file'))
  async importClientes(
    @ActiveTenant() tenant: TenantContext,
    @UploadedFile() file: MulterFile,
  ): Promise<ImportResult> {
    if (!file || !file.buffer) {
      throw new BadRequestException('No se ha proporcionado ningún archivo');
    }

    const content = file.buffer.toString('utf-8');
    return this.importService.importClientes(tenant, content);
  }

  @Post('embarcaciones')
  @TenantRoles(Role.SUPERADMIN, Role.ADMIN)
  @UseInterceptors(FileInterceptor('file'))
  async importEmbarcaciones(
    @ActiveTenant() tenant: TenantContext,
    @UploadedFile() file: MulterFile,
  ): Promise<ImportResult> {
    if (!file || !file.buffer) {
      throw new BadRequestException('No se ha proporcionado ningún archivo');
    }

    const content = file.buffer.toString('utf-8');
    return this.importService.importEmbarcaciones(tenant, content);
  }
}
