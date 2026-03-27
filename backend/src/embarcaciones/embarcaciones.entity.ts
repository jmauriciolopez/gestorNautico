import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToOne, JoinColumn } from 'typeorm';
import { Cliente } from '../clientes/clientes.entity';
import { Espacio } from '../ubicaciones/ubicaciones.entity';

@Entity('embarcaciones')
export class Embarcacion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column()
  matricula: string;

  @Column({ nullable: true })
  marca: string;

  @Column({ nullable: true })
  modelo: string;

  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  eslora: number;

  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  manga: number;

  @Column({ default: 'Lancha' })
  tipo: string;

  @Column({ default: 'EN_CUNA' })
  estado: string; // EN_CUNA, EN_AGUA, MANTENIMIENTO, INACTIVA

  @ManyToOne(() => Cliente, (cliente) => cliente.id)
  cliente: Cliente;

  @OneToOne(() => Espacio, { nullable: true })
  @JoinColumn()
  espacio: Espacio;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
