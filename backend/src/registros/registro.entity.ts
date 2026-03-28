import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Catalogo } from '../catalogo/catalogo.entity';
import { Embarcacion } from '../embarcaciones/embarcaciones.entity';

export enum EstadoServicio {
  PENDIENTE = 'PENDIENTE',
  EN_PROCESO = 'EN_PROCESO',
  COMPLETADO = 'COMPLETADO',
  CANCELADO = 'CANCELADO',
}

@Entity('servicios_registros')
export class RegistroServicio {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  embarcacionId: number;

  @ManyToOne(() => Embarcacion)
  @JoinColumn({ name: 'embarcacionId' })
  embarcacion: Embarcacion;

  @Column()
  servicioId: number;

  @ManyToOne(() => Catalogo, (catalogo: Catalogo) => catalogo.registros)
  @JoinColumn({ name: 'servicioId' })
  servicio: Catalogo;

  @Column({ type: 'date' })
  fechaProgramada: string;

  @Column({ type: 'date', nullable: true })
  fechaCompletada: string;

  @Column({
    type: 'enum',
    enum: EstadoServicio,
    default: EstadoServicio.PENDIENTE,
  })
  estado: EstadoServicio;

  @Column({ type: 'text', nullable: true })
  observaciones: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  costoFinal: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
