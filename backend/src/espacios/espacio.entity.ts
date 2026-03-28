import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Rack } from '../racks/rack.entity';
import { Embarcacion } from '../embarcaciones/embarcaciones.entity';
import { OneToOne } from 'typeorm';

@Entity('espacios')
export class Espacio {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  numero: string;

  @Column({ default: false })
  ocupado: boolean;

  @Column({ type: 'int', nullable: true })
  piso: number;

  @Column({ type: 'int', nullable: true })
  fila: number;

  @Column({ type: 'int', nullable: true })
  columna: number;

  @Column({ nullable: true })
  rackId: number;

  @ManyToOne(() => Rack, (rack) => rack.espacios)
  @JoinColumn({ name: 'rackId' })
  rack: Rack;

  @OneToOne(() => Embarcacion, (embarcacion) => embarcacion.espacio)
  embarcacion: Embarcacion;
}
