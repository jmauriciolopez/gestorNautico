import { Injectable } from '@nestjs/common';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const PDFDocument = require('pdfkit-table');
import { Factura } from '../../facturas/factura.entity';
import { Pago } from '../../pagos/pago.entity';

@Injectable()
export class PdfService {
  async generateInvoice(factura: Factura): Promise<Buffer> {
    const doc = new PDFDocument({
      size: 'A4',
      margin: 50,
    });

    const buffers: Buffer[] = [];
    doc.on('data', (chunk) => buffers.push(chunk));

    return new Promise((resolve, reject) => {
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      // --- Estilo ---
      const primaryColor = '#1e293b'; // Slate-800
      const accentColor = '#3b82f6'; // Blue-500

      // --- Header ---
      doc
        .fillColor(primaryColor)
        .fontSize(20)
        .text('GESTOR NÁUTICO', { align: 'right' })
        .fontSize(10)
        .text('Puerto Deportivo Central', { align: 'right' })
        .text('Av. de la Rivera 456, CP 1000', { align: 'right' })
        .text('Tel: +54 011 4444-5555', { align: 'right' })
        .moveDown(2);

      // --- Divider ---
      doc.moveTo(50, 110).lineTo(545, 110).strokeColor('#e5e7eb').stroke();

      // --- Title & Factura Info ---
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

      // --- Cliente Info ---
      const clientX = 350;
      doc
        .fontSize(12)
        .text('CLIENTE:', clientX, infoY)
        .fontSize(10)
        .text(`${factura.cliente.nombre}`, clientX, infoY + 15)
        .text(`DNI/CUIL: ${factura.cliente.dni || '---'}`, clientX, infoY + 30)
        .text(`Email: ${factura.cliente.email || '---'}`, clientX, infoY + 45);

      doc.moveDown(4);

      // --- Table of Charges ---
      const table = {
        title: 'DETALLE DE CARGOS',
        headers: ['Descripción', 'Tipo', 'Monto'],
        rows:
          factura.cargos?.map((c) => [
            c.descripcion,
            c.tipo,
            `$${Number(c.monto).toLocaleString('es-AR', { minimumFractionDigits: 2 })}`,
          ]) || [],
      };

      doc.table(table, {
        prepareHeader: () => doc.font('Helvetica-Bold').fontSize(10),
        prepareRow: (row, indexColumn, indexRow, rectRow, rectCell) => {
          doc.font('Helvetica').fontSize(10);
        },
      } as any);

      // --- Totals ---
      doc.moveDown(2);
      const totalY = doc.y;
      doc
        .fontSize(14)
        .fillColor(accentColor)
        .text(
          `TOTAL A PAGAR: $${Number(factura.total).toLocaleString('es-AR', { minimumFractionDigits: 2 })}`,
          {
            align: 'right',
          },
        );

      // --- Footer ---
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
    const doc = new PDFDocument({
      size: 'A4',
      margin: 50,
    });

    const buffers: Buffer[] = [];
    doc.on('data', (chunk) => buffers.push(chunk));

    return new Promise((resolve, reject) => {
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      const primaryColor = '#1e293b';

      // Header
      doc
        .fillColor(primaryColor)
        .fontSize(20)
        .text('GESTOR NÁUTICO', { align: 'right' })
        .fontSize(10)
        .text('RECIBO DE PAGO', { align: 'right' })
        .moveDown(2);

      // Info
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

      // Table (Simple row for the amount)
      const table = {
        headers: ['Concepto', 'Monto'],
        rows: [
          [
            pago.cargo?.descripcion || 'Pago General',
            `$${Number(pago.monto).toLocaleString('es-AR', { minimumFractionDigits: 2 })}`,
          ],
        ],
      };

      doc.table(table, {
        prepareHeader: () => doc.font('Helvetica-Bold').fontSize(10),
        prepareRow: () => doc.font('Helvetica').fontSize(10),
      } as any);

      doc.moveDown(2);
      doc
        .fontSize(14)
        .text(
          `TOTAL PAGADO: $${Number(pago.monto).toLocaleString('es-AR', { minimumFractionDigits: 2 })}`,
          {
            align: 'right',
          },
        );

      doc.end();
    });
  }
}
