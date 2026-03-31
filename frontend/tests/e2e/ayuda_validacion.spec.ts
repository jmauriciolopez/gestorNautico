import { test, expect } from '@playwright/test';

test.describe('Ciclo de Vida Maestro - Validación de Ayuda y Negocio', () => {
  
  test.beforeAll(async ({ request }) => {
    // 1. Reset DB + Seed para estado limpio
    // Usamos el request context de Playwright para llamar al backend directamente
    const response = await request.post('http://localhost:3000/database/seed');
    expect(response.ok()).toBeTruthy();
  });

  test('Debe ejecutar el flujo completo: Config -> Catálogo -> Op -> Facturación', async ({ page }) => {
    // 2. Iniciar sesión
    await page.goto('/login');
    await page.getByLabel(/Usuario/i).fill('admin');
    await page.getByLabel(/Contraseña/i).fill('admin123');
    await page.getByRole('button', { name: /Iniciar Sesión/i }).click();
    
    // Esperar a que cargue el dashboard
    await expect(page.getByText('PANEL DE CONTROL')).toBeVisible();

    // --- 1. CONFIGURACIÓN: Ajustar horario para forzar "Fuera de Hora" ---
    await page.goto('/configuracion');
    // Usamos el texto exacto encontrado: 'Límite Máximo Subida'
    const inputHora = page.getByLabel(/Límite Máximo Subida/i);
    await inputHora.clear();
    await inputHora.fill('07:00');
    await page.getByRole('button', { name: /Guardar Cambios/i }).click();
    await expect(page.getByText('Configuración actualizada')).toBeVisible();

    // --- 2. CATÁLOGO: Crear Cliente y Embarcación ---
    await page.goto('/clientes');
    await page.getByRole('button', { name: /Nuevo Cliente/i }).click();
    // Usamos el texto exacto del modal
    await page.getByLabel(/Nombre Completo/i).fill('E2E Test Client');
    await page.getByLabel(/Email/i).fill('e2e@test.com');
    await page.getByRole('button', { name: /Registrar Cliente/i }).click();
    await expect(page.getByText('E2E Test Client')).toBeVisible();
    
    await page.goto('/embarcaciones');
    await page.getByRole('button', { name: /Nueva Embarcación/i }).click();
    await page.getByLabel(/Nombre de la Embarcación/i).fill('E2E Boat');
    await page.getByLabel(/Propietario/i).selectOption({ label: 'E2E Test Client' });
    
    // Seleccionar espacio (el primer disponible) en el Modal
    await page.getByRole('button', { name: /Asignar Ubicación/i }).click();
    await page.getByRole('button', { name: /Guardería Principal/i }).click();
    await page.getByRole('button', { name: /MOD-A/i }).click();
    await page.getByRole('button', { name: /CUNA-2/i }).click();
    
    await page.getByRole('button', { name: /Registrar Embarcación/i }).click();
    await expect(page.getByText('E2E Boat')).toBeVisible();

    // --- 3. OPERACIONES: Bajada (Salida) y Subida (Entrada) ---
    await page.goto('/operaciones');
    
    // Registrar Salida (Bajada)
    await page.getByRole('button', { name: /Registrar Movimiento/i }).click();
    await page.getByLabel(/Embarcación/i).selectOption({ label: 'E2E Boat' });
    await page.getByLabel(/Tipo/i).selectOption('SALIDA');
    await page.getByRole('button', { name: /Registrar Movimiento/i }).nth(1).click(); // There is another button with this name in the header
    await expect(page.getByText('SALIDA')).toBeVisible();

    // Registrar Entrada (Subida - Debería estar FUERA DE HORA por el ajuste de config)
    await page.getByRole('button', { name: /Registrar Movimiento/i }).click();
    await page.getByLabel(/Embarcación/i).selectOption({ label: 'E2E Boat' });
    await page.getByLabel(/Tipo/i).selectOption('ENTRADA');
    await page.getByRole('button', { name: /Registrar Movimiento/i }).nth(1).click();
    
    // Verificar badge "FUERA DE HORA"
    await expect(page.getByText('FUERA DE HORA')).toBeVisible();

    // --- 4. SERVICIOS: Pedido -> Iniciar -> Completar ---
    await page.getByRole('button', { name: /Nuevo Pedido/i }).click();
    await page.getByLabel(/Embarcación/i).selectOption({ label: 'E2E Boat' });
    await page.getByLabel(/Detalle/i).fill('Service E2E Test');
    await page.getByRole('button', { name: /Registrar Pedido/i }).click();

    // Interactuar con la lista de servicios (buscar el nuestro)
    const row = page.locator('tr').filter({ hasText: 'Service E2E Test' });
    await row.getByRole('button', { name: /Iniciar/i }).click();
    await expect(row.getByText('EN PROGRESO')).toBeVisible();
    
    await row.getByRole('button', { name: /Completar/i }).click();
    await expect(row.getByText('COMPLETADO')).toBeVisible();

    // --- 5. FINANZAS: Facturación del Servicio ---
    await page.goto('/finanzas');
    // Verificar que el cargo del servicio apareció
    await expect(page.locator('tr').filter({ hasText: 'Service E2E Test' })).toBeVisible();
    await expect(page.locator('tr').filter({ hasText: 'Service E2E Test' }).getByText('Pendiente')).toBeVisible();

    // --- 6. AYUDA: Verificación de Documentación ---
    await page.goto('/ayuda');
    await expect(page.getByText('Centro de Ayuda')).toBeVisible();
    await expect(page.getByText('Operaciones')).toBeVisible();
    await expect(page.getByText('Facturación')).toBeVisible();
  });
});
