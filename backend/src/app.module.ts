import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ClientesModule } from './clientes/clientes.module';
import { EmbarcacionesModule } from './embarcaciones/embarcaciones.module';
import { DatabaseModule } from './database/database.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { UbicacionesModule } from './ubicaciones/ubicaciones.module';
import { ZonasModule } from './zonas/zonas.module';
import { RacksModule } from './racks/racks.module';
import { EspaciosModule } from './espacios/espacios.module';
import { CajasModule } from './cajas/cajas.module';
import { CargosModule } from './cargos/cargos.module';
import { PagosModule } from './pagos/pagos.module';
import { FacturasModule } from './facturas/facturas.module';
import { MovimientosModule } from './movimientos/movimientos.module';
import { PedidosModule } from './pedidos/pedidos.module';
import { NotificacionesModule } from './notificaciones/notificaciones.module';
import { CatalogoModule } from './catalogo/catalogo.module';
import { RegistrosModule } from './registros/registros.module';
import { OperacionesModule } from './operaciones/operaciones.module';
import { SearchModule } from './search/search.module';
import { PdfModule } from './common/pdf/pdf.module';
import { ConfiguracionModule } from './configuracion/configuracion.module';
import { ReportesModule } from './reportes/reportes.module';
import { MoraModule } from './mora/mora.module';
import { ImportModule } from './import/import.module';
import { GuarderiasModule } from './guarderias/guarderias.module';
import { ScheduleModule } from '@nestjs/schedule';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/adapters/handlebars.adapter';
import { join } from 'path';
import { APP_GUARD } from '@nestjs/core';
import { TrialGuard } from './auth/guards/trial.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ScheduleModule.forRoot(),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const mailHost = configService.get<string>('MAIL_HOST');
        if (!mailHost) return {}; // optional: mail deshabilitado
        return {
          transport: {
            host: mailHost,
            port: configService.get<number>('MAIL_PORT'),
            secure: configService.get<string>('MAIL_SECURE') === 'true',
            auth: {
              user: configService.get<string>('MAIL_USER'),
              pass: configService.get<string>('MAIL_PASS'),
            },
          },
          defaults: {
            from: `"Gestor Náutico" <${configService.get<string>('MAIL_FROM')}>`,
          },
          template: {
            dir: join(__dirname, 'notificaciones/templates'),
            adapter: new HandlebarsAdapter(),
            options: { strict: true },
          },
        };
      },
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
        ssl:
          configService.get<string>('DATABASE_SSL') === 'true'
            ? { rejectUnauthorized: false }
            : false,
      }),
    }),
    AuthModule,
    UsersModule,
    ClientesModule,
    EmbarcacionesModule,
    DatabaseModule,
    DashboardModule,
    UbicacionesModule,
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
    NotificacionesModule,
    OperacionesModule,
    ConfiguracionModule,
    SearchModule,
    PdfModule,
    ReportesModule,
    MoraModule,
    ImportModule,
    GuarderiasModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: TrialGuard,
    },
  ],
})
export class AppModule {}
