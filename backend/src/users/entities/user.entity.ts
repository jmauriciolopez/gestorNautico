import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum Role {
  SUPERADMIN = 'superadmin',
  ADMIN = 'admin',
  PERIODISTA = 'periodista',
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

  @Column({ type: 'enum', enum: Role, default: Role.PERIODISTA })
  rol: Role;

  @Column({ default: false })
  permisoCrearNoticias: boolean;

  @Column({ default: false })
  permisoEditarNoticias: boolean;

  @Column({ default: false })
  permisoEliminarNoticias: boolean;

  @Column({ default: false })
  permisoPreportada: boolean;

  @Column({ default: false })
  permisoComentarios: boolean;

  @Column({ unique: true, nullable: true })
  email: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
