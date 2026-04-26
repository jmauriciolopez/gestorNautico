import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { SeedGuarderiaService } from './seed-guarderia.service';

@Injectable()
export class MigrationService {
  private readonly logger = new Logger(MigrationService.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly seedGuarderiaService: SeedGuarderiaService,
  ) {}

  async migrateToMultiTenant() {
    this.logger.log('🚀 Iniciando migración masiva a Multi-Tenant...');

    // 1. Asegurar que existe la guardería por defecto
    const defaultGuarderia =
      await this.seedGuarderiaService.ensureDefaultGuarderia();
    const guarderiaId = defaultGuarderia.id;

    // 2. Lista de tablas que requieren guarderiaId
    // Nota: Usamos SQL directo para evitar problemas de tipos si las entidades aún no están 100% actualizadas
    const tables = [
      'usuarios',
      'clientes',
      'embarcaciones',
      'pedidos',
      'movimientos',
      'facturas',
      'pagos',
      'cargos',
      'ubicaciones',
      'zonas',
      'racks',
      'espacios',
      'catalogo',
      'registros_servicios',
      'cajas',
      'configuraciones',
    ];

    for (const table of tables) {
      try {
        // Asignar guarderiaId = 1 a todos los registros que lo tengan NULL
        const query = `UPDATE "${table}" SET "guarderiaId" = $1 WHERE "guarderiaId" IS NULL`;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const result = await this.dataSource.query(query, [guarderiaId]);
        this.logger.log(
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          `✅ Tabla "${table}": ${result[1] || 0} registros migrados.`,
        );
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        this.logger.warn(
          `⚠️ No se pudo migrar la tabla "${table}": ${message}`,
        );
      }
    }

    // 3. Casos especiales: Superadmin no debe tener guardería
    try {
      await this.dataSource.query(
        `UPDATE "usuarios" SET "guarderiaId" = NULL WHERE "role" = 'SUPERADMIN'`,
      );
      this.logger.log(
        '✅ Usuarios SUPERADMIN desvinculados de guarderías específicas.',
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      this.logger.warn(`⚠️ No se pudo limpiar SUPERADMIN: ${message}`);
    }

    this.logger.log('🏁 Migración finalizada.');
  }
}
