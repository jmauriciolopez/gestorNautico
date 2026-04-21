import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsArray,
  ArrayMinSize,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateFacturaDto {
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  clienteId: number;

  @IsOptional()
  @IsString()
  numero?: string;

  @IsNotEmpty()
  @IsDateString()
  fechaEmision: string;

  @IsOptional()
  @IsDateString()
  fechaVencimiento?: string;

  @IsArray()
  @ArrayMinSize(1, { message: 'Se debe seleccionar al menos un cargo' })
  @IsNumber({}, { each: true })
  @Type(() => Number)
  cargoIds: number[];

  @IsOptional()
  @IsString()
  observaciones?: string;
}

export class UpdateFacturaDto {
  @IsOptional()
  @IsDateString()
  fechaEmision?: string;

  @IsOptional()
  @IsDateString()
  fechaVencimiento?: string;

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  @Type(() => Number)
  cargoIds?: number[];

  @IsOptional()
  @IsString()
  observaciones?: string;
}
