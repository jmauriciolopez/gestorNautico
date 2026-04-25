import {
  IsString,
  IsNumber,
  IsOptional,
  IsNotEmpty,
  Min,
  Max,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { EstadoEmbarcacion } from '../embarcaciones.entity';

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
  @IsEnum(EstadoEmbarcacion)
  estado_operativo?: EstadoEmbarcacion;

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
