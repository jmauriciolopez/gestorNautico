import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
//import configuration from '../../config/configuration';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class AuthSupportkeyGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request>();
    const supportkey = req.headers['supportkey'];
    const secret = this.configService.get<string>('SUPPORT_KEY');
    if (supportkey && supportkey === secret) return true;
    throw new UnauthorizedException('Invalid or missing support key');
  }
}
