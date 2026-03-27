import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany } from 'typeorm';

@Entity('zonas')
export class Zona {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @OneToMany(() => Rack, (rack) => rack.zona)
  racks: Rack[];
}

@Entity('racks')
export class Rack {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  codigo: string;

  @ManyToOne(() => Zona, (zona) => zona.racks)
  zona: Zona;

  @OneToMany(() => Espacio, (espacio) => espacio.rack)
  espacios: Espacio[];
}

@Entity('espacios')
export class Espacio {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  numero: string;

  @Column({ default: false })
  ocupado: boolean;

  @ManyToOne(() => Rack, (rack) => rack.espacios)
  rack: Rack;
}
