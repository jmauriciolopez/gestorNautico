import {
  IsString,
  IsNumber,
  IsOptional,
  IsNotEmpty,
  IsDate,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';

import { TipoMovimiento } from '../movimientos.entity';

export class CreateMovimientoDto {
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  embarcacionId: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  espacioId?: number;

  @IsNotEmpty()
  @IsEnum(TipoMovimiento)
  tipo: TipoMovimiento;

  @IsOptional()
  @IsString()
  observaciones?: string;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  fecha?: Date;
}
