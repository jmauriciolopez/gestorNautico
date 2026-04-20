import { IsString, IsNumber, IsOptional, Min, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateRackDto {
  @IsNotEmpty()
  @IsString()
  codigo: string;

  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  zonaId: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  pisos?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  filas?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  columnas?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  alto?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  ancho?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  largo?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  tarifaBase?: number;
}
