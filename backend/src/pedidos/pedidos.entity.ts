import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';
import { Embarcacion } from '../embarcaciones/embarcaciones.entity';

@Entity('pedidos')
export class Pedido {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: 'pendiente' })
  estado: string; // pendiente, en_agua, finalizado, cancelado

  @Column({ type: 'timestamp', nullable: true })
  fechaProgramada: Date;

  @ManyToOne(() => Embarcacion)
  embarcacion: Embarcacion;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
