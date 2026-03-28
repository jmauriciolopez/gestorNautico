import {
  IsNumber,
  IsString,
  IsOptional,
  IsBoolean,
  IsDate,
} from 'class-validator';

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
}
