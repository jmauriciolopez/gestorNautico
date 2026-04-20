import { IsString, IsNumber, IsOptional, IsIn, IsNotEmpty, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

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
  @IsIn(['entrada', 'salida'])
  tipo: 'entrada' | 'salida';

  @IsOptional()
  @IsString()
  observaciones?: string;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  fecha?: Date;
}
