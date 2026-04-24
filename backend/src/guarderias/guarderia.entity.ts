import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('guarderias')
export class Guarderia {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 150 })
  nombre: string;

  @Index()
  @Column({ length: 100, unique: true })
  slug: string;

  @Column({ length: 255, nullable: true })
  direccion: string;

  @Column({ length: 50, nullable: true })
  telefono: string;

  @Column({ unique: true, nullable: true })
  email: string;

  @Column({ default: true })
  activo: boolean;

  @Column({ type: 'text', nullable: true })
  logo: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  latitud: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  longitud: number;

  @Column({ nullable: true })
  ciudad: string;

  @Column({ nullable: true })
  pais: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}