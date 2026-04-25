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
import { Embarcacion } from '../embarcaciones/embarcaciones.entity';
import { Guarderia } from '../guarderias/guarderia.entity';

export enum EstadoSolicitud {
  PENDIENTE = 'PENDIENTE', // Solicitada
  EN_AGUA = 'EN_AGUA', // Marca bajada (en el agua)
  FINALIZADA = 'FINALIZADA', // Vuelta a la cuna (completada)
  CANCELADA = 'CANCELADA', // Cancelada
}

@Entity('solicitudes_bajada')
export class SolicitudBajada {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column()
  clienteId: number;

  @ManyToOne(() => Cliente)
  @JoinColumn({ name: 'clienteId' })
  cliente: Cliente;

  @Index()
  @Column()
  embarcacionId: number;

  @ManyToOne(() => Embarcacion)
  @JoinColumn({ name: 'embarcacionId' })
  embarcacion: Embarcacion;

  @Column({ type: 'timestamp' })
  fechaHoraDeseada: Date;

  @Index()
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
