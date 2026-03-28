import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class AuthApikeyGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request>();
    const apiKey = this.configService.get<string>('API_KEY') || '';
    return authApiKeyValidation(req, apiKey);
  }
}

export function authApiKeyValidation(
  req: Request,
  validApiKey: string,
): boolean {
  const apikey = req.headers['apikey'];
  if (apikey === validApiKey) return true;
  throw new UnauthorizedException();
}
