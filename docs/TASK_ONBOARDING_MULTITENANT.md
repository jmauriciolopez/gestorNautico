# Tareas: Implementación Multitenancy y Trial de 14 Días

Este documento detalla los pasos atómicos necesarios para transformar el sistema a un modelo SaaS con aislamiento de datos y control de prueba.

## Fase 1: Base de Datos y Multitenancy (Backend)
- [ ] **Crear Entidad Organization**
    - [ ] Definir `Organization` en TypeORM (`nombre`, `slug`, `trialStartedAt`, etc.).
    - [ ] Crear migración e impactar en base de datos.
- [ ] **Aislamiento de Datos**
    - [ ] Agregar `organizationId` a las entidades principales (`User`, `Cliente`, `Embarcacion`, `Rack`, `Zonas`, `Facturas`).
    - [ ] Crear Decorador `@TenantId()` para inyectar la organización en los servicios.
    - [ ] Implementar `TenantInterceptor` para filtrar consultas automáticamente por `organizationId`.

## Fase 2: Autenticación y Seguridad
- [ ] **Actualizar JWT y Login**
    - [ ] Modificar `AuthService` para que el `organizationId` se incluya en el payload del token.
    - [ ] Asegurar que el Login valide que el usuario pertenece a una organización activa.
- [ ] **Lógica de Trial (Modo ReadOnly)**
    - [ ] Crear `TrialGuard` para calcular los 14 días de gracia.
    - [ ] Bloquear métodos `POST`, `PUT`, `PATCH`, `DELETE` si el trial ha expirado.
    - [ ] Retornar código de estado `403 Forbidden` con mensaje personalizado ("Trial Expirado").

## Fase 3: Onboarding y Registro (Fullstack)
- [ ] **Registro de Organizaciones**
    - [ ] [Backend] Crear endpoint `POST /auth/register-organization`.
    - [ ] [Frontend] Crear página `RegisterPage` con formulario de Marina y Admin.
- [ ] **Setup Wizard**
    - [ ] [Frontend] Crear flujo guiado para que el nuevo Admin cree su primera `Ubicacion` y `Rack`.

## Fase 4: Interfaz y Feedback (Frontend)
- [ ] **Indicadores de Trial**
    - [ ] Crear `TrialStatusBanner` en el Dashboard.
    - [ ] Implementar overlay de "Modo Lectura" cuando el trial venza.
- [ ] **Protección de Rutas**
    - [ ] Deshabilitar botones de "Guardar" o "Eliminar" en la UI si el trial está expirado (opcional, para mejor UX).

## Fase 5: Verificación
- [ ] Pruebas de aislamiento (Cross-tenant data leak prevention).
- [ ] Pruebas de expiración (Manual date injection en DB).
