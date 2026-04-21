import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { RacksService } from './racks.service';
import { CreateRackDto } from './dto/create-rack.dto';
import { UpdateRackDto } from './dto/update-rack.dto';
import { AuthTokenGuard } from '../auth/guards/AuthTokenGuard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../users/user.entity';

@Controller('racks')
@UseGuards(AuthTokenGuard, RolesGuard)
export class RacksController {
  constructor(private readonly racksService: RacksService) {}

  @Get()
  @Roles(Role.SUPERADMIN, Role.ADMIN, Role.SUPERVISOR, Role.OPERADOR)
  findAll(@Query('page') page?: number, @Query('limit') limit?: number) {
    return this.racksService.findAll({ page, limit });
  }

  @Get(':id')
  @Roles(Role.SUPERADMIN, Role.ADMIN, Role.SUPERVISOR, Role.OPERADOR)
  findOne(@Param('id') id: string) {
    return this.racksService.findOne(+id);
  }

  @Post()
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  create(@Body() data: CreateRackDto) {
    return this.racksService.create(data);
  }

  @Put(':id')
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  update(@Param('id') id: string, @Body() data: UpdateRackDto) {
    return this.racksService.update(+id, data);
  }

  @Delete(':id')
  @Roles(Role.SUPERADMIN)
  remove(@Param('id') id: string) {
    return this.racksService.remove(+id);
  }
}
