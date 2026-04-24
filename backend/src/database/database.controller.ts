import { SeederService } from './seeder.service';
import { MigrationService } from './migration.service';

@Controller('database')
export class SeederController {
  constructor(
    private readonly seederService: SeederService,
    private readonly migrationService: MigrationService,
  ) {}

  @Post('seed')
  async seed() {
    try {
      return await this.seederService.seed();
    } catch (err: unknown) {
      const error = err as Error;
      return {
        status: 'error',
        message: error.message,
        stack: error.stack,
        context: 'SeederController',
      };
    }
  }

  @Post('migrate')
  async migrate() {
    try {
      await this.migrationService.migrateToMultiTenant();
      return { status: 'success', message: 'Migración multi-tenant completada.' };
    } catch (err: unknown) {
      const error = err as Error;
      return {
        status: 'error',
        message: error.message,
      };
    }
  }

  @Get('health')
  health() {
    return { status: 'ok', seeder: 'available' };
  }
}
