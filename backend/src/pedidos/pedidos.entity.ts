import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  Index,
  JoinColumn,
} from 'typeorm';
import { Embarcacion } from '../embarcaciones/embarcaciones.entity';
import { Guarderia } from '../guarderias/guarderia.entity';

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
  @JoinColumn({ name: 'embarcacion_id' })
  embarcacion: Embarcacion;

  @Column({ nullable: true })
  observaciones: string;

  @Index()
  @Column({ type: 'int' })
  guarderiaId: number;

  @ManyToOne(() => Guarderia, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'guarderiaId' })
  guarderia: Guarderia;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
