import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cliente } from '../clientes/clientes.entity';
import { Embarcacion } from '../embarcaciones/embarcaciones.entity';
import { Caja, EstadoCaja } from '../finanzas/entities/caja.entity';
import { User } from '../users/entities/user.entity';
import { InitialDataService } from './initial-data.service';

@Injectable()
export class SeederService {
  constructor(
    @InjectRepository(Cliente)
    private readonly clienteRepo: Repository<Cliente>,
    @InjectRepository(Embarcacion)
    private readonly embarcacionRepo: Repository<Embarcacion>,
    @InjectRepository(Caja)
    private readonly cajaRepo: Repository<Caja>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly initialDataService: InitialDataService,
  ) {}

  async seed() {
    // 1. Limpiar datos previos (Solo en modo dev/test!)
    // Nota: Guardar orden de borrado por FKs
    await this.embarcacionRepo.delete({});
    await this.clienteRepo.delete({});
    await this.cajaRepo.delete({});
    await this.userRepo.delete({});

    // 2. Restaurar Datos Maestros (Permanentes)
    await this.initialDataService.syncAll();

    // 3. Clientes Semilla (Datos de prueba volátiles)
    const c1 = this.clienteRepo.create({ nombre: 'Juan Pérez', telefono: '12345678', email: 'juan@test.com', dni: '20123456' });
    const c2 = this.clienteRepo.create({ nombre: 'María García', telefono: '87654321', email: 'maria@test.com', dni: '30123456' });
    const clientes = await this.clienteRepo.save([c1, c2]);

    // 3. Embarcaciones Semilla
    const b1 = this.embarcacionRepo.create({ nombre: 'La Mary', matricula: 'MAT-001', eslora: 10, manga: 3, cliente: clientes[0] });
    const b2 = this.embarcacionRepo.create({ nombre: 'El Titán', matricula: 'MAT-002', eslora: 15, manga: 4, cliente: clientes[1] });
    await this.embarcacionRepo.save([b1, b2]);

    // 4. Caja Semilla (Abierta para tests financieros)
    const caja = this.cajaRepo.create({
      saldoInicial: 50000,
      estado: EstadoCaja.ABIERTA,
      fechaApertura: new Date(),
    });
    await this.cajaRepo.save(caja);

    return { message: 'Base de datos sembrada con éxito', clientes: clientes.length, barcos: 2 };
  }
}
