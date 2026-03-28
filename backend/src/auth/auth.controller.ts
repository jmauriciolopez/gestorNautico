import {
  Controller,
  Post,
  Body,
  Res,
  Get,
  UseGuards,
  Req,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { AuthTokenGuard } from './guards/AuthTokenGuard';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { AuthResponse } from './auth-response.entity';
import { ConfigService } from '@nestjs/config';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthResponse> {
    const authData = await this.authService.login(loginDto);

    const isProd = this.configService.get('NODE_ENV') === 'production';
    void response.cookie('token', authData.accessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      path: '/',
      maxAge: (Number(authData.expiresIn) || 3600) * 1000,
    });

    return authData;
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) response: Response) {
    const isProd = this.configService.get('NODE_ENV') === 'production';
    void response.cookie('token', '', {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      path: '/',
      expires: new Date(0),
    });
    return { message: 'Sesión cerrada' };
  }

  @UseGuards(AuthTokenGuard)
  @Get('me')
  async getMe(@Req() request: Request): Promise<any> {
    const userId = request['user'].sub;
    const user = await this.authService.getInternalUser(userId); // Necesito este método o similar
    const { ...result } = user;
    return result;
  }
}
