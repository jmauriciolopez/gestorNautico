import { IsIn, IsNotEmpty } from 'class-validator';

export class UpdatePedidoEstadoDto {
  @IsNotEmpty()
  @IsIn(['pendiente', 'en_proceso', 'completado', 'cancelado'])
  estado: string;
}
