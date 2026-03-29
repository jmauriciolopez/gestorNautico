import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Cliente } from '../clientes/clientes.entity';
import { Embarcacion } from '../embarcaciones/embarcaciones.entity';

export enum EstadoSolicitud {
  PENDIENTE = 'PENDIENTE',
  CONFIRMADA = 'CONFIRMADA',
  COMPLETADA = 'COMPLETADA',
  CANCELADA = 'CANCELADA',
}

@Entity('solicitudes_bajada')
export class SolicitudBajada {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  clienteId: number;

  @ManyToOne(() => Cliente)
  @JoinColumn({ name: 'clienteId' })
  cliente: Cliente;

  @Column()
  embarcacionId: number;

  @ManyToOne(() => Embarcacion)
  @JoinColumn({ name: 'embarcacionId' })
  embarcacion: Embarcacion;

  @Column({ type: 'timestamp' })
  fechaHoraDeseada: Date;

  @Column({
    type: 'enum',
    enum: EstadoSolicitud,
    default: EstadoSolicitud.PENDIENTE,
  })
  estado: EstadoSolicitud;

  @Column({ nullable: true })
  observaciones: string;

  @Column({ default: false })
  emailConfirmado: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
