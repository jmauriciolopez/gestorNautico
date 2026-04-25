import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger, BadRequestException } from '@nestjs/common';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';

import { HttpAdapterHost, BaseExceptionFilter } from '@nestjs/core';
import { Catch, ArgumentsHost } from '@nestjs/common';
import { exec } from 'child_process';
import * as os from 'os';
import { TenantInterceptor } from './common/interceptors/tenant.interceptor';

function systemBeep() {
  try {
    if (os.platform() === 'win32') {
      exec('powershell.exe -c "[console]::beep(800,300)"', () => {});
    } else {
      process.stdout.write('\x07');
    }
  } catch {
    // Ignorar errores del beep
  }
}

@Catch()
export class BeepExceptionFilter extends BaseExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    systemBeep(); // Terminal beep confiable
    super.catch(exception, host);
  }
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('CORS');

  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new BeepExceptionFilter(httpAdapter));

  const allowedOrigins = process.env.CORS_ORIGIN?.split(',').map((o) =>
    o.trim(),
  ) ?? [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:3000',
  ];

  logger.log(`Allowed origins: [${allowedOrigins.join(', ')}]`);

  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      // Permitir peticiones sin origin (curl, Postman, server-to-server)
      if (!origin) return callback(null, true);

      // Regex para permitir localhost y IPs de la red local (LAN)
      const isLocalOrLan =
        /^(http:\/\/localhost|http:\/\/127\.0\.0\.1|http:\/\/192\.168\.\d+\.\d+|http:\/\/172\.(1[6-9]|2\d|3[01])\.\d+\.\d+|http:\/\/10\.\d+\.\d+\.\d+)(:\d+)?$/.test(
          origin,
        );

      if (allowedOrigins.includes(origin) || isLocalOrLan) {
        callback(null, true);
      } else {
        logger.warn(
          `CORS rechazado — Origin: "${origin}" no está permitido por política de seguridad`,
        );
        callback(new Error(`CORS: origin "${origin}" no permitido`), false);
      }
    },
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders:
      'Content-Type, Accept, Authorization, X-Requested-With, Cookie, x-guarderia-id',
    exposedHeaders: 'Set-Cookie',
    optionsSuccessStatus: 204,
  });

  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      exceptionFactory: (errors) => {
        systemBeep(); // Beep confiable en errores de validación
        const logger = new Logger('ValidationPipe');
        const errorMessages = errors.flatMap((error) =>
          Object.values(error.constraints || {}),
        );
        logger.error(`Validation failed: ${errorMessages.join('. ')}`);
        return new BadRequestException(errorMessages);
      },
    }),
  );

  app.useGlobalInterceptors(new TenantInterceptor());

  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');
  logger.log(`Backend running on: http://localhost:${port}`);
}
bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});
