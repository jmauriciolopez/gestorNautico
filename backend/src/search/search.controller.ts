import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { SearchService } from './search.service';
import { AuthTokenGuard } from '../auth/guards/AuthTokenGuard';

@Controller('search')
@UseGuards(AuthTokenGuard)
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  search(@Query('q') query: string) {
    return this.searchService.search(query ?? '');
  }
}
