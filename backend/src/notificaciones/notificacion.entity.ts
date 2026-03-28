import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../users/user.entity';

export enum NotificacionTipo {
  INFO = 'INFO',
  EXITO = 'EXITO',
  ALERTA = 'ALERTA',
  SISTEMA = 'SISTEMA',
}

@Entity('notificaciones')
export class Notificacion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 200 })
  titulo: string;

  @Column({ type: 'text' })
  mensaje: string;

  @Column({ default: false })
  leida: boolean;

  @Column({
    type: 'enum',
    enum: NotificacionTipo,
    default: NotificacionTipo.INFO,
  })
  tipo: NotificacionTipo;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'usuarioId' })
  usuario: User;

  @Column()
  usuarioId: number;

  @CreateDateColumn()
  createdAt: Date;
}
