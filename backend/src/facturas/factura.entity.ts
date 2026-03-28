import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
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

  @ManyToOne(() => Cliente, { nullable: false, eager: true })
  @JoinColumn({ name: 'cliente_id' })
  cliente: Cliente;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total: number;

  @Column({ type: 'date' })
  fechaEmision: Date;

  @Column({
    type: 'enum',
    enum: EstadoFactura,
    default: EstadoFactura.PENDIENTE,
  })
  estado: EstadoFactura;

  @Column({ type: 'text', nullable: true })
  observaciones: string;

  @OneToMany(() => Cargo, (cargo) => cargo.factura)
  cargos: Cargo[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
