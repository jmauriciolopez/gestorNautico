import {
  IsString,
  IsEmail,
  IsOptional,
  IsBoolean,
  IsNumber,
  Min,
  Max,
} from 'class-validator';

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

  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(31)
  diaFacturacion?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  descuento?: number;

  @IsString()
  @IsOptional()
  tipoCuota?: string;

  @IsNumber()
  @IsOptional()
  responsableFamiliaId?: number;
}
