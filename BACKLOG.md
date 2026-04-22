# Backlog Maestro: Gestor Náutico

## 🔴 Prioridad Actual: Calidad y Estabilidad
- [ ] **Ejecutar suite de validación Playwright (ayuda_validacion.spec.ts)**:
    - [ ] Validar flujo completo de salida/entrada.
    - [ ] Validar facturación de servicios desde órdenes.
- [ ] **Hito 1: Centro de Logs**:
    - [ ] Backend: Desarrollar entidad y servicio de Logs para trazabilidad.
    - [ ] Frontend: Vista de trazabilidad administrativa.
- [ ] **Documentar escenarios no cubiertos**: Facturación compartida, stock insumos.

---

## 🟡 Próximas Fases (Roadmap)

### Fase 1: Portal del Socio (Autoservicio)
- [ ] **Acceso Propietarios**: Login diferenciado para dueños de embarcaciones.
- [ ] **Dashboard Socio**: Visualización de deudas, estado de embarcación y descargas.
- [x] **Gestión de Reservas**: Solicitud de bajada online.

### Fase 2: Finanzas Avanzadas
- [x] **Módulo de Mora**: Cálculo automático de intereses y recargos.
- [ ] **Facturación Compartida**: División de cargos entre copropietarios.

### Fase 3: Madurez SaaS
- [ ] **Implementación Multi-Tenant**: Ver `docs/plans/PLAN_MULTITENANT.md`.
- [ ] **Stock de Pañol**: Consumo de insumos integrados.

---

## ✅ Completado Recientemente (Hitos Logrados)
- [x] **Reportes Analíticos (V1)**: Dashboard de ocupación e ingresos mensuales con Recharts.
- [x] **Unificación de Documentación**: Consolidación de archivos .md en `docs/`.
- [x] **Auditoría de Deuda Técnica (Clientes/Embarcaciones)**: DTOs, validaciones y optimización de queries (N+1).
- [x] **Estilo Visual 3D/Glassmorphism**: Modales de confirmación y sistema de diseño semántico.
- [x] **Facturación PDF**: Generación y descarga de comprobantes.
- [x] **Buscador Global**: Búsqueda en tiempo real ILike.
