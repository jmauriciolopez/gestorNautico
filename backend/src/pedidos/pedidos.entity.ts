import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';
import { Embarcacion } from '../embarcaciones/embarcaciones.entity';

export enum EstadoPedido {
  PENDIENTE = 'pendiente',
  EN_AGUA = 'en_agua',
  FINALIZADO = 'finalizado',
  CANCELADO = 'cancelado',
}

@Entity('pedidos')
export class Pedido {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: EstadoPedido.PENDIENTE })
  estado: EstadoPedido;

  @Column({ type: 'timestamp', nullable: true })
  fechaProgramada: Date;

  @ManyToOne(() => Embarcacion)
  embarcacion: Embarcacion;

  @Column({ nullable: true })
  observaciones: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
