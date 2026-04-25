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

export enum Role {
  SUPERADMIN = 'SUPERADMIN', // Dueño del SaaS
  ADMIN = 'ADMIN', // Propietario de la guardería
  SUPERVISOR = 'SUPERVISOR', // Gestor operativo
  OPERADOR = 'OPERADOR', // Trabajo diario básico
}

@Entity('users')
@Unique(['usuario', 'guarderiaId'])
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 150 })
  nombre: string;

  @Column({ length: 150, nullable: true })
  apellido: string;

  @Column({ length: 50 })
  usuario: string;

  @Column({ length: 255 })
  clave: string;

  @Column({ default: true })
  activo: boolean;

  @Column({ type: 'enum', enum: Role, default: Role.OPERADOR })
  role: Role;

  @Column({ unique: true, nullable: true })
  email: string;

  @Index()
  @Column({ type: 'int', nullable: true })
  guarderiaId: number;

  @ManyToOne(() => Guarderia, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'guarderiaId' })
  guarderia: Guarderia;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
