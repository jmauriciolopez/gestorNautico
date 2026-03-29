import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Cliente } from '../clientes/clientes.entity';
import { Embarcacion } from '../embarcaciones/embarcaciones.entity';
import { Rack } from '../racks/rack.entity';

export interface SearchResult {
  clientes: Pick<Cliente, 'id' | 'nombre' | 'dni' | 'email'>[];
  embarcaciones: Pick<
    Embarcacion,
    'id' | 'nombre' | 'matricula' | 'tipo' | 'estado'
  >[];
  racks: Pick<Rack, 'id' | 'codigo'>[];
}

@Injectable()
export class SearchService {
  constructor(
    @InjectRepository(Cliente)
    private readonly clienteRepo: Repository<Cliente>,
    @InjectRepository(Embarcacion)
    private readonly embarcacionRepo: Repository<Embarcacion>,
    @InjectRepository(Rack)
    private readonly rackRepo: Repository<Rack>,
  ) {}

  async search(query: string): Promise<SearchResult> {
    if (!query || query.trim().length < 2) {
      return { clientes: [], embarcaciones: [], racks: [] };
    }

    const term = `%${query.trim()}%`;

    const [clientes, embarcaciones, racks] = await Promise.all([
      this.clienteRepo.find({
        where: [
          { nombre: ILike(term) },
          { dni: ILike(term) },
          { email: ILike(term) },
        ],
        select: ['id', 'nombre', 'dni', 'email'],
        take: 5,
      }),
      this.embarcacionRepo.find({
        where: [{ nombre: ILike(term) }, { matricula: ILike(term) }],
        select: ['id', 'nombre', 'matricula', 'tipo', 'estado'],
        take: 5,
      }),
      this.rackRepo.find({
        where: [{ codigo: ILike(term) }],
        select: ['id', 'codigo'],
        take: 5,
      }),
    ]);

    return { clientes, embarcaciones, racks };
  }
}
