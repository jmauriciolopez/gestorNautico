import { IsEnum, IsOptional } from 'class-validator';
import { EstadoFactura } from '../factura.entity';
import { MetodoPago } from '../../pagos/pago.entity';

export class UpdateEstadoFacturaDto {
  @IsEnum(EstadoFactura, {
    message: `estado debe ser uno de: ${Object.values(EstadoFactura).join(', ')}`,
  })
  estado: EstadoFactura;

  @IsOptional()
  @IsEnum(MetodoPago, {
    message: `metodoPago debe ser uno de: ${Object.values(MetodoPago).join(', ')}`,
  })
  metodoPago?: MetodoPago;
}

export class SendEmailFacturaDto {
  @IsOptional()
  email?: string;
}
