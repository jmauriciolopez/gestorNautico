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
  Unique,
} from 'typeorm';
import { Cliente } from '../clientes/clientes.entity';
import { Espacio } from '../espacios/espacio.entity';
import { Guarderia } from '../guarderias/guarderia.entity';

export enum EstadoEmbarcacion {
  EN_CUNA = 'EN_CUNA',
  EN_AGUA = 'EN_AGUA',
  MANTENIMIENTO = 'EN_MANTENIMIENTO',
  INACTIVA = 'INACTIVA',
  BLOQUEADA = 'BLOQUEADA',
}

@Entity('embarcaciones')
@Unique(['matricula', 'guarderiaId'])
export class Embarcacion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column()
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
  @Column({
    name: 'estado_operativo',
    default: EstadoEmbarcacion.EN_CUNA,
  })
  estado_operativo: EstadoEmbarcacion;

  @Index()
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
