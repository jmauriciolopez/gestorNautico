import { IsIn, IsNotEmpty } from 'class-validator';

export class UpdatePedidoEstadoDto {
  @IsNotEmpty()
  @IsIn(['pendiente', 'en_agua', 'finalizado', 'cancelado'])
  estado: string;
}
