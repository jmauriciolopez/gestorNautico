import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('configuracion')
export class Configuracion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  clave: string;

  @Column()
  valor: string;

  @Column({ nullable: true })
  descripcion: string;

  @UpdateDateColumn()
  updatedAt: Date;
}
