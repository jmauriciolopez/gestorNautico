import {
  IsString,
  IsOptional,
  IsBoolean,
  IsEmail,
  IsEnum,
} from 'class-validator';
import { Role } from '../entities/user.entity';

export class CreateUserDto {
  @IsString()
  nombre: string;

  @IsString()
  apellido: string;

  @IsString()
  usuario: string;

  @IsString()
  clave: string;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;

  @IsOptional()
  @IsEnum(Role)
  rol?: Role;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsBoolean()
  permisoCrearNoticias?: boolean;

  @IsOptional()
  @IsBoolean()
  permisoEditarNoticias?: boolean;

  @IsOptional()
  @IsBoolean()
  permisoEliminarNoticias?: boolean;

  @IsOptional()
  @IsBoolean()
  permisoPreportada?: boolean;

  @IsOptional()
  @IsBoolean()
  permisoComentarios?: boolean;
}
