import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Guarderia } from '../guarderias/guarderia.entity';

@Entity('clientes')
@Unique(['dni', 'guarderiaId'])
export class Cliente {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column()
  dni: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  telefono: string;

  @Column({ default: true })
  activo: boolean;

  @Column({ type: 'int', default: 1 })
  diaFacturacion: number;

  @Column('decimal', { precision: 5, scale: 2, default: 0 })
  descuento: number;

  @Column({ default: 'NINGUNA' })
  tipoCuota: string; // INDIVIDUAL, FAMILIAR, NINGUNA

  @Column({ nullable: true })
  responsableFamiliaId: number;

  @Index()
  @Column({ type: 'int' })
  guarderiaId: number;

  @ManyToOne(() => Guarderia, { nullable: false })
  @JoinColumn({ name: 'guarderiaId' })
  guarderia: Guarderia;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
