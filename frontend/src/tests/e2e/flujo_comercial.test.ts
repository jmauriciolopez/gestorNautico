import { expect, test, describe, beforeAll } from 'vitest';
import { page } from '@vitest/browser/context';

describe('Flujo de Operaciones y Finanzas (Cross-module)', () => {
  beforeAll(async () => {
    // 1. Reset DB + Seed
    await fetch('http://localhost:3000/database/seed', { method: 'POST' });
    
    // 2. Navegar a Dashboard
    await page.goto('http://localhost:5173/');
  });

  test('Debe completar el ciclo: Salida -> Pedido -> Cargo -> Pago', async () => {
    // A. OPERACIONES - Registrar Salida
    await page.goto('http://localhost:5173/operaciones');
    await page.getByRole('button', { name: /Registrar Movimiento/i }).click();
    await page.getByLabel(/Embarcación/i).selectOption('1'); // La Mary
    await page.getByLabel(/Tipo/i).selectOption('SALIDA');
    await page.getByRole('button', { name: /Guardar/i }).click();
    
    await expect.element(page.getByText('SALIDA')).toBeVisible();

    // B. OPERACIONES - Registrar Pedido (Servicio)
    await page.getByRole('button', { name: /Nuevo Pedido/i }).click();
    await page.getByLabel(/Embarcación/i).selectOption('1');
    await page.getByLabel(/Detalle/i).fill('Limpieza Completa');
    await page.getByRole('button', { name: /Guardar/i }).click();
    
    await expect.element(page.getByText('Limpieza Completa')).toBeVisible();

    // C. FINANZAS - Generar Cargo y Pagar
    await page.goto('http://localhost:5173/finanzas');
    
    // Verificamos que el resumen de caja abierta aparezca
    await expect.element(page.getByText('Saldo Inicial')).toBeVisible();
    
    // Crear Cargo manual (para emular el flujo generado por el pedido)
    await page.getByRole('button', { name: /Nuevo Cargo/i }).click();
    await page.getByLabel(/Cliente/i).selectOption('1'); // Juan Pérez
    await page.getByLabel(/Monto/i).fill('5000');
    await page.getByLabel(/Descripción/i).fill('Cargo por Limpieza');
    await page.getByRole('button', { name: /Guardar/i }).click();
    
    await expect.element(page.getByText('Cargo por Limpieza')).toBeVisible();
    await expect.element(page.getByText('Pendiente')).toBeVisible();

    // Registrar Pago
    const row = page.locator('tr').filter({ hasText: 'Cargo por Limpieza' });
    await row.getByRole('button', { name: /Cobrar/i }).click();
    
    await page.getByLabel(/Monto/i).fill('5000');
    await page.getByLabel(/Método/i).selectOption('EFECTIVO');
    await page.getByRole('button', { name: /Procesar Pago/i }).click();
    
    // Validar cierre de cargo y actualización de caja
    await expect.element(page.getByText('Pagado')).toBeVisible();
    await expect.element(page.getByText('Recaudado Total')).toBeVisible();
    // Nota: El monto de caja debería haber subido de 0 a 5000
    await expect.element(page.getByText('$5,000')).toBeVisible(); 
  });
});
