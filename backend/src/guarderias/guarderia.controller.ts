import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
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
@Roles(Role.SUPERADMIN)
@GlobalRoute()
export class GuarderiaController {
  constructor(private readonly guarderiaService: GuarderiaService) {}

  @Post()
  create(@Body() createGuarderiaDto: CreateGuarderiaDto) {
    return this.guarderiaService.create(createGuarderiaDto);
  }

  @Get()
  findAll() {
    return this.guarderiaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.guarderiaService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateGuarderiaDto: UpdateGuarderiaDto,
  ) {
    return this.guarderiaService.update(+id, updateGuarderiaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.guarderiaService.remove(+id);
  }
}