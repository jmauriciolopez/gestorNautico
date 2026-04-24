import {
  IsString,
  IsOptional,
  IsBoolean,
  IsEmail,
  IsEnum,
} from 'class-validator';
import { Role } from '../user.entity';

export class CreateUserDto {
  @IsString()
  nombre: string;

  @IsOptional()
  @IsString()
  apellido?: string;

  @IsString()
  usuario: string;

  @IsString()
  clave: string;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;

  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @IsEmail()
  email: string;

  @IsOptional()
  guarderiaId?: number;
}
