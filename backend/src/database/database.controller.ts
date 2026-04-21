import { Controller, Post, Get } from '@nestjs/common';
import { SeederService } from './seeder.service';

@Controller('database')
export class SeederController {
  constructor(private readonly seederService: SeederService) {}

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

  @Get('health')
  health() {
    return { status: 'ok', seeder: 'available' };
  }
}
