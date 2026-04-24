import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  Index,
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

  @Index()
  @Column({ default: EstadoPedido.PENDIENTE })
  estado: EstadoPedido;

  @Index()
  @Column({ type: 'timestamp', nullable: true })
  fechaProgramada: Date;

  @Index()
  @ManyToOne(() => Embarcacion)
  embarcacion: Embarcacion;

  @Column({ nullable: true })
  observaciones: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
