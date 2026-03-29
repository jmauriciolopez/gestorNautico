# Estado del Proyecto - Gestor Náutico

## ✅ Completado Recientemente
- [x] **Modernización del Dashboard**: Integración del Mapa de Racks interactivo con asignación de barcos directo desde la grilla.
- [x] **Acceso Rápido a Pagos**: Nuevo botón de "Registrar Pago" en la cabecera del Dashboard vinculado al `RegistrarPagoModal`.
- [x] **Unificación de Nomenclatura de Infraestructura**: Cambio de `marina` a `ubicacion` en Backend y Backend-Services.
- [x] **Sincronización de Roadmap**: Alineación de `.antigravity/sprints.md` con el estado real del código.
- [x] **Relaciones de Servicios**: Corrección de relaciones en `ZonasService` y `EspaciosService`.

## 🏗️ En Progreso
- [ ] **Auditoría de Placeholders**: Revisión final de textos en Frontend para coherencia total con la entidad `ubicacion`.
- [ ] **Entorno de QA**: Configuración de suites de pruebas E2E con Playwright.
- [ ] **Infraestructura Dummy**: Preparar Seeders para generación de datos de prueba automáticos en el backend.

## 📋 Próximos Pasos (Core)
- [ ] **Validación de Medidas**: Implementar validación en el Backend para asegurar que un barco quepa físicamente en el espacio asignado (Eslora/Manga).
- [ ] **PDF de Facturación**: Generar documentos descargables para facturas y recibos de pago.
- [ ] **Despliegue**: Refactorización de config-loader para variables de entorno de producción.

## 📌 Backlog: Funcionalidades de Base (Brechas Detectadas)
- [ ] **Búsqueda Global**: Implementar motor de filtrado dinámico en tiempo real para Clientes, Barcos y Espacios en la cabecera principal.
- [ ] **Modal de Confirmación Premium**: Reemplazar prompts nativos/eliminaciones directas por un modal tipo Slate-3D para seguridad en acciones críticas.
- [ ] **Historial de Auditoría Operativa**: Crear vista especializada de logs para el seguimiento de quién realizó cada maniobra/pago.
- [ ] **Preferencias de Usuario**: Implementar gestión de estados de notificación y temas para cada perfil técnico.
- [ ] **ACL en Interfaz**: Ocultar o deshabilitar acciones de borrado/edición basándose estrictamente en el rol del usuario autenticado.
- [ ] **Automatización de Facturación**: Implementar campo `tarifaMensual` en embarcaciones y un `CronJob` (día 1 de cada mes) para la generación automática de cargos recurrentes.
