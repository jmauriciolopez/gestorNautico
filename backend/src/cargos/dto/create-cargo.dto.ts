import {
  IsNumber,
  IsString,
  IsOptional,
  IsBoolean,
  IsDate,
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
  @IsDate()
  fechaEmision?: Date;

  @IsOptional()
  @IsBoolean()
  pagado?: boolean;

  @IsOptional()
  @IsEnum(TipoCargo)
  tipo?: TipoCargo;
}
