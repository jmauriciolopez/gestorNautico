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
- [x] **Infraestructura Dummy**: Seeders verificados (pre-existentes o manuales).

---

## 📋 Próximos Pasos (Core)
- [ ] **Entorno de QA**: Configuración de suites de pruebas E2E con Playwright.
- [ ] **Centro de Auditoría (Activity Logs)**:
    - [ ] Backend: Registrar cambios en entidades críticas.
    - [ ] Frontend: Vista de logs históricos.
- [ ] **Despliegue**: Refactorización de config-loader para variables de entorno de producción.

---

### 📈 1. Configuración Global y Facturación
- [x] **Centralización de Tarifas**: Implementación de `ConfiguracionService` para cuotas mensuales.
- [x] **Limpieza de Entidades**: Eliminación de `tarifaBase` en Clientes (ahora global).
- [x] **Parámetros Operativos**: Configuración de horarios de apertura y subida máxima.
- [x] **Validación Automática**: Detección de subidas "fuera de hora" en registros.

### ❓ 2. Soporte y Notificaciones
- [x] **Centro de Ayuda al Usuario**: Componente `UserHelp` con índice interactivo.
- [x] **Configuración Administrador**: Interfaz UI para editar parámetros globales de la marina.
- [x] **Notificaciones Automatizadas**: Emails y avisos in-app para servicios y deudas activos.

### 🧹 3. Limpieza y Cierre
- [x] **Sincronización de Tipos**: Lints eliminados en `ClienteForm.tsx` y controladores.
- [x] **Auditoría de Placeholders**: Barrido final exitoso.
- [x] **Validación Final**:
    - [x] `npm run lint` PASSED (Fijación de guards y formatos).
    - [x] `npm run build` PASSED (Frontend & Backend).

## 📋 Próximos Pasos (Core)
- [ ] **Entorno de QA**: Configuración de suites de pruebas E2E con Playwright.
- [ ] **Centro de Auditoría (Activity Logs)**:
    - [ ] Backend: Registrar cambios en entidades críticas.
    - [ ] Frontend: Vista de logs históricos.
- [ ] **Despliegue**: Refactorización de config-loader para variables de entorno de producción.
