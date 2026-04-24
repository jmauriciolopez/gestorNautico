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
