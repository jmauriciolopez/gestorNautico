import { Controller, Post, Get } from '@nestjs/common';
import { SeederService } from './seeder.service';

@Controller('database')
export class SeederController {
  constructor(private readonly seederService: SeederService) {}

  @Post('seed')
  async seed() {
    try {
      return await this.seederService.seed();
    } catch (err: any) {
      return { 
        status: 'error', 
        message: err.message, 
        stack: err.stack,
        context: 'SeederController'
      };
    }
  }

  @Get('health')
  health() {
    return { status: 'ok', seeder: 'available' };
  }
}
