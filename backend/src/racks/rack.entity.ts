import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Zona } from '../zonas/zona.entity';
import { Espacio } from '../espacios/espacio.entity';

@Entity('racks')
export class Rack {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  codigo: string;

  @Column({ type: 'int', default: 1 })
  filas: number;

  @Column({ type: 'int', default: 1 })
  columnas: number;

  // Dimensiones en Metros
  @Column('decimal', { precision: 5, scale: 2, default: 0 })
  ancho: number;

  @Column('decimal', { precision: 5, scale: 2, default: 0 })
  alto: number;

  @Column('decimal', { precision: 5, scale: 2, default: 0 })
  largo: number;

  @Column({ nullable: true })
  zonaId: number;

  @ManyToOne(() => Zona, (zona) => zona.racks)
  @JoinColumn({ name: 'zonaId' })
  zona: Zona;

  @OneToMany(() => Espacio, (espacio: Espacio) => espacio.rack)
  espacios: Espacio[];
}
