import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Cliente } from '../clientes/clientes.entity';

export enum TipoCargo {
  AMARRE = 'AMARRE',
  MANTENIMIENTO = 'MANTENIMIENTO',
  SERVICIOS = 'SERVICIOS',
  OTROS = 'OTROS',
}

@Entity('cargos')
export class Cargo {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Cliente, { nullable: false, eager: true })
  @JoinColumn({ name: 'cliente_id' })
  cliente: Cliente;

  @Column({ length: 255 })
  descripcion: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  monto: number;

  @Column({ type: 'date' })
  fechaEmision: Date;

  @Column({ type: 'date', nullable: true })
  fechaVencimiento: Date;

  @Column({ default: false })
  pagado: boolean;

  @Column({ type: 'enum', enum: TipoCargo, default: TipoCargo.OTROS })
  tipo: TipoCargo;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
