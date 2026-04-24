import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  Index,
  JoinColumn,
} from 'typeorm';
import { Embarcacion } from '../embarcaciones/embarcaciones.entity';
import { Espacio } from '../espacios/espacio.entity';
import { Guarderia } from '../guarderias/guarderia.entity';

export enum TipoMovimiento {
  ENTRADA = 'entrada',
  SALIDA = 'salida',
  MOVIMIENTO_CUNA = 'movimiento_cuna',
}

@Entity('movimientos')
export class Movimiento {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  tipo: TipoMovimiento;

  @Index()
  @ManyToOne(() => Embarcacion)
  @JoinColumn({ name: 'embarcacion_id' })
  embarcacion: Embarcacion;

  @Index()
  @ManyToOne(() => Espacio)
  @JoinColumn({ name: 'espacio_id' })
  espacio: Espacio;

  @Index()
  @CreateDateColumn()
  fecha: Date;

  @Column({ nullable: true })
  observaciones: string;

  @Column({ default: false })
  fueraHora: boolean;

  @Index()
  @Column({ type: 'int' })
  guarderiaId: number;

  @ManyToOne(() => Guarderia, { nullable: false })
  @JoinColumn({ name: 'guarderiaId' })
  guarderia: Guarderia;
}
