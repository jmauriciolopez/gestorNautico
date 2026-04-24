import {
  IsString,
  IsEmail,
  IsOptional,
  IsBoolean,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateClienteDto {
  @IsString()
  nombre: string;

  @IsString()
  dni: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  telefono?: string;

  @IsBoolean()
  @IsOptional()
  activo?: boolean;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(31)
  diaFacturacion?: number;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  descuento?: number;

  @IsString()
  @IsOptional()
  tipoCuota?: string;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  responsableFamiliaId?: number;
}
