import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Rack } from '../racks/rack.entity';
import { Embarcacion } from '../embarcaciones/embarcaciones.entity';
import { Guarderia } from '../guarderias/guarderia.entity';

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

  @Index()
  @Column({ nullable: true })
  rackId: number;

  @ManyToOne(() => Rack, (rack) => rack.espacios)
  @JoinColumn({ name: 'rackId' })
  rack: Rack;

  @OneToOne(() => Embarcacion, (embarcacion) => embarcacion.espacio)
  embarcacion: Embarcacion;

  @Index()
  @Column({ type: 'int' })
  guarderiaId: number;

  @ManyToOne(() => Guarderia, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'guarderiaId' })
  guarderia: Guarderia;
}
