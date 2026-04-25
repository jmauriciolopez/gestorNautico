import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import { GuarderiaService } from './guarderia.service';
import { CreateGuarderiaDto } from './dto/create-guarderia.dto';
import { UpdateGuarderiaDto } from './dto/update-guarderia.dto';
import { AuthTokenGuard } from '../auth/guards/AuthTokenGuard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../users/user.entity';
import { TenantGuard } from '../auth/guards/tenant.guard';
import { GlobalRoute } from '../auth/decorators/global-route.decorator';

@Controller('guarderias')
@UseGuards(AuthTokenGuard, TenantGuard, RolesGuard)
export class GuarderiaController {
  constructor(private readonly guarderiaService: GuarderiaService) {}

  @Post()
  @Roles(Role.SUPERADMIN)
  @GlobalRoute()
  create(@Body() createGuarderiaDto: CreateGuarderiaDto) {
    return this.guarderiaService.create(createGuarderiaDto);
  }

  @Get()
  @Roles(Role.SUPERADMIN)
  @GlobalRoute()
  findAll() {
    return this.guarderiaService.findAll(true);
  }

  @Get(':id')
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  @GlobalRoute()
  async findOne(@Req() req: any, @Param('id') id: string) {
    const user = req.user;
    if (user.role === Role.ADMIN && user.guarderiaId !== +id) {
      throw new ForbiddenException('No tienes acceso a esta guardería');
    }
    return this.guarderiaService.findOne(+id);
  }

  @Patch(':id')
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  @GlobalRoute()
  async update(
    @Req() req: any,
    @Param('id') id: string,
    @Body() updateGuarderiaDto: UpdateGuarderiaDto,
  ) {
    const user = req.user;
    if (user.role === Role.ADMIN && user.guarderiaId !== +id) {
      throw new ForbiddenException('No tienes acceso a esta guardería');
    }
    return this.guarderiaService.update(+id, updateGuarderiaDto);
  }

  @Delete(':id')
  @Roles(Role.SUPERADMIN)
  remove(@Param('id') id: string) {
    return this.guarderiaService.remove(+id);
  }

  @Patch(':id/finish-onboarding')
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  @GlobalRoute()
  async finishOnboarding(
    @Req() req: any,
    @Param('id') id: string,
    @Body() updateGuarderiaDto: UpdateGuarderiaDto,
  ) {
    const user = req.user;
    if (user.role === Role.ADMIN && user.guarderiaId !== +id) {
      throw new ForbiddenException('No tienes acceso a esta guardería');
    }
    return this.guarderiaService.update(+id, updateGuarderiaDto);
  }
}
