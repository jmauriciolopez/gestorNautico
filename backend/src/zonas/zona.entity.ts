import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Marina } from '../marinas/marina.entity';
import { Rack } from '../racks/rack.entity';

@Entity('zonas')
export class Zona {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column({ nullable: true })
  marinaId: number;

  @ManyToOne(() => Marina, (marina) => marina.zonas)
  @JoinColumn({ name: 'marinaId' })
  marina: Marina;

  @OneToMany(() => Rack, (rack) => rack.zona)
  racks: Rack[];
}
