import { IsNumber, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class AbrirCajaDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  saldoInicial?: number;
}

export class CerrarCajaDto {
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  saldoFinal: number;
}
