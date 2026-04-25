import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Unique,
} from 'typeorm';

@Entity('configuracion')
@Unique(['clave', 'guarderiaId'])
export class Configuracion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  clave: string;

  @Column()
  valor: string;

  @Column({ nullable: true })
  descripcion: string;

  @Column({ type: 'int' })
  guarderiaId: number;

  @UpdateDateColumn()
  updatedAt: Date;
}
