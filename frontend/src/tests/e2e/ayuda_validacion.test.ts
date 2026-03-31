import { expect, test, describe, beforeAll } from 'vitest';
import { page } from '@vitest/browser/context';

describe('Ciclo de Vida Maestro - Validación de Ayuda y Negocio', () => {
  
  beforeAll(async () => {
    // 1. Reset DB + Seed para estado limpio
    await fetch('http://localhost:3000/database/seed', { method: 'POST' });
    
    // 2. Navegar e iniciar sesión
    await page.goto('http://localhost:5173/login');
    await page.getByLabel(/Usuario/i).fill('admin');
    await page.getByLabel(/Contraseña/i).fill('admin123');
    await page.getByRole('button', { name: /Iniciar Sesión/i }).click();
    
    // Esperar a que cargue el dashboard
    await expect.element(page.getByText('Dashboard')).toBeVisible();
  });

  test('Debe ejecutar el flujo completo: Config -> Catálogo -> Op -> Facturación', async () => {
    
    // --- 1. CONFIGURACIÓN: Ajustar horario para forzar "Fuera de Hora" ---
    await page.goto('http://localhost:5173/configuracion');
    // En ConfiguracionPage, los inputs tienen labels dinámicos
    await page.getByLabel(/Horario límite para subida/i).fill('07:00');
    await page.getByRole('button', { name: /Guardar Cambios/i }).click();
    await expect.element(page.getByText('Configuración actualizada')).toBeVisible();

    // --- 2. CATÁLOGO: Crear Cliente y Embarcación ---
    await page.goto('http://localhost:5173/clientes');
    await page.getByRole('button', { name: /Nuevo Cliente/i }).click();
    await page.getByLabel(/Nombre/i).fill('E2E Test Client');
    await page.getByLabel(/Email/i).fill('e2e@test.com');
    await page.getByRole('button', { name: /Guardar/i }).click();
    
    await page.goto('http://localhost:5173/embarcaciones');
    await page.getByRole('button', { name: /Nueva Embarcación/i }).click();
    await page.getByLabel(/Nombre/i).fill('E2E Boat');
    await page.getByLabel(/Propietario/i).selectOption({ label: 'E2E Test Client' });
    await page.getByLabel(/Espacio en Rack/i).selectOption({ index: 1 }); // Seleccionar primera cuna libre
    await page.getByRole('button', { name: /Guardar/i }).click();

    // --- 3. OPERACIONES: Bajada (Salida) y Subida (Entrada) ---
    await page.goto('http://localhost:5173/operaciones');
    
    // Registrar Salida (Bajada)
    await page.getByRole('button', { name: /Registrar Movimiento/i }).click();
    await page.getByLabel(/Embarcación/i).selectOption({ label: 'E2E Boat' });
    await page.getByLabel(/Tipo/i).selectOption('SALIDA');
    await page.getByRole('button', { name: /Guardar/i }).click();
    await expect.element(page.getByText('SALIDA')).toBeVisible();

    // Registrar Entrada (Subida - Debería estar FUERA DE HORA por el ajuste de config)
    await page.getByRole('button', { name: /Registrar Movimiento/i }).click();
    await page.getByLabel(/Embarcación/i).selectOption({ label: 'E2E Boat' });
    await page.getByLabel(/Tipo/i).selectOption('ENTRADA');
    await page.getByRole('button', { name: /Guardar/i }).click();
    
    // Verificar badge "FUERA DE HORA" (puede tardar en aparecer según la carga)
    await expect.element(page.getByText('FUERA DE HORA')).toBeVisible();

    // --- 4. SERVICIOS: Pedido -> Iniciar -> Completar ---
    await page.getByRole('button', { name: /Nuevo Pedido/i }).click();
    await page.getByLabel(/Embarcación/i).selectOption({ label: 'E2E Boat' });
    await page.getByLabel(/Detalle/i).fill('Service E2E Test');
    await page.getByRole('button', { name: /Guardar/i }).click();

    await page.getByRole('button', { name: /Iniciar/i }).first().click();
    await expect.element(page.getByText('EN PROGRESO')).toBeVisible();
    
    await page.getByRole('button', { name: /Completar/i }).first().click();
    await expect.element(page.getByText('COMPLETADO')).toBeVisible();

    // --- 5. FINANZAS: Facturación del Servicio ---
    await page.goto('http://localhost:5173/finanzas');
    // Verificar que el cargo del servicio apareció
    await expect.element(page.getByText('Service E2E Test')).toBeVisible();
    await expect.element(page.getByText('Pendiente')).toBeVisible();

    // --- 6. AYUDA: Verificación de Documentación ---
    await page.goto('http://localhost:5173/ayuda');
    await expect.element(page.getByText('Centro de Ayuda')).toBeVisible();
    await expect.element(page.getByText('Operaciones')).toBeVisible();
    await expect.element(page.getByText('Facturación')).toBeVisible();
  });
});
