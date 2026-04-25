import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Cliente } from '../clientes/clientes.entity';
import { Embarcacion } from '../embarcaciones/embarcaciones.entity';
import { Caja, EstadoCaja } from '../cajas/caja.entity';
import { InitialDataService } from './initial-data.service';
import { ConfiguracionService } from '../configuracion/configuracion.service';

// Infraestructura
import { Ubicacion } from '../ubicaciones/ubicacion.entity';
import { Zona } from '../zonas/zona.entity';
import { Rack } from '../racks/rack.entity';
import { Espacio } from '../espacios/espacio.entity';
import { Guarderia } from '../guarderias/guarderia.entity';
import { SeedGuarderiaService } from './seed-guarderia.service';

@Injectable()
export class SeederService {
  private readonly logger = new Logger(SeederService.name);

  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Cliente)
    private readonly clienteRepo: Repository<Cliente>,
    @InjectRepository(Embarcacion)
    private readonly embarcacionRepo: Repository<Embarcacion>,
    @InjectRepository(Caja)
    private readonly cajaRepo: Repository<Caja>,
    @InjectRepository(Ubicacion)
    private readonly ubicacionRepo: Repository<Ubicacion>,
    @InjectRepository(Zona)
    private readonly zonaRepo: Repository<Zona>,
    @InjectRepository(Rack)
    private readonly rackRepo: Repository<Rack>,
    @InjectRepository(Espacio)
    private readonly espacioRepo: Repository<Espacio>,
    @InjectRepository(Guarderia)
    private readonly guarderiaRepo: Repository<Guarderia>,
    private readonly initialDataService: InitialDataService,
    private readonly configService: ConfiguracionService,
    private readonly seedGuarderiaService: SeedGuarderiaService,
  ) {}

  async seed() {
    this.logger.log('🚀 Iniciando proceso de Seeding dinámico...');

    // 1. Limpiar TODAS las tablas manejadas por TypeORM de forma segura con CASCADE
    const entities = this.dataSource.entityMetadatas;
    for (const entity of entities) {
      try {
        await this.dataSource.query(
          `TRUNCATE TABLE "${entity.tableName}" RESTART IDENTITY CASCADE`,
        );
        this.logger.debug(`Truncada tabla: ${entity.tableName}`);
      } catch (err: unknown) {
        const error = err as Error;
        this.logger.warn(
          `No se pudo truncar tabla ${entity.tableName}: ${error.message}`,
        );
      }
    }

    // 2. Restaurar Datos Maestros (Usuarios Admin, etc.)
    const defaultGuarderia =
      await this.seedGuarderiaService.ensureDefaultGuarderia();
    await this.initialDataService.syncAll();

    // 3. Restaurar Configuraciones Globales
    await this.configService.syncConfigs(defaultGuarderia.id);

    // 4. Crear Infraestructura Base (Requerido para E2E)
    const ub = await this.ubicacionRepo.save(
      this.ubicacionRepo.create({
        nombre: 'Puerto Principal',
        descripcion: 'Sede Central del Gestor Náutico',
        guarderia: defaultGuarderia,
      }),
    );
    const zona = await this.zonaRepo.save(
      this.zonaRepo.create({
        nombre: 'Guardería Principal',
        ubicacion: ub,
        guarderia: defaultGuarderia,
      }),
    );
    const rack = await this.rackRepo.save(
      this.rackRepo.create({
        codigo: 'MOD-A',
        zona: zona,
        pisos: 3,
        filas: 2,
        columnas: 2,
        guarderia: defaultGuarderia,
      }),
    );

    const espacios: Espacio[] = [];
    let count = 1;
    for (let p = 1; p <= 3; p++) {
      for (let f = 1; f <= 2; f++) {
        for (let c = 1; c <= 2; c++) {
          espacios.push(
            this.espacioRepo.create({
              numero: `CUNA-${count++}`,
              rack: rack,
              piso: p,
              fila: f,
              columna: c,
              ocupado: false,
              guarderia: defaultGuarderia,
            }),
          );
        }
      }
    }
    const cunas = await this.espacioRepo.save(espacios);

    // 5. Clientes Semilla
    const c1 = await this.clienteRepo.save(
      this.clienteRepo.create({
        nombre: 'Juan Pérez',
        telefono: '12345678',
        email: 'juan@test.com',
        dni: '20123456',
        guarderia: defaultGuarderia,
      }),
    );
    await this.clienteRepo.save(
      this.clienteRepo.create({
        nombre: 'María García',
        telefono: '87654321',
        email: 'maria@test.com',
        dni: '30123456',
        guarderia: defaultGuarderia,
      }),
    );

    // 6. Embarcaciones Semilla (Asignar una cuna a la primera)
    const e1 = this.embarcacionRepo.create({
      nombre: 'La Mary',
      matricula: 'MAT-001',
      eslora: 10,
      manga: 3,
      cliente: c1,
      espacio: cunas[0],
      guarderia: defaultGuarderia,
    });
    await this.embarcacionRepo.save(e1);

    // Marcar cuna como ocupada
    await this.espacioRepo.update(cunas[0].id, { ocupado: true });

    // 7. Caja Semilla
    await this.cajaRepo.save(
      this.cajaRepo.create({
        saldoInicial: 50000,
        estado: EstadoCaja.ABIERTA,
        fechaApertura: new Date(),
        guarderia: defaultGuarderia,
      }),
    );

    this.logger.log('✅ Seeding completado con éxito');

    return {
      message: 'Base de datos reseteada y sembrada con éxito',
      infraestructura: 'Puerto -> Guardería -> Módulo A (10 cunas)',
      clientes: 2,
      barcos: 1,
      caja: 'Abierta',
    };
  }
}
