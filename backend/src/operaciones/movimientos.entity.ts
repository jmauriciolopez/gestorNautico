import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne } from 'typeorm';
import { Embarcacion } from '../embarcaciones/embarcaciones.entity';
import { Espacio } from '../ubicaciones/ubicaciones.entity';

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

  @CreateDateColumn()
  fecha: Date;

  @Column({ nullable: true })
  observaciones: string;
}
