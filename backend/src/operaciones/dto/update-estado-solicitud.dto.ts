import { IsEnum, IsOptional, IsString } from 'class-validator';
import { EstadoSolicitud } from '../solicitud-bajada.entity';

export class UpdateEstadoSolicitudDto {
  @IsEnum(EstadoSolicitud, {
    message: `estado debe ser uno de: ${Object.values(EstadoSolicitud).join(', ')}`,
  })
  estado: EstadoSolicitud;

  @IsOptional()
  @IsString()
  motivo?: string;
}
