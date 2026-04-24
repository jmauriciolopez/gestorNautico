import { Injectable } from '@nestjs/common';
/* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-return */
// eslint-disable-next-line @typescript-eslint/no-require-imports
const PDFDocument = require('pdfkit-table');
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

    return new Promise<Buffer>((resolve, reject) => {
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', (err: Error) => reject(err));

      const primaryColor = '#1e293b';
      const accentColor = '#3b82f6';
      const textColor = '#334155';
      const secondaryColor = '#64748b';

      // --- ENCABEZADO ---
      doc.fillColor(primaryColor).fontSize(24).font('Helvetica-Bold').text('FACTURA', 50, 50);
      doc.fontSize(12).fillColor(secondaryColor).text(`# ${factura.numero}`, 50, 80);

      // Info Guardería (Derecha)
      doc
        .fillColor(primaryColor)
        .fontSize(14)
        .font('Helvetica-Bold')
        .text(nombre.toUpperCase(), 300, 50, { align: 'right', width: 245 });
      
      doc
        .fontSize(9)
        .font('Helvetica')
        .fillColor(secondaryColor)
        .text(direccion, 300, 70, { align: 'right', width: 245 })
        .text(`Tel: ${telefono}`, { align: 'right', width: 245 })
        .text(email, { align: 'right', width: 245 });

      doc.moveTo(50, 115).lineTo(545, 115).strokeColor('#e2e8f0').stroke();

      // --- SECCIÓN INTERMEDIA (CLIENTE Y DATOS) ---
      doc.moveDown(3);
      const currentY = doc.y;

      // Columna Izquierda: Cliente
      doc
        .fillColor(secondaryColor)
        .fontSize(8)
        .font('Helvetica-Bold')
        .text('FACTURADO A:', 50, currentY);
      
      doc
        .fillColor(primaryColor)
        .fontSize(11)
        .font('Helvetica-Bold')
        .text(factura.cliente.nombre.toUpperCase(), 50, currentY + 15)
        .fontSize(9)
        .font('Helvetica')
        .fillColor(textColor)
        .text(`DNI/CUIL: ${factura.cliente.dni || '---'}`)
        .text(`Email: ${factura.cliente.email || '---'}`);

      // Columna Derecha: Datos Factura
      const rightColX = 350;
      doc
        .fillColor(secondaryColor)
        .fontSize(8)
        .font('Helvetica-Bold')
        .text('DETALLES DE FACTURA:', rightColX, currentY);

      doc
        .fontSize(9)
        .font('Helvetica')
        .fillColor(textColor)
        .text('Fecha Emisión:', rightColX, currentY + 15)
        .font('Helvetica-Bold')
        .text(new Date(factura.fechaEmision).toLocaleDateString('es-AR'), rightColX + 80, currentY + 15)
        
        .font('Helvetica')
        .text('Vencimiento:', rightColX, currentY + 30)
        .font('Helvetica-Bold')
        .text(factura.fechaVencimiento ? new Date(factura.fechaVencimiento).toLocaleDateString('es-AR') : '---', rightColX + 80, currentY + 30);

      doc.moveDown(4);

      // --- TABLA DE CARGOS ---
      const table = {
        title: { label: 'DETALLE DE CARGOS', fontSize: 10, color: primaryColor, fontFamily: 'Helvetica-Bold' },
        headers: [
          { label: 'Descripción', property: 'desc', width: 220 },
          { label: 'Cantidad', property: 'qty', width: 60, align: 'center' },
          { label: 'P. Unitario', property: 'unit', width: 100, align: 'right' },
          { label: 'Importe Total', property: 'total', width: 115, align: 'right' },
        ],
        rows: (factura.cargos ?? []).map((c) => [
          c.descripcion,
          '1',
          `$${Number(c.monto).toLocaleString('es-AR', { minimumFractionDigits: 2 })}`,
          `$${Number(c.monto).toLocaleString('es-AR', { minimumFractionDigits: 2 })}`,
        ]),
      };

      doc.x = 50; // Asegurar que la tabla comience a la izquierda
      void doc.table(table, {
        prepareHeader: () => doc.font('Helvetica-Bold').fontSize(9).fillColor(primaryColor),
        prepareRow: (row, indexColumn, indexRow, rectRow, rectCell) => {
          doc.font('Helvetica').fontSize(9).fillColor(textColor);
          // Línea divisoria sutil entre filas
          if (rectRow) {
             doc.lineWidth(0.5).moveTo(rectRow.x, rectRow.y + rectRow.height).lineTo(rectRow.x + rectRow.width, rectRow.y + rectRow.height).strokeColor('#f1f5f9').stroke();
          }
        },
        padding: 5,
        columnSpacing: 10,
        hideHeader: false,
        minRowHeight: 20
      });

      // --- SECCIÓN DE TOTAL ---
      doc.moveDown(2);
      const totalY = doc.y;
      
      doc.rect(345, totalY, 200, 40).fill('#f8fafc');
      
      doc
        .fillColor(primaryColor)
        .fontSize(10)
        .font('Helvetica-Bold')
        .text('TOTAL A PAGAR', 355, totalY + 15);

      doc
        .fillColor(accentColor)
        .fontSize(16)
        .font('Helvetica-Bold')
        .text(
          `$${Number(factura.total).toLocaleString('es-AR', { minimumFractionDigits: 2 })}`,
          350,
          totalY + 12,
          { align: 'right', width: 185 }
        );

      // --- PIE DE PÁGINA ---
      doc
        .fontSize(7)
        .fillColor(secondaryColor)
        .text(
          'Este documento es un comprobante de gestión interna y no tiene validez legal como factura fiscal ante AFIP.',
          50,
          780,
          { align: 'center', width: 500 }
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

    return new Promise<Buffer>((resolve, reject) => {
      void doc.on('end', () => resolve(Buffer.concat(buffers)));
      void doc.on('error', (err: Error) => reject(err));

      const primaryColor = '#1e293b';
      const accentColor = '#3b82f6';
      const textColor = '#334155';
      const secondaryColor = '#64748b';

      // --- ENCABEZADO ---
      doc.fillColor(primaryColor).fontSize(24).font('Helvetica-Bold').text('RECIBO', 50, 50);
      doc.fontSize(12).fillColor(secondaryColor).text(`# ${pago.id}`, 50, 80);

      // Info Guardería (Derecha)
      doc
        .fillColor(primaryColor)
        .fontSize(14)
        .font('Helvetica-Bold')
        .text(nombre.toUpperCase(), 300, 50, { align: 'right', width: 245 });
      
      doc
        .fontSize(10)
        .font('Helvetica')
        .fillColor(secondaryColor)
        .text('COMPROBANTE DE PAGO', 300, 70, { align: 'right', width: 245 });

      doc.moveTo(50, 115).lineTo(545, 115).strokeColor('#e2e8f0').stroke();

      // --- SECCIÓN INTERMEDIA ---
      doc.moveDown(3);
      const currentY = doc.y;

      // Cliente
      doc
        .fillColor(secondaryColor)
        .fontSize(8)
        .font('Helvetica-Bold')
        .text('CLIENTE:', 50, currentY);
      
      doc
        .fillColor(primaryColor)
        .fontSize(11)
        .font('Helvetica-Bold')
        .text(pago.cliente.nombre.toUpperCase(), 50, currentY + 15);

      // Detalles del Pago
      const rightColX = 350;
      doc
        .fillColor(secondaryColor)
        .fontSize(8)
        .font('Helvetica-Bold')
        .text('DETALLES DEL PAGO:', rightColX, currentY);

      doc
        .fontSize(9)
        .font('Helvetica')
        .fillColor(textColor)
        .text('Fecha:', rightColX, currentY + 15)
        .font('Helvetica-Bold')
        .text(new Date(pago.fecha).toLocaleDateString('es-AR'), rightColX + 80, currentY + 15)
        
        .font('Helvetica')
        .text('Método:', rightColX, currentY + 30)
        .font('Helvetica-Bold')
        .text(pago.metodoPago, rightColX + 80, currentY + 30);

      doc.moveDown(4);

      // --- TABLA ---
      const table = {
        headers: [
          { label: 'Concepto / Descripción', property: 'desc', width: 345 },
          { label: 'Importe', property: 'monto', width: 150, align: 'right' },
        ],
        rows: [
          [
            pago.comprobante || 'Pago de servicios / Cuota social',
            `$${Number(pago.monto).toLocaleString('es-AR', { minimumFractionDigits: 2 })}`,
          ],
        ],
      };

      doc.x = 50; // Asegurar que la tabla comience a la izquierda
      void doc.table(table, {
        prepareHeader: () => doc.font('Helvetica-Bold').fontSize(9).fillColor(primaryColor),
        prepareRow: () => doc.font('Helvetica').fontSize(9).fillColor(textColor),
        padding: 5,
      });

      // --- SECCIÓN DE TOTAL ---
      doc.moveDown(2);
      const totalY = doc.y;
      
      doc.rect(345, totalY, 200, 40).fill('#f8fafc');
      
      doc
        .fillColor(primaryColor)
        .fontSize(10)
        .font('Helvetica-Bold')
        .text('TOTAL PAGADO', 355, totalY + 15);

      doc
        .fillColor(accentColor)
        .fontSize(16)
        .font('Helvetica-Bold')
        .text(
          `$${Number(pago.monto).toLocaleString('es-AR', { minimumFractionDigits: 2 })}`,
          350,
          totalY + 12,
          { align: 'right', width: 185 }
        );

      doc.end();
    });
  }
}
