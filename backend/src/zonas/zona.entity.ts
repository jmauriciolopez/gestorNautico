import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Ubicacion } from '../ubicaciones/ubicacion.entity';
import { Rack } from '../racks/rack.entity';

@Entity('zonas')
export class Zona {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column({ nullable: true })
  ubicacionId: number;

  @ManyToOne(() => Ubicacion, (ubicacion) => ubicacion.zonas)
  @JoinColumn({ name: 'ubicacionId' })
  ubicacion: Ubicacion;

  @OneToMany(() => Rack, (rack) => rack.zona)
  racks: Rack[];
}
