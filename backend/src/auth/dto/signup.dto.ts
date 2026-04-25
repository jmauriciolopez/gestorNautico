import {
  IsString,
  IsEmail,
  IsNotEmpty,
  MinLength,
  Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SignupDto {
  @ApiProperty({ example: 'Marina del Sol' })
  @IsString()
  @IsNotEmpty({ message: 'El nombre de la marina es requerido' })
  nombre: string;

  @ApiProperty({ example: 'Juan Pérez' })
  @IsString()
  @IsNotEmpty({ message: 'el nombre de contacto es requerido' })
  contacto: string;

  @ApiProperty({ example: 'admin' })
  @IsString()
  @IsNotEmpty({ message: 'El nombre de usuario es requerido' })
  @MinLength(4, { message: 'El usuario debe tener al menos 4 caracteres' })
  adminUsuario: string;

  @ApiProperty({ example: 'admin@marina.com' })
  @IsEmail({}, { message: 'El email no es válido' })
  @IsNotEmpty({ message: 'El email es requerido' })
  adminEmail: string;

  @ApiProperty({ example: 'Password123!' })
  @IsString()
  @IsNotEmpty({ message: 'La contraseña es requerida' })
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  adminPassword: string;
}
