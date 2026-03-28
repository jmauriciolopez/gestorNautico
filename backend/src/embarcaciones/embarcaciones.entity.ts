import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToOne, JoinColumn } from 'typeorm';
import { Cliente } from '../clientes/clientes.entity';
import { Espacio } from '../espacios/espacio.entity';

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

  @Column({ nullable: true })
  clienteId: number;

  @ManyToOne(() => Cliente, (cliente) => cliente.id)
  @JoinColumn({ name: 'clienteId' })
  cliente: Cliente;

  @Column({ nullable: true })
  espacioId: number;

  @OneToOne(() => Espacio, { nullable: true })
  @JoinColumn({ name: 'espacioId' })
  espacio: Espacio;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
