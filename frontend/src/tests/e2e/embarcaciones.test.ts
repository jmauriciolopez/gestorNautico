import { expect, test, describe, beforeAll } from 'vitest';
import { page } from '@vitest/browser/context';

describe('Flujo de Embarcaciones', () => {
  beforeAll(async () => {
    // Reset DB
    await fetch('http://localhost:4000/database/seed', { method: 'POST' });
    
    // Navegar a la página de embarcaciones
    await page.goto('http://localhost:5173/embarcaciones');
  });

  test('Debe listar las embarcaciones iniciales vinculadas a sus dueños', async () => {
    // Verificar que los barcos del seeder aparezcan
    await expect.element(page.getByText('La Mary')).toBeVisible();
    await expect.element(page.getByText('Juan Pérez')).toBeVisible();
    await expect.element(page.getByText('El Titán')).toBeVisible();
    await expect.element(page.getByText('María García')).toBeVisible();
  });

  test('Debe permitir registrar una nueva embarcación con dueño', async () => {
    // Ir a formulario
    await page.getByRole('link', { name: /Registrar Barco/i }).click();
    
    // Completar formulario
    await page.getByLabel(/Nombre/i).fill('Santa María');
    await page.getByLabel(/Matrícula/i).fill('MAT-999');
    
    // Selección de dueño real (Juan Pérez del seeder)
    await page.getByLabel(/Dueño/i).selectOption('1'); // ID del primer cliente creado en el seeder
    
    await page.getByLabel(/Eslora/i).fill('12.5');
    await page.getByLabel(/Manga/i).fill('4.2');
    
    // Guardar
    await page.getByRole('button', { name: /Guardar/i }).click();
    
    // Validar redirección y presencia en la lista
    await expect.element(page.getByText('Santa María')).toBeVisible();
    await expect.element(page.getByText('Juan Pérez')).toBeVisible();
  });
});
