import { expect, test, describe, beforeAll } from 'vitest';
import { page } from '@vitest/browser/context';

describe('Flujo de Clientes (CRUD)', () => {
  beforeAll(async () => {
    // 1. Poblado de datos iniciales en el Backend Real
    await fetch('http://localhost:3000/database/seed', { method: 'POST' });
    
    // 2. Navegar a la página de clientes
    await page.goto('http://localhost:5173/clientes');
  });

  test('Debe listar los clientes iniciales del seeder', async () => {
    // Verificar que los nombres del seeder aparezcan
    await expect.element(page.getByText('Juan Pérez')).toBeVisible();
    await expect.element(page.getByText('María García')).toBeVisible();
  });

  test('Debe permitir registrar un nuevo cliente', async () => {
    // Click en Nuevo Cliente
    await page.getByRole('link', { name: /Nuevo Cliente/i }).click();
    
    // Completar formulario
    await page.getByLabel(/Nombre/i).fill('Carlos Santana');
    await page.getByLabel(/DNI/i).fill('40123456');
    await page.getByLabel(/Teléfono/i).fill('11223344');
    await page.getByLabel(/Email/i).fill('carlos@guitar.com');
    
    // Guardar
    await page.getByRole('button', { name: /Guardar/i }).click();
    
    // Validar redirección y presencia en tabla
    await expect.element(page.getByText('Carlos Santana')).toBeVisible();
  });

  test('Debe permitir editar un cliente existente', async () => {
    // Click en Editar para Juan Pérez (suponiendo que hay un ícono de lápiz o botón Editar)
    // Buscamos la fila de Juan Pérez y clickeamos editar
    const row = page.locator('tr').filter({ hasText: 'Juan Pérez' });
    await row.getByRole('button', { name: /Editar/i }).click();
    
    // Modificar nombre
    await page.getByLabel(/Nombre/i).fill('Juan Pérez Editado');
    await page.getByRole('button', { name: /Guardar/i }).click();
    
    // Validar cambio
    await expect.element(page.getByText('Juan Pérez Editado')).toBeVisible();
  });
});
