import { Controller, Post, Get } from '@nestjs/common';
import { SeederService } from './seeder.service';

@Controller('database')
export class SeederController {
  constructor(private readonly seederService: SeederService) {}

  @Post('seed')
  async seed() {
    return this.seederService.seed();
  }

  @Get('health')
  async health() {
    return { status: 'ok', seeder: 'available' };
  }
}
