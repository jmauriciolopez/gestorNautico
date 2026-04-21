import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit-table';
import { Factura } from '../../facturas/factura.entity';
import { Pago } from '../../pagos/pago.entity';
import { ConfiguracionService } from '../../configuracion/configuracion.service';

@Injectable()
export class PdfService {
  constructor(private readonly configService: ConfiguracionService) {}

  async generateInvoice(factura: Factura): Promise<Buffer> {
    const [nombre, direccion, telefono, email] = await Promise.all([
      this.configService.getValor('NOMBRE_GUARDERIA', 'Gestor Náutico'),
      this.configService.getValor('DIRECCION', ''),
      this.configService.getValor('TELEFONO', ''),
      this.configService.getValor('EMAIL_GUARDERIA', ''),
    ]);

    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const buffers: Buffer[] = [];
    doc.on('data', (chunk: Buffer) => buffers.push(chunk));

    return new Promise((resolve, reject) => {
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      const primaryColor = '#1e293b';
      const accentColor = '#3b82f6';

      doc
        .fillColor(primaryColor)
        .fontSize(20)
        .text(nombre.toUpperCase(), { align: 'right' })
        .fontSize(10)
        .text(direccion, { align: 'right' })
        .text(`Tel: ${telefono}`, { align: 'right' })
        .text(email, { align: 'right' })
        .moveDown(2);

      doc.moveTo(50, 110).lineTo(545, 110).strokeColor('#e5e7eb').stroke();

      doc.moveDown(2);
      doc
        .fillColor(primaryColor)
        .fontSize(16)
        .text('FACTURA', { underline: true })
        .moveDown(0.5);

      const infoX = 50;
      const infoY = doc.y;

      doc
        .fontSize(10)
        .text(`Número: ${factura.numero}`, infoX, infoY)
        .text(
          `Fecha Emisión: ${new Date(factura.fechaEmision).toLocaleDateString('es-AR')}`,
          infoX,
          infoY + 15,
        )
        .text(`Estado: ${factura.estado}`, infoX, infoY + 30);

      const clientX = 350;
      doc
        .fontSize(12)
        .text('CLIENTE:', clientX, infoY)
        .fontSize(10)
        .text(`${factura.cliente.nombre}`, clientX, infoY + 15)
        .text(`DNI/CUIL: ${factura.cliente.dni || '---'}`, clientX, infoY + 30)
        .text(`Email: ${factura.cliente.email || '---'}`, clientX, infoY + 45);

      doc.moveDown(4);

      const table = {
        title: 'DETALLE DE CARGOS',
        headers: ['Descripción', 'Tipo', 'Vencimiento', 'Estado', 'Importe'],
        rows: (factura.cargos ?? []).map((c) => [
          c.descripcion,
          c.tipo,
          c.fechaVencimiento
            ? new Date(c.fechaVencimiento).toLocaleDateString('es-AR')
            : '---',
          c.pagado ? 'Pagado' : 'Pendiente',
          `$${Number(c.monto).toLocaleString('es-AR', { minimumFractionDigits: 2 })}`,
        ]),
      };

      void doc.table(table, {
        prepareHeader: () => doc.font('Helvetica-Bold').fontSize(9),
        prepareRow: () => doc.font('Helvetica').fontSize(9),
        columnsSize: [190, 75, 80, 65, 80],
      });

      doc.moveDown(2);
      doc
        .fontSize(14)
        .fillColor(accentColor)
        .text(
          `TOTAL A PAGAR: $${Number(factura.total).toLocaleString('es-AR', { minimumFractionDigits: 2 })}`,
          { align: 'right' },
        );

      doc
        .fontSize(8)
        .fillColor('#9ca3af')
        .text(
          'Este documento es un comprobante de gestión interna y no tiene validez legal como factura fiscal.',
          50,
          750,
          { align: 'center', width: 500 },
        );

      doc.end();
    });
  }

  async generateReceipt(pago: Pago): Promise<Buffer> {
    const nombre = await this.configService.getValor(
      'NOMBRE_GUARDERIA',
      'Gestor Náutico',
    );

    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const buffers: Buffer[] = [];
    doc.on('data', (chunk: Buffer) => buffers.push(chunk));

    return new Promise((resolve, reject) => {
      void doc.on('end', () => resolve(Buffer.concat(buffers)));
      void doc.on('error', reject);

      const primaryColor = '#1e293b';

      doc
        .fillColor(primaryColor)
        .fontSize(20)
        .text(nombre.toUpperCase(), { align: 'right' })
        .fontSize(10)
        .text('RECIBO DE PAGO', { align: 'right' })
        .moveDown(2);

      doc
        .fontSize(16)
        .text('COMPROBANTE DE PAGO', { underline: true })
        .moveDown(1);

      doc
        .fontSize(10)
        .text(`Recibo #: ${pago.id}`)
        .text(`Fecha: ${new Date(pago.fecha).toLocaleDateString('es-AR')}`)
        .text(`Cliente: ${pago.cliente.nombre}`)
        .text(`Método: ${pago.metodoPago}`)
        .moveDown(2);

      const table = {
        headers: ['Concepto', 'Monto'],
        rows: [
          [
            pago.cargo?.descripcion || 'Pago General',
            `$${Number(pago.monto).toLocaleString('es-AR', { minimumFractionDigits: 2 })}`,
          ],
        ],
      };

      void doc.table(table, {
        prepareHeader: () => doc.font('Helvetica-Bold').fontSize(9),
        prepareRow: () => doc.font('Helvetica').fontSize(9),
        columnsSize: [190, 75, 80, 65, 80],
      });

      doc.moveDown(2);
      doc
        .fontSize(14)
        .text(
          `TOTAL PAGADO: $${Number(pago.monto).toLocaleString('es-AR', { minimumFractionDigits: 2 })}`,
          { align: 'right' },
        );

      doc.end();
    });
  }
}
