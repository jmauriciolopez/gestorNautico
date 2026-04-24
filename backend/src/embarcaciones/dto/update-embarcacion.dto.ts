import {
  IsString,
  IsNumber,
  IsOptional,
  Min,
  Max,
  ValidateIf,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { EstadoEmbarcacion } from '../embarcaciones.entity';

export class UpdateEmbarcacionDto {
  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsString()
  matricula?: string;

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
  @ValidateIf((o: UpdateEmbarcacionDto) => o.clienteId !== null)
  @Type(() => Number)
  @IsNumber()
  clienteId?: number | null;

  @IsOptional()
  @ValidateIf((o: UpdateEmbarcacionDto) => o.espacioId !== null)
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
