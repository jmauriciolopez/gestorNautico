import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface LoginAttempt {
  count: number;
  firstAttempt: number;
  lockedUntil?: number;
}

@Injectable()
export class LoginAttemptsService {
  private readonly attempts = new Map<string, LoginAttempt>();
  private readonly logger = new Logger(LoginAttemptsService.name);

  private readonly maxAttempts: number;
  private readonly lockoutDuration: number;
  private readonly cooldownPeriod: number;

  constructor(private readonly configService: ConfigService) {
    this.maxAttempts = this.configService.get<number>('LOGIN_MAX_ATTEMPTS') || 5;
    this.lockoutDuration =
      this.configService.get<number>('LOGIN_LOCKOUT_DURATION') || 15 * 60 * 1000;
    this.cooldownPeriod =
      this.configService.get<number>('LOGIN_COOLDOWN_PERIOD') || 30 * 60 * 1000;
  }

  private getKey(identifier: string, ip: string): string {
    return `${identifier}:${ip}`;
  }

  check(identifier: string, ip: string): void {
    const key = this.getKey(identifier, ip);
    const attempt = this.attempts.get(key);

    if (!attempt) {
      return;
    }

    const now = Date.now();

    if (attempt.lockedUntil && now < attempt.lockedUntil) {
      const remainingSeconds = Math.ceil((attempt.lockedUntil - now) / 1000);
      throw new UnauthorizedException(
        `Cuenta temporalmente bloqueada. Intenta de nuevo en ${remainingSeconds} segundos.`,
      );
    }

    if (attempt.lockedUntil && now >= attempt.lockedUntil) {
      this.attempts.delete(key);
    }
  }

  recordFailure(identifier: string, ip: string): void {
    const key = this.getKey(identifier, ip);
    const now = Date.now();
    const attempt = this.attempts.get(key);

    if (!attempt) {
      this.attempts.set(key, {
        count: 1,
        firstAttempt: now,
      });
      this.logger.warn(
        `Primer intento fallido para ${identifier} desde ${ip}. Intentos: 1/${this.maxAttempts}`,
      );
      return;
    }

    if (attempt.lockedUntil && now < attempt.lockedUntil) {
      return;
    }

    const newCount = attempt.count + 1;

    if (newCount >= this.maxAttempts) {
      const lockDuration = this.calculateLockoutDuration(attempt.count);
      const lockedUntil = now + lockDuration;

      this.attempts.set(key, {
        count: newCount,
        firstAttempt: attempt.firstAttempt,
        lockedUntil,
      });

      this.logger.warn(
        `Cuenta bloqueada para ${identifier} desde ${ip}. Intentos: ${newCount}. Bloqueado por ${lockDuration / 1000}s`,
      );

      throw new UnauthorizedException(
        `Demasiados intentos fallidos. Cuenta bloqueada por ${lockDuration / 60} minutos.`,
      );
    }

    this.attempts.set(key, {
      count: newCount,
      firstAttempt: attempt.firstAttempt,
    });

    this.logger.warn(
      `Intento fallido para ${identifier} desde ${ip}. Intentos: ${newCount}/${this.maxAttempts}`,
    );
  }

  recordSuccess(identifier: string, ip: string): void {
    const key = this.getKey(identifier, ip);
    this.attempts.delete(key);
    this.logger.log(`Login exitoso para ${identifier} desde ${ip}`);
  }

  private calculateLockoutDuration(failedAttempts: number): number {
    const baseLockout = this.lockoutDuration;
    const multiplier = Math.min(Math.floor(failedAttempts / this.maxAttempts), 4);
    return baseLockout * (multiplier + 1);
  }

  cleanup(): void {
    const now = Date.now();
    for (const [key, attempt] of this.attempts.entries()) {
      if (attempt.firstAttempt + this.cooldownPeriod < now) {
        this.attempts.delete(key);
      } else if (attempt.lockedUntil && attempt.lockedUntil < now) {
        this.attempts.delete(key);
      }
    }
  }
}
