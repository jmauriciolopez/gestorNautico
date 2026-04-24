import {
  IsString,
  IsNumber,
  IsOptional,
  IsIn,
  IsNotEmpty,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateEmbarcacionDto {
  @IsNotEmpty()
  @IsString()
  nombre: string;

  @IsNotEmpty()
  @IsString()
  matricula: string;

  @IsOptional()
  @IsString()
  marca?: string;

  @IsOptional()
  @IsString()
  modelo?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  eslora?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  manga?: number;

  @IsOptional()
  @IsString()
  tipo?: string;

  @IsOptional()
  @IsIn(['EN_CUNA', 'EN_AGUA', 'EN_MANTENIMIENTO', 'INACTIVA'])
  estado_operativo?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  clienteId?: number | null;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  espacioId?: number | null;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  descuento?: number;
}
