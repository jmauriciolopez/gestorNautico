# Estado del Proyecto - Gestor Náutico

## ✅ Completado Recientemente
- [x] **Modernización del Dashboard**: Integración del Mapa de Racks interactivo con asignación de barcos directo desde la grilla.
- [x] **Acceso Rápido a Pagos**: Nuevo botón de "Registrar Pago" en la cabecera del Dashboard vinculado al `RegistrarPagoModal`.
- [x] **Unificación de Nomenclatura de Infraestructura**: Cambio de `marina` a `ubicacion` en Backend y Backend-Services.
- [x] **Sincronización de Roadmap**: Alineación de `.antigravity/sprints.md` con el estado real del código.
- [x] **Relaciones de Servicios**: Corrección de relaciones en `ZonasService` y `EspaciosService`.
- [x] **Automatización de Facturación**: Cronjobs, campos de tarifas ajustables, envíos asincrónicos y portal público desarrollados.
- [x] **Gestor de Usuarios y Roles (Frontend)**: Módulo `/usuarios` expuesto y restringido a `SUPERADMIN`. Sidebar actualizado.
- [x] **Fix Endpoint Usuarios**: Corregida ruta `@Controller('api/users')` → `@Controller('users')`.
- [x] **Buscador Global**: `GET /search?q=` con ILike en Backend + `useGlobalSearch` + `GlobalSearchDropdown` en Frontend. Navegación directa al recurso al hacer click.
- [x] **Validación de Medidas (Frontend)**: Ya implementada en `UbicacionPickerModal.tsx`. Racks incompatibles con la eslora/manga del barco aparecen deshabilitados con badge "Chico" y mensaje de medidas.
- [x] **Fix HandlebarsAdapter**: Import corregido al alias de subpath `@nestjs-modules/mailer/adapters/handlebars.adapter`.

---

## 🏗️ En Progreso
- [ ] **Auditoría de Placeholders**: Revisión final de textos en Frontend para coherencia total con la entidad `ubicacion`.
- [ ] **Entorno de QA**: Configuración de suites de pruebas E2E con Playwright.
- [ ] **Infraestructura Dummy**: Preparar Seeders para generación de datos de prueba automáticos en el backend.

---

## 📋 Próximos Pasos (Core)
- [ ] **PDF de Facturación**: Generar documentos descargables para facturas y recibos de pago.
- [ ] **Despliegue**: Refactorización de config-loader para variables de entorno de producción.
- [ ] **Validación SMTP**: Configurar `MAIL_HOST`, `MAIL_PORT`, `MAIL_USER`, `MAIL_PASS` en `.env` y verificar envío real.

---

## 📌 Backlog: Recomendaciones Técnicas e UI

### 🛑 1. Sustituir Alertas Primitivas por Modales de Cristal
- [ ] Construir un modal de confirmación maestro `ConfirmDialog.tsx` estilo Glassmorphism/Slate-3D.
- [ ] Auditar todos los botones de borrar y reemplazar `window.confirm()` por dicho componente.

### 📖 2. Centro de Auditoría (Activity Logs)
- [ ] **Backend**: Registrar huellas explícitas al eliminar o modificar embarcaciones/titulares/configuraciones.
- [ ] **Frontend**: Proyectar grilla de logs bajo `/auditoria` para monitorización gerencial.

### ⚙️ 3. Configuración de Roles y Mensajería
- [ ] **Panel de Alertas**: Decidir canal de aviso por operación (App In-box vs Correo).
- [ ] **Guards de Renderizado**: Ocultar acciones destructivas al perfil `OPERADOR`.
