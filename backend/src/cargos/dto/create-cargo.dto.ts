import {
  IsNumber,
  IsString,
  IsOptional,
  IsBoolean,
  IsDateString,
  IsEnum,
} from 'class-validator';
import { TipoCargo } from '../cargo.entity';

export class CreateCargoDto {
  @IsNumber()
  clienteId: number;

  @IsString()
  descripcion: string;

  @IsNumber()
  monto: number;

  @IsOptional()
  @IsDateString()
  fechaEmision?: string;

  @IsOptional()
  @IsBoolean()
  pagado?: boolean;

  @IsOptional()
  @IsEnum(TipoCargo)
  tipo?: TipoCargo;
}
