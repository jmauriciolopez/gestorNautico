import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum Role {
  SUPERADMIN = 'SUPERADMIN', // Dueño del SaaS
  ADMIN = 'ADMIN', // Propietario de la guardería
  SUPERVISOR = 'SUPERVISOR', // Gestor operativo
  OPERADOR = 'OPERADOR', // Trabajo diario básico
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 150 })
  nombre: string;

  @Column({ length: 150, nullable: true })
  apellido: string;

  @Column({ length: 50, unique: true })
  usuario: string;

  @Column({ length: 255 })
  clave: string;

  @Column({ default: true })
  activo: boolean;

  @Column({ type: 'enum', enum: Role, default: Role.OPERADOR })
  role: Role;

  @Column({ unique: true, nullable: true })
  email: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
