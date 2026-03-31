# Estado del Proyecto - Gestor Náutico

## ✅ Completado Recientemente
- [x] **Sustituir Alertas Primitivas por Modales de Cristal**: Implementación de `ConfirmDialog.tsx` asincrónico con estética Glassmorphism/Slate-3D. Migración completa en todos los módulos (Clientes, Embarcaciones, Facturas, Operaciones, Usuarios, Infraestructura).
- [x] **PDF de Facturación**: Motor de PDF con `pdfkit-table`, endpoints dedicados y botones de descarga en la UI.
- [x] **Automatización de Facturación**: Cronjobs, portal público, notificaciones de deuda y envío de emails.
- [x] **Buscador Global**: Búsqueda ILike en tiempo real con dropdown de navegación directa.
- [x] **Unificación de Nomenclatura**: Cambio exitoso de `marina` a `ubicacion` (Backend/Frontend).
- [x] **Confirm Shaders**: Implementar la capa de desenfoque y animación `slide-down` en `ConfirmProvider`.
- [x] **Integración Global**: Consumir `useConfirm` en Clientes, Embarcaciones, Operaciones y Configuración.

---

## 🏗️ En Progreso
- [x] **Auditoría de Placeholders (Fase 1)**: Revisión inicial de textos en Frontend para coherencia total con `ubicacion`.
- [x] **Corrección Error 500 Facturación**: Normalización JSON y ruteo en `facturas.controller.ts`.
- [x] **Auditoría de Placeholders (Cierre final)**: Barrido exhaustivo completado.
- [x] **Configuración Centralizada**: Implementación de `ConfiguracionService` y panel UI (v1).
- [x] **Refactorizar Seeder de backend**: Truncado dinámico + CASCADE.
- [x] **Poblar infraestructura base en Seeder**: Zonas, Racks, Cunas.
- [ ] **Ejecutar suite de validación Playwright (ayuda_validacion.spec.ts)**:
    - [x] Resolver error de selectores en 'Asignar Ubicación' (Modal vs Select).
    - [ ] Validar flujo de salida/entrada.
    - [ ] Validar facturación de servicios.
- [ ] **Realizar Build Final y Linting**:
    - [ ] Backend.
    - [ ] Frontend.
- [ ] **Documentar escenarios no cubiertos**: Facturación compartida, stock insumos.
- [/] **Hito 1: Auditoría y Estabilidad (Centro de Logs)**:
    - [ ] Backend: Desarrollar entidad y servicio de Logs.
    - [ ] Frontend: Vista de trazabilidad administrativa.
- [/] **Hito 2: Calidad y QA**:
    - [/] Suite de "Ciclo de Vida Maestro" (E2E Playwright) - **EN EJECUCIÓN POR EL USUARIO**.

---

## 📋 Backlog Maestro: Futuras Fases

### 🚀 Fase 1: Portal del Socio (Autoservicio)
- [ ] **Acceso Propietarios**: Login diferenciado para dueños de embarcaciones.
- [ ] **Dashboard Socio**: Visualización de deudas, estado de embarcación y descargas.
- [ ] **Gestión de Reservas**: Solicitud de bajada online desde el portal.

### 💰 Fase 2: Finanzas Avanzadas
- [ ] **Módulo de Mora**: Cálculo automático de intereses y recargos por retraso.
- [ ] **Facturación Compartida**: División de cargos entre múltiples dueños (Copropietarios).

### 🏭 Fase 3: Madurez Industrial e Integración
- [ ] **Stock de Pañol**: Consumo de insumos integrados en órdenes de servicio.
- [ ] **Reportes Gerenciales**: Dashboards avanzados de ocupación y rentabilidad histórica.

### 🧹 Fase 4: Limpieza y Despliegue (Hardening)
- [ ] **Refactorización de Config**: Carga robusta de variables de entorno (Prod/Staging).
- [ ] **Auditoría de Seguridad**: CSP, Helmet, Rate Limiting y SSL Hardening.
- [ ] **Documentación API**: Generación automática de especificaciones OpenAPI/Swagger.

---

## 📊 Módulo de Reportes (Propuesta de Implementación)

### 🚢 Reportes Operativos (Guardería)
- [ ] **Mapa de Ocupación**: Visualización gráfica de cunas (Ocupadas vs. Disponibles) por Rack/Zona.
- [ ] **Estadísticas de Movimientos**: Cantidad de bajadas/subidas diarias para optimización de personal por hora.
- [ ] **Ranking de Uso**: Barcos que más utilizan el servicio (identificar clientes de alta intensidad).

### 💰 Reportes Financieros
- [ ] **Reporte de Morosidad (Aging)**: Detalle de deudas vencidas agrupadas por 30, 60 y 90+ días.
- [ ] **Recaudación por Medio de Pago**: Efectivo, Transferencia, Tarjeta (integración con Cajas).
- [ ] **Proyección de Ingresos**: Basado en cuotas mensuales vigentes y servicios programados.

### 📈 Perspectiva Estratégica SaaS
- [ ] **Ingreso por Metro Lineal**: Rentabilidad de la guardería basada en el tamaño de los barcos vs. tarifa.
- [ ] **Churn Rate por Club**: Alertas de clientes que dejan de pagar o retirar embarcaciones.
- [ ] **Benchmark de Precios**: Comparativa interna (anónima) de tarifas entre diferentes clubes del ecosistema.

---

## 🧹 Validación y Calidad
- [x] `npm run lint` PASSED.
- [x] `npm run build` PASSED.
- [ ] Cobertura de Tests Unitarios (>70%).
- [ ] Validación de Accesibilidad (WCAG).
