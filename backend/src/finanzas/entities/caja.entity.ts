import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Pago } from './pago.entity';

export enum EstadoCaja {
  ABIERTA = 'ABIERTA',
  CERRADA = 'CERRADA',
}

@Entity('cajas')
export class Caja {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fechaApertura: Date;

  @Column({ type: 'timestamp', nullable: true })
  fechaCierre: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  saldoInicial: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  saldoFinal: number;

  @Column({ type: 'enum', enum: EstadoCaja, default: EstadoCaja.ABIERTA })
  estado: EstadoCaja;

  @OneToMany(() => Pago, pago => pago.caja)
  pagos: Pago[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
