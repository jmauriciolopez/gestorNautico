import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  Index,
} from 'typeorm';
import { Embarcacion } from '../embarcaciones/embarcaciones.entity';
import { Espacio } from '../espacios/espacio.entity';

@Entity('movimientos')
export class Movimiento {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  tipo: string; // entrada, salida

  @ManyToOne(() => Embarcacion)
  embarcacion: Embarcacion;

  @ManyToOne(() => Espacio)
  espacio: Espacio;

  @Index()
  @CreateDateColumn()
  fecha: Date;

  @Column({ nullable: true })
  observaciones: string;

  @Column({ default: false })
  fueraHora: boolean;
}
