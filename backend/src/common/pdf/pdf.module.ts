import { Module, Global } from '@nestjs/common';
import { PdfService } from './pdf.service';
import { ConfiguracionModule } from '../../configuracion/configuracion.module';

@Global()
@Module({
  imports: [ConfiguracionModule],
  providers: [PdfService],
  exports: [PdfService],
})
export class PdfModule {}
