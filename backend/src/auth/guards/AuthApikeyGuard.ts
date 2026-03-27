import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthApikeyGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const apiKey = this.configService.get<string>('API_KEY') || '';
    return authApiKeyValidation(req, apiKey);
  }
}

export function authApiKeyValidation(req: any, validApiKey: string): boolean {
  const { apikey } = req.headers;
  if (apikey === validApiKey) return true;
  throw new UnauthorizedException();
}
