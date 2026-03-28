import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { Embarcacion } from '../embarcaciones/embarcaciones.entity';

@Entity('pedidos')
export class Pedido {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: 'pendiente' })
  estado: string; // pendiente, en_proceso, completado, cancelado

  @Column({ type: 'timestamp', nullable: true })
  fechaProgramada: Date;

  @ManyToOne(() => Embarcacion)
  embarcacion: Embarcacion;

  @CreateDateColumn()
  createdAt: Date;
}
