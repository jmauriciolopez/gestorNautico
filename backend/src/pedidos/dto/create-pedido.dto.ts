import { IsNumber, IsOptional, IsString, IsDateString } from 'class-validator';

export class CreatePedidoDto {
  @IsNumber()
  embarcacionId: number;

  @IsOptional()
  @IsDateString()
  fechaProgramada?: string;

  @IsOptional()
  @IsString()
  observaciones?: string;
}
