# Tareas: Implementación Onboarding, Multitenancy y Trial

Este documento centraliza el progreso siguiendo el plan de fases aprobado.

## Fase 1: Infraestructura Backend y Datos [COMPLETO]
- [x] **Extender Entidad Guarderia**
    - [x] Agregar `trialStartedAt` (Date).
    - [x] Agregar `finalizoOnboarding` (Boolean).
    - [x] Generar y ejecutar migración TypeORM (Auto-sync habilitado).
- [x] **Endpoint de Templates**
    - [x] Crear `GET /import/templates/:type` en `ImportController`.
- [x] **Seguridad de Trial**
    - [x] Implementar `TrialGuard` (Read-Only mode).
- [x] **Validación Fase 1**
    - [x] Build, Lint y Check de Tipos (Backend).

## Fase 2: Autenticación y Estructura de Onboarding [PENDIENTE]
- [ ] **Renombrado de Registro**
    - [ ] `RegisterPage` -> `SignupPage` (Frontend).
    - [ ] `POST /auth/signup` (Backend).
- [ ] **Layout de Onboarding**
    - [ ] Crear `OnboardingLayout` con persistencia de estado.
- [ ] **Validación Fase 2**
    - [ ] Build, Lint y Check de Tipos (Frontend).

## Fase 3: Pasos del Onboarding (Wizard) [PENDIENTE]
- [ ] **Paso 1: Perfil de la Marina**
- [ ] **Paso 2: Configuración Operativa**
- [ ] **Paso 3: Infraestructura (Zonas/Racks)**
- [ ] **Paso 4: Políticas y Mora**
- [ ] **Paso 5: Migración (Descarga de CSV)**
- [ ] **Cierre de Onboarding**
    - [ ] Actualizar `finalizoOnboarding: true`.
- [ ] **Validación Fase 3**
    - [ ] Build, Lint y Check de Tipos (Fullstack).

## Fase 4: UX de Trial y Cierre [PENDIENTE]
- [ ] **Trial Status Banner**
- [ ] **Bloqueo Read-Only en UI**
- [ ] **Validación Final**
    - [ ] Smoke test E2E.
    - [ ] Build final monorepo.


