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
import { Factura } from '../facturas/factura.entity';
import { Guarderia } from '../guarderias/guarderia.entity';

export enum TipoCargo {
  AMARRE = 'AMARRE',
  MANTENIMIENTO = 'MANTENIMIENTO',
  SERVICIOS = 'SERVICIOS',
  OTROS = 'OTROS',
}

@Index(['cliente', 'pagado', 'guarderiaId'])
@Entity('cargos')
export class Cargo {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @ManyToOne(() => Cliente, { nullable: false })
  @JoinColumn({ name: 'cliente_id' })
  cliente: Cliente;

  @Column({ length: 255 })
  descripcion: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  monto: number;

  @Column({ type: 'date' })
  fechaEmision: Date;

  @Index()
  @Column({ type: 'date', nullable: true })
  fechaVencimiento: Date;

  @Index()
  @Column({ default: false })
  pagado: boolean;

  @Column({ type: 'enum', enum: TipoCargo, default: TipoCargo.OTROS })
  tipo: TipoCargo;

  @Index()
  @ManyToOne(() => Factura, (factura) => factura.cargos, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'factura_id' })
  factura: Factura;

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
