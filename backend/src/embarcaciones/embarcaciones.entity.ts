import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Cliente } from '../clientes/clientes.entity';
import { Espacio } from '../espacios/espacio.entity';

@Entity('embarcaciones')
export class Embarcacion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column({ unique: true })
  matricula: string;

  @Column({ nullable: true })
  marca: string;

  @Column({ nullable: true })
  modelo: string;

  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  eslora: number;

  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  manga: number;

  @Column({ default: 'Lancha' })
  tipo: string;

  @Index()
  @Column({ name: 'estado_operativo', default: 'EN_CUNA' })
  estado_operativo: string; // EN_CUNA, EN_AGUA, EN_MANTENIMIENTO, INACTIVA

  @Column({ nullable: true })
  clienteId: number;

  @Column('decimal', { precision: 5, scale: 2, default: 0 })
  descuento: number;

  @ManyToOne(() => Cliente, (cliente) => cliente.id)
  @JoinColumn({ name: 'clienteId' })
  cliente: Cliente;

  @Index()
  @Column({ nullable: true })
  espacioId: number;

  @OneToOne(() => Espacio, (espacio) => espacio.embarcacion, { nullable: true })
  @JoinColumn({ name: 'espacioId' })
  espacio: Espacio;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
