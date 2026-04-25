import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeederService } from './seeder.service';
import { InitialDataService } from './initial-data.service';
import { SeederController } from './database.controller';

// Entidades Maestras y Operativas
import { Cliente } from '../clientes/clientes.entity';
import { Embarcacion } from '../embarcaciones/embarcaciones.entity';
import { User } from '../users/user.entity';

// Entidades de Infraestructura (4-Niveles Planos)
import { Ubicacion } from '../ubicaciones/ubicacion.entity';
import { Zona } from '../zonas/zona.entity';
import { Rack } from '../racks/rack.entity';
import { Espacio } from '../espacios/espacio.entity';

// Entidades de Servicios
import { Catalogo } from '../catalogo/catalogo.entity';
import { RegistroServicio } from '../registros/registro.entity';

// Entidades Financieras
import { Caja } from '../cajas/caja.entity';
import { Cargo } from '../cargos/cargo.entity';
import { Pago } from '../pagos/pago.entity';
import { Factura } from '../facturas/factura.entity';

// Entidades Operativas
import { Movimiento } from '../movimientos/movimientos.entity';
import { Pedido } from '../pedidos/pedidos.entity';
import { ConfiguracionModule } from '../configuracion/configuracion.module';
import { Configuracion } from '../configuracion/configuracion.entity';

// Entidades de Negocio
import { Guarderia } from '../guarderias/guarderia.entity';
import { SeedGuarderiaService } from './seed-guarderia.service';

import { MigrationService } from './migration.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Cliente,
      Embarcacion,
      User,
      Ubicacion,
      Zona,
      Rack,
      Espacio,
      Catalogo,
      RegistroServicio,
      Caja,
      Cargo,
      Pago,
      Factura,
      Movimiento,
      Pedido,
      Configuracion,
      Guarderia,
    ]),
    ConfiguracionModule,
  ],
  providers: [
    SeederService,
    InitialDataService,
    SeedGuarderiaService,
    MigrationService,
  ],
  controllers: [SeederController],
  exports: [
    SeederService,
    InitialDataService,
    SeedGuarderiaService,
    MigrationService,
    TypeOrmModule,
  ],
})
export class DatabaseModule {}
