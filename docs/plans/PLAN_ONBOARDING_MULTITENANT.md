# Plan de Implementación: Onboarding, Multitenancy y Trial

Este plan detalla la transformación de la plataforma a un modelo **SaaS Multitenant** con soporte para períodos de prueba (**Trial**) de 14 días.

## User Review Required

> [!NOTE]
> **Modelo de Acceso**: Se ha definido que todos los clientes accederán por el mismo subdominio. La identificación del Tenant se realizará exclusivamente a través del proceso de Login.

> [!IMPORTANT]
> **Lógica de Trial (Finalizada)**:
> 1. Duración: 14 días exactos desde el registro de la organización.
> 2. Vencimiento: Una vez cumplido el plazo, el sistema entrará en modo **Solo Lectura** (ReadOnly). Las mutaciones (POST, PUT, DELETE) serán bloqueadas globalmente.

## Proposed Changes

### 1. Núcleo de Multitenancy (Backend)

#### [NEW] [Organization Entity](file:///D:/Code/gestorNautico/backend/src/organizations/organization.entity.ts)
- Entidad `Organization`: `nombre`, `cuit_identificacion`, `logo`, `trialStartedAt`.
- Relación 1:N con `User` y otras entidades core.

#### [NEW] [Tenant Interceptor](file:///D:/Code/gestorNautico/backend/src/common/interceptors/tenant.interceptor.ts)
- Extraer `organizationId` del JWT.
- Aplicar filtros automáticos en TypeORM para asegurar que los datos estén aislados por organización.

---

### 2. Control de Acceso y Trial

#### [NEW] [ReadOnly Guard](file:///D:/Code/gestorNautico/backend/src/common/guards/read-only.guard.ts)
- Middleware/Guard que verifica si `today > trialStartedAt + 14`.
- Si ha vencido, bloquea cualquier petición que no sea GET.

#### [MODIFY] [Auth Module](file:///D:/Code/gestorNautico/backend/src/auth/auth.service.ts)
- Modificar el Login para que el JWT incluya el `organizationId`.

---

### 3. Sistema de Onboarding (Frontend & Backend)

#### [NEW] [Organization Registration](file:///D:/Code/gestorNautico/frontend/src/features/auth/pages/RegisterPage.tsx)
- Formulario de alta para la Marina (Organización) y asignación del primer usuario `ADMIN`.

#### [NEW] [Onboarding Wizard](file:///D:/Code/gestorNautico/frontend/src/features/onboarding/components/SetupWizard.tsx)
- Flujo inicial para configuración de rack/zonas.

---

### 4. Interfaz de Usuario (Frontend)

#### [NEW] [Trial Banner](file:///D:/Code/gestorNautico/frontend/src/features/dashboard/components/TrialStatus.tsx)
- Componente que muestra los días restantes de prueba.
- Banner de alerta cuando el sistema entra en modo "Solo Lectura".

## Verification Plan

### Automated Tests
- Verificar que las peticiones POST/DELETE devuelvan 403 Forbidden cuando el Trial ha vencido.
- Validar que un usuario logueado en la Org A no reciba datos de la Org B al cambiar IDs en la URL.

### Manual Verification
1. Registro de organización y validación de fecha de inicio.
2. Forzar fecha de vencimiento en DB y validar bloqueo de edición en Racks y Embarcaciones.
