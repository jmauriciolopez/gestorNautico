import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { Ubicacion } from '../ubicaciones/ubicacion.entity';
import { Rack } from '../racks/rack.entity';
import { Guarderia } from '../guarderias/guarderia.entity';

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

  @Index()
  @Column({ type: 'int' })
  guarderiaId: number;

  @ManyToOne(() => Guarderia, { nullable: false })
  @JoinColumn({ name: 'guarderiaId' })
  guarderia: Guarderia;
}
