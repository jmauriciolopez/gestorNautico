import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cliente } from '../clientes/clientes.entity';
import {
  Embarcacion,
  EstadoEmbarcacion,
} from '../embarcaciones/embarcaciones.entity';
import { BaseTenantService } from '../compartido/bases/base-tenant.service';
import { TenantContext } from '../compartido/interfaces/tenant-context.interface';

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
  diaFacturacion?: string;
  descuento?: string;
  tipoCuota?: string;
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
export class ImportService extends BaseTenantService {
  private readonly logger = new Logger(ImportService.name);

  constructor(
    @InjectRepository(Cliente)
    private readonly clienteRepo: Repository<Cliente>,
    @InjectRepository(Embarcacion)
    private readonly embarcacionRepo: Repository<Embarcacion>,
  ) {
    super();
  }

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
        obj[header.trim()] = row[index] || '';
      });
      return obj as T;
    });
  }

  async importClientes(
    tenant: TenantContext,
    csvContent: string,
  ): Promise<ImportResult> {
    const result: ImportResult = {
      success: true,
      created: 0,
      updated: 0,
      errors: [],
    };

    try {
      if (!tenant.guarderiaId) {
        result.errors.push(
          'Debe seleccionar una sede para realizar la importación',
        );
        result.success = false;
        return result;
      }

      const lines = this.parseCSV(csvContent);
      if (lines.length < 2) {
        result.errors.push(
          'El archivo CSV debe tener al menos una fila de datos',
        );
        result.success = false;
        return result;
      }

      const headers = lines[0].map((h) => h.trim());
      const data = this.mapCSVToObjects<ClienteImportRow>(
        headers,
        lines.slice(1),
      );

      for (const row of data) {
        try {
          if (!row.nombre || !row.dni) {
            result.errors.push(
              `Fila omitida: falta nombre o dni - ${JSON.stringify(row)}`,
            );
            continue;
          }

          const existingCliente = await this.clienteRepo.findOne({
            where: this.buildTenantWhere(tenant, { dni: row.dni }),
          });

          const activo = row.activo === 'true' || row.activo === '1';
          const diaFacturacion = row.diaFacturacion
            ? parseInt(row.diaFacturacion, 10)
            : 1;
          const descuento = row.descuento ? parseFloat(row.descuento) : 0;

          if (existingCliente) {
            await this.clienteRepo.update(existingCliente.id, {
              nombre: row.nombre,
              email: row.email || existingCliente.email,
              telefono: row.telefono || existingCliente.telefono,
              activo:
                row.activo !== undefined ? activo : existingCliente.activo,
              diaFacturacion: row.diaFacturacion
                ? diaFacturacion
                : existingCliente.diaFacturacion,
              descuento: row.descuento ? descuento : existingCliente.descuento,
              tipoCuota: row.tipoCuota || existingCliente.tipoCuota,
            });
            result.updated++;
          } else {
            await this.clienteRepo.save({
              nombre: row.nombre,
              dni: row.dni,
              email: row.email || null,
              telefono: row.telefono || null,
              activo: row.activo !== undefined ? activo : true,
              diaFacturacion: row.diaFacturacion ? diaFacturacion : 1,
              descuento: row.descuento ? descuento : 0,
              tipoCuota: row.tipoCuota || 'NINGUNA',
              guarderiaId: tenant.guarderiaId,
            });
            result.created++;
          }
        } catch (err: unknown) {
          const message =
            err instanceof Error ? err.message : 'Error desconocido';
          result.errors.push(`Error procesando cliente ${row.dni}: ${message}`);
        }
      }
    } catch (error: unknown) {
      result.success = false;
      const message =
        error instanceof Error ? error.message : 'Error desconocido';
      result.errors.push(`Error al procesar archivo: ${message}`);
    }

    return result;
  }

  async importEmbarcaciones(
    tenant: TenantContext,
    csvContent: string,
  ): Promise<ImportResult> {
    const result: ImportResult = {
      success: true,
      created: 0,
      updated: 0,
      errors: [],
    };

    try {
      if (!tenant.guarderiaId) {
        result.errors.push(
          'Debe seleccionar una sede para realizar la importación',
        );
        result.success = false;
        return result;
      }

      const lines = this.parseCSV(csvContent);
      if (lines.length < 2) {
        result.errors.push(
          'El archivo CSV debe tener al menos una fila de datos',
        );
        result.success = false;
        return result;
      }

      const headers = lines[0].map((h) => h.trim());
      const data = this.mapCSVToObjects<EmbarcacionImportRow>(
        headers,
        lines.slice(1),
      );

      for (const row of data) {
        try {
          if (!row.nombre || !row.matricula || !row.dnidueno) {
            result.errors.push(
              `Fila omitida: falta nombre, matricula o dnidueno - ${JSON.stringify(row)}`,
            );
            continue;
          }

          const cliente = await this.clienteRepo.findOne({
            where: this.buildTenantWhere(tenant, { dni: row.dnidueno }),
          });

          if (!cliente) {
            result.errors.push(
              `Cliente con DNI ${row.dnidueno} no encontrado para embarcacion ${row.nombre}`,
            );
            continue;
          }

          const existingEmbarcacion = await this.embarcacionRepo.findOne({
            where: this.buildTenantWhere(tenant, { matricula: row.matricula }),
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
              estado_operativo: row.estado
                ? (row.estado as EstadoEmbarcacion)
                : existingEmbarcacion.estado_operativo,
              clienteId: cliente.id,
            });
            result.updated++;
          } else {
            const nueva = this.embarcacionRepo.create({
              nombre: row.nombre,
              matricula: row.matricula,
              marca: row.marca || null,
              modelo: row.modelo || null,
              eslora: eslora || null,
              manga: manga || null,
              tipo: row.tipo || 'Lancha',
              estado_operativo:
                (row.estado as EstadoEmbarcacion) || EstadoEmbarcacion.EN_CUNA,
              clienteId: cliente.id,
              guarderiaId: tenant.guarderiaId,
            });
            await this.embarcacionRepo.save(nueva);
            result.created++;
          }
        } catch (err: unknown) {
          const message =
            err instanceof Error ? err.message : 'Error desconocido';
          result.errors.push(
            `Error procesando embarcacion ${row.matricula}: ${message}`,
          );
        }
      }
    } catch (error: unknown) {
      result.success = false;
      const message =
        error instanceof Error ? error.message : 'Error desconocido';
      result.errors.push(`Error al procesar archivo: ${message}`);
    }

    return result;
  }
}
