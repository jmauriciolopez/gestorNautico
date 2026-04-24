import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { Cliente } from '../clientes/clientes.entity';
import { Cargo } from '../cargos/cargo.entity';

export enum EstadoFactura {
  PENDIENTE = 'PENDIENTE',
  PAGADA = 'PAGADA',
  ANULADA = 'ANULADA',
}

@Entity('facturas')
export class Factura {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  numero: string;

  @Index()
  @ManyToOne(() => Cliente, { nullable: false })
  @JoinColumn({ name: 'cliente_id' })
  cliente: Cliente;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total: number;

  @Index()
  @Column({ type: 'date' })
  fechaEmision: Date;

  @Column({ type: 'date', nullable: true })
  fechaVencimiento: Date;

  @Index()
  @Column({
    type: 'enum',
    enum: EstadoFactura,
    default: EstadoFactura.PENDIENTE,
  })
  estado: EstadoFactura;

  @Column({ type: 'text', nullable: true })
  observaciones: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  interesMoratorio: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  recargo: number;

  @Column({ type: 'date', nullable: true })
  fechaAplicacionMora: Date;

  @OneToMany(() => Cargo, (cargo) => cargo.factura)
  cargos: Cargo[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
