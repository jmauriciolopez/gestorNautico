import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards } from '@nestjs/common';
import { ClientesService } from './clientes.service';
import { Cliente } from './clientes.entity';
import { AuthTokenGuard } from '../auth/guards/AuthTokenGuard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../users/user.entity';

@Controller('clientes')
@UseGuards(AuthTokenGuard, RolesGuard)
@Roles(Role.SUPERADMIN, Role.ADMIN, Role.OPERADOR)
export class ClientesController {
  constructor(private readonly clientesService: ClientesService) {}

  @Get()
  findAll() {
    return this.clientesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.clientesService.findOne(+id);
  }

  @Post()
  create(@Body() createClienteDto: Partial<Cliente>) {
    return this.clientesService.create(createClienteDto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateClienteDto: Partial<Cliente>) {
    return this.clientesService.update(+id, updateClienteDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.clientesService.remove(+id);
  }
}
