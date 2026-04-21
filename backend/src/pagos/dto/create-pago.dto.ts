import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsEnum,
  IsString,
  IsPositive,
  IsDate,
} from 'class-validator';
import { Type } from 'class-transformer';
import { MetodoPago } from '../pago.entity';

export class CreatePagoDto {
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  clienteId: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  cargoId?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  cajaId?: number;

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  monto: number;

  @IsNotEmpty()
  @IsEnum(MetodoPago, {
    message: `metodo debe ser uno de: ${Object.values(MetodoPago).join(', ')}`,
  })
  metodo: MetodoPago;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  fecha?: Date;

  @IsOptional()
  @IsString()
  referencia?: string;

  @IsOptional()
  @IsString()
  notas?: string;
}
