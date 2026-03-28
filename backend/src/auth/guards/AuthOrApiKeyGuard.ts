import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { authApiKeyValidation } from './AuthApikeyGuard';

@Injectable()
export class AuthOrApiKeyGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    const token = this.extractTokenFromHeader(request);
    if (token) {
      try {
        const payload: unknown = await this.jwtService.verifyAsync(token, {
          secret: this.configService.get<string>('JWT_SECRET'),
        });
        (request as Request & { user: unknown }).user = payload;
        return true;
      } catch {
        // Token failed, fall through to check API Key
      }
    }

    try {
      // Check API Key
      const validApiKey = this.configService.get<string>('API_KEY') || '';
      if (authApiKeyValidation(request, validApiKey)) {
        return true;
      }
    } catch {
      // API Key failed or missing
    }

    throw new UnauthorizedException();
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
