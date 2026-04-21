import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImportService, ImportResult } from './import.service';

@Controller('import')
export class ImportController {
  constructor(private readonly importService: ImportService) {}

  @Post('clientes')
  @UseInterceptors(FileInterceptor('file'))
  async importClientes(
    @UploadedFile() file: any,
  ): Promise<ImportResult> {
    if (!file) {
      throw new BadRequestException('No se ha proporcionado ningún archivo');
    }

    const content = file.buffer.toString('utf-8');
    return this.importService.importClientes(content);
  }

  @Post('embarcaciones')
  @UseInterceptors(FileInterceptor('file'))
  async importEmbarcaciones(
    @UploadedFile() file: any,
  ): Promise<ImportResult> {
    if (!file) {
      throw new BadRequestException('No se ha proporcionado ningún archivo');
    }

    const content = file.buffer.toString('utf-8');
    return this.importService.importEmbarcaciones(content);
  }
}