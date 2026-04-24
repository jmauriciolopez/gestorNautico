import { IsEnum, IsNotEmpty } from 'class-validator';
import { EstadoPedido } from '../pedidos.entity';

export class UpdatePedidoEstadoDto {
  @IsNotEmpty()
  @IsEnum(EstadoPedido)
  estado: EstadoPedido;
}
