import {
  IsString,
  IsNotEmpty,
  IsDateString,
  IsOptional,
} from 'class-validator';

export class CreateSolicitudBajadaDto {
  @IsString()
  @IsNotEmpty()
  dni: string;

  @IsString()
  @IsNotEmpty()
  matricula: string;

  @IsDateString()
  @IsNotEmpty()
  fechaHoraDeseada: string;

  @IsString()
  @IsOptional()
  observaciones?: string;
}
