import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Guarderia } from '../guarderias/guarderia.entity';

@Injectable()
export class SeedGuarderiaService {
  private readonly logger = new Logger(SeedGuarderiaService.name);

  constructor(
    @InjectRepository(Guarderia)
    private readonly guarderiaRepository: Repository<Guarderia>,
  ) {}

  async ensureDefaultGuarderia(): Promise<Guarderia> {
    const defaultSlug = 'sede-central';
    let guarderia = await this.guarderiaRepository.findOne({
      where: { slug: defaultSlug },
    });

    if (!guarderia) {
      this.logger.log('🌱 Creando Guardería inicial (Sede Central)...');
      guarderia = this.guarderiaRepository.create({
        nombre: 'Sede Central',
        slug: defaultSlug,
        direccion: 'Av. Costanera 123',
        telefono: '555-0100',
        email: 'contacto@sedecentral.com',
        activo: true,
      });
      guarderia = await this.guarderiaRepository.save(guarderia);
    }

    return guarderia;
  }
}
