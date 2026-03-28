import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { RegistroServicio } from '../registros/registro.entity';

@Entity('servicios_catalogo')
export class Catalogo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  precioBase: number;

  @Column({ default: 'GENERAL' })
  categoria: string; // LAVADO, MECANICA, BOTADURA, etc.

  @Column({ default: true })
  activo: boolean;

  @OneToMany(
    () => RegistroServicio,
    (registro: RegistroServicio) => registro.servicio,
  )
  registros: RegistroServicio[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
