# Backlog de Estabilización: Finanzas y Facturación

Este documento lista todas las tareas pendientes identificadas en las auditorías de los módulos de Finanzas y Facturación.

## 🔴 Prioridad Alta (Críticos)

Estas tareas resuelven fallos de seguridad, integridad de datos o errores que afectan directamente al cliente.

### Finanzas
- [ ] **Backend**: Crear `CreatePagoDto` con `class-validator` para validar montos y tipos de datos.
- [ ] **Backend**: Implementar `AbrirCajaDto` y `CerrarCajaDto` para validar saldos iniciales/finales.
- [ ] **Backend**: Paginar el endpoint `findAll` de Pagos (actualmente descarga la tabla completa).
- [ ] **Frontend**: Corregir el hook `useCargos` para que pase los parámetros `page` y `limit` al backend.
- [ ] **Frontend**: Sincronizar el hook `getPagos` con la nueva paginación del backend.

### Facturación
- [ ] **Backend**: Crear DTOs de validación para `create()`, `update()` y `updateEstado` de Facturas.
- [ ] **Backend**: **URGENTE**: Configurar `paymentLink` para que use una URL pública real en lugar de `localhost`.
- [ ] **Frontend**: Refactorizar `useFacturas` para que no descarte la información de páginas/totales.
- [ ] **Frontend**: Corregir los cálculos de KPI en la página de facturación (deben sumar el total real, no solo lo que hay en la primera página).

---

## 🟡 Prioridad Media (UX y Performance)

Mejoran la experiencia del usuario y evitan que el sistema se vuelva lento.

### Finanzas
- [ ] **Backend**: Optimizar `getResumen()` de Caja mediante agregación SQL (`SUM()`) en lugar de carga en JS.
- [ ] **Frontend**: Agregar `toast.error` en las operaciones de apertura/cierre de caja.
- [ ] **Frontend**: Eliminar el ordenado en cliente (`.sort()`) en la lista de Pagos (usar orden del backend).
- [ ] **Frontend**: Definir acción para el botón `ArrowUpRight` en la lista de pagos o eliminarlo si es basura.

### Facturación
- [ ] **Backend**: Corregir race condition en `generateNextNumero()` (manejar fallos de numeración duplicada).
- [ ] **Backend**: Corregir auditoría de vencidas (usar `fechaVencimiento` en lugar de `emisión`).
- [ ] **Frontend**: Extraer el selector de método de pago a un componente modal con `createPortal` para evitar errores visuales (clipping).
- [ ] **Frontend**: Agregar feedback visual (`toast`) al liquidar facturas.

---

## 🟢 Prioridad Baja (Mantenimiento)

Mejoras en el código y estética.

- [ ] **Backend**: Remover `eager: true` de las entidades `Cargo` y `Factura` para optimizar consultas de base de datos.
- [ ] **Backend**: Reemplazar `usuarioId: 1` hardcodeado por roles dinámicos en notificaciones.
- [ ] **Frontend**: Eliminar colores `slate-*` hardcodeados en Finanzas para que soporten el Modo Claro.
