import { Global, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoginAttemptsService } from './login-attempts.service';
import { GuarderiasModule } from '../guarderias/guarderias.module';
import { TrialGuard } from './guards/trial.guard';

@Global()
@Module({
  imports: [
    UsersModule,
    ConfigModule,
    GuarderiasModule,
    JwtModule.registerAsync({
      global: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get('JWT_EXPIRES_IN') || '1d',
        },
      }),
    }),
  ],

  controllers: [AuthController],
  providers: [AuthService, LoginAttemptsService, TrialGuard],
  exports: [AuthService, JwtModule, LoginAttemptsService, TrialGuard],
})
export class AuthModule {}
