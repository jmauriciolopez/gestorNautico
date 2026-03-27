import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FinanzasModule } from './finanzas/finanzas.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ClientesModule } from './clientes/clientes.module';
import { EmbarcacionesModule } from './embarcaciones/embarcaciones.module';
import { OperacionesModule } from './operaciones/operaciones.module';
import { DatabaseModule } from './database/database.module';
import * as dotenv from 'dotenv';

dotenv.config();

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST,
      port: parseInt(process.env.DATABASE_PORT, 10),
      username: process.env.DATABASE_USERNAME,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true, // Only for development
      ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
    }),
    FinanzasModule,
    AuthModule,
    UsersModule,
    ClientesModule,
    EmbarcacionesModule,
    OperacionesModule,
    DatabaseModule,
  ],
})
export class AppModule {}
