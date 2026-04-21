import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cliente } from '../clientes/clientes.entity';
import { Embarcacion } from '../embarcaciones/embarcaciones.entity';

export interface ImportResult {
  success: boolean;
  created: number;
  updated: number;
  errors: string[];
}

export interface ClienteImportRow {
  nombre: string;
  dni: string;
  email?: string;
  telefono?: string;
  activo?: string;
  diafacturacion?: string;
  descuento?: string;
  tipecuota?: string;
}

export interface EmbarcacionImportRow {
  nombre: string;
  matricula: string;
  dnidueno: string;
  marca?: string;
  modelo?: string;
  eslora?: string;
  manga?: string;
  tipo?: string;
  estado?: string;
}

@Injectable()
export class ImportService {
  private readonly logger = new Logger(ImportService.name);

  constructor(
    @InjectRepository(Cliente)
    private readonly clienteRepo: Repository<Cliente>,
    @InjectRepository(Embarcacion)
    private readonly embarcacionRepo: Repository<Embarcacion>,
  ) {}

  private parseCSV(content: string): string[][] {
    const lines = content.trim().split('\n');
    return lines.map((line) => {
      const cells: string[] = [];
      let current = '';
      let inQuotes = false;

      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          cells.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      cells.push(current.trim());
      return cells;
    });
  }

  private mapCSVToObjects<T>(headers: string[], rows: string[][]): T[] {
    return rows.map((row) => {
      const obj: Record<string, string> = {};
      headers.forEach((header, index) => {
        obj[header.toLowerCase().trim()] = row[index] || '';
      });
      return obj as T;
    });
  }

  async importClientes(csvContent: string): Promise<ImportResult> {
    const result: ImportResult = {
      success: true,
      created: 0,
      updated: 0,
      errors: [],
    };

    try {
      const lines = this.parseCSV(csvContent);
      if (lines.length < 2) {
        result.errors.push('El archivo CSV debe tener al menos una fila de datos');
        result.success = false;
        return result;
      }

      const headers = lines[0].map((h) => h.toLowerCase().trim());
      const data = this.mapCSVToObjects<ClienteImportRow>(headers, lines.slice(1));

      for (const row of data) {
        try {
          if (!row.nombre || !row.dni) {
            result.errors.push(`Fila omitida: falta nombre o dni - ${JSON.stringify(row)}`);
            continue;
          }

          const existingCliente = await this.clienteRepo.findOne({
            where: { dni: row.dni },
          });

          const activo = row.activo === 'true' || row.activo === '1';
          const diaFacturacion = row.diafacturacion ? parseInt(row.diafacturacion, 10) : 1;
          const descuento = row.descuento ? parseFloat(row.descuento) : 0;

          if (existingCliente) {
            await this.clienteRepo.update(existingCliente.id, {
              nombre: row.nombre,
              email: row.email || existingCliente.email,
              telefono: row.telefono || existingCliente.telefono,
              activo: row.activo !== undefined ? activo : existingCliente.activo,
              diaFacturacion: row.diafacturacion ? diaFacturacion : existingCliente.diaFacturacion,
              descuento: row.descuento ? descuento : existingCliente.descuento,
              tipoCuota: row.tipecuota || existingCliente.tipoCuota,
            });
            result.updated++;
          } else {
            await this.clienteRepo.save({
              nombre: row.nombre,
              dni: row.dni,
              email: row.email || null,
              telefono: row.telefono || null,
              activo: row.activo !== undefined ? activo : true,
              diaFacturacion: row.diafacturacion ? diaFacturacion : 1,
              descuento: row.descuento ? descuento : 0,
              tipoCuota: row.tipecuota || 'NINGUNA',
            });
            result.created++;
          }
        } catch (err: any) {
          result.errors.push(`Error procesando cliente ${row.dni}: ${err.message}`);
        }
      }
    } catch (error: any) {
      result.success = false;
      result.errors.push(`Error al procesar archivo: ${error.message}`);
    }

    return result;
  }

  async importEmbarcaciones(csvContent: string): Promise<ImportResult> {
    const result: ImportResult = {
      success: true,
      created: 0,
      updated: 0,
      errors: [],
    };

    try {
      const lines = this.parseCSV(csvContent);
      if (lines.length < 2) {
        result.errors.push('El archivo CSV debe tener al menos una fila de datos');
        result.success = false;
        return result;
      }

      const headers = lines[0].map((h) => h.toLowerCase().trim());
      const data = this.mapCSVToObjects<EmbarcacionImportRow>(headers, lines.slice(1));

      for (const row of data) {
        try {
          if (!row.nombre || !row.matricula || !row.dnidueno) {
            result.errors.push(`Fila omitida: falta nombre, matricula o dnidueno - ${JSON.stringify(row)}`);
            continue;
          }

          const cliente = await this.clienteRepo.findOne({
            where: { dni: row.dnidueno },
          });

          if (!cliente) {
            result.errors.push(`Cliente con DNI ${row.dnidueno} no encontrado para embarcacion ${row.nombre}`);
            continue;
          }

          const existingEmbarcacion = await this.embarcacionRepo.findOne({
            where: { matricula: row.matricula },
          });

          const eslora = row.eslora ? parseFloat(row.eslora) : undefined;
          const manga = row.manga ? parseFloat(row.manga) : undefined;

          if (existingEmbarcacion) {
            await this.embarcacionRepo.update(existingEmbarcacion.id, {
              nombre: row.nombre,
              marca: row.marca || existingEmbarcacion.marca,
              modelo: row.modelo || existingEmbarcacion.modelo,
              eslora: eslora || existingEmbarcacion.eslora,
              manga: manga || existingEmbarcacion.manga,
              tipo: row.tipo || existingEmbarcacion.tipo,
              estado: row.estado || existingEmbarcacion.estado,
              clienteId: cliente.id,
            });
            result.updated++;
          } else {
            await this.embarcacionRepo.save({
              nombre: row.nombre,
              matricula: row.matricula,
              marca: row.marca || null,
              modelo: row.modelo || null,
              eslora: eslora || null,
              manga: manga || null,
              tipo: row.tipo || 'Lancha',
              estado: row.estado || 'EN_CUNA',
              clienteId: cliente.id,
            });
            result.created++;
          }
        } catch (err: any) {
          result.errors.push(`Error procesando embarcacion ${row.matricula}: ${err.message}`);
        }
      }
    } catch (error: any) {
      result.success = false;
      result.errors.push(`Error al procesar archivo: ${error.message}`);
    }

    return result;
  }
}