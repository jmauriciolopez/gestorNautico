import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
// Módulos Maestros y Base
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ClientesModule } from './clientes/clientes.module';
import { EmbarcacionesModule } from './embarcaciones/embarcaciones.module';
import { DatabaseModule } from './database/database.module';
import { DashboardModule } from './dashboard/dashboard.module';

// Módulos de Infraestructura (Planos)
import { MarinaModule } from './marinas/marina.module';
import { ZonasModule } from './zonas/zonas.module';
import { RacksModule } from './racks/racks.module';
import { EspaciosModule } from './espacios/espacios.module';

// Módulos Financieros (Planos)
import { CajasModule } from './cajas/cajas.module';
import { CargosModule } from './cargos/cargos.module';
import { PagosModule } from './pagos/pagos.module';
import { FacturasModule } from './facturas/facturas.module';

// Módulos Operativos (Planos)
import { MovimientosModule } from './movimientos/movimientos.module';
import { PedidosModule } from './pedidos/pedidos.module';

// Módulos de Servicios (Planos)
import { CatalogoModule } from './catalogo/catalogo.module';
import { RegistrosModule } from './registros/registros.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DATABASE_HOST'),
        port: configService.get<number>('DATABASE_PORT'),
        username: configService.get<string>('DATABASE_USERNAME'),
        password: configService.get<string>('DATABASE_PASSWORD'),
        database: configService.get<string>('DATABASE_NAME'),
        autoLoadEntities: true,
        synchronize: true, // Only for development
        ssl: configService.get<string>('DATABASE_SSL') === 'true' ? { rejectUnauthorized: false } : false,
      }),
    }),
    AuthModule,
    UsersModule,
    ClientesModule,
    EmbarcacionesModule,
    DatabaseModule,
    DashboardModule,
    MarinaModule,
    ZonasModule,
    RacksModule,
    EspaciosModule,
    CatalogoModule,
    RegistrosModule,
    CajasModule,
    CargosModule,
    PagosModule,
    FacturasModule,
    MovimientosModule,
    PedidosModule,
  ],
})
export class AppModule {}
