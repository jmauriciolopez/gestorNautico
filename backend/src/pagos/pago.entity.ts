import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Cliente } from '../clientes/clientes.entity';
import { Cargo } from '../cargos/cargo.entity';
import { Caja } from '../cajas/caja.entity';
import { Guarderia } from '../guarderias/guarderia.entity';

export enum MetodoPago {
  EFECTIVO = 'EFECTIVO',
  TRANSFERENCIA = 'TRANSFERENCIA',
  TARJETA = 'TARJETA',
  CHEQUE = 'CHEQUE',
}

@Entity('pagos')
export class Pago {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @ManyToOne(() => Cliente, { nullable: false })
  @JoinColumn({ name: 'cliente_id' })
  cliente: Cliente;

  @Index()
  @ManyToOne(() => Caja, (caja) => caja.pagos, { nullable: false })
  @JoinColumn({ name: 'caja_id' })
  caja: Caja;

  @ManyToOne(() => Cargo, { nullable: true })
  @JoinColumn({ name: 'cargo_id' })
  cargo: Cargo;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  monto: number;

  @Index()
  @Column({ type: 'date' })
  fecha: Date;

  @Column({ type: 'enum', enum: MetodoPago, default: MetodoPago.EFECTIVO })
  metodoPago: MetodoPago;

  @Column({ length: 255, nullable: true })
  comprobante: string;

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
