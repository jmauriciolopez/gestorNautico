# Plan de Implementación: Onboarding, Multitenancy y Trial

Este plan detalla la transformación de la plataforma a un modelo **SaaS Multitenant** con soporte para períodos de prueba (**Trial**) de 14 días.

## Estado del Proyecto

> [!NOTE]
> **Multitenancy**: La infraestructura base de aislamiento de datos ya ha sido implementada exitosamente utilizando `guarderiaId` como identificador de organización.

## User Review Required

> [!NOTE]
> **Modelo de Acceso**: Se ha definido que todos los clientes accederán por el mismo subdominio. La identificación del Tenant se realiza a través del header `x-guarderia-id` y el JWT.

> [!IMPORTANT]
> **Lógica de Trial (Pendiente)**:
> 1. Duración: 14 días exactos desde el registro de la guardería.
> 2. Vencimiento: Una vez cumplido el plazo, el sistema entrará en modo **Solo Lectura** (ReadOnly). Las mutaciones (POST, PUT, DELETE) serán bloqueadas globalmente.

## Proposed Changes

### 1. Núcleo de Multitenancy (Backend) [FINALIZADO]

#### [MODIFY] [Guarderia Entity](file:///D:/Code/gestorNautico/backend/src/guarderias/guarderia.entity.ts)
- Entidad `Guarderia`: `nombre`, `slug`, `activo`, etc. (Ya existe).
- **Pendiente**: Extender con `trialStartedAt`, `finalizoOnboarding` y asegurar control por `activo`.


#### [MODIFY] [Tenant Interceptor](file:///D:/Code/gestorNautico/backend/src/common/interceptors/tenant.interceptor.ts)
- Inyecta `tenant` en el request basado en el header y el usuario.

---

### 2. Control de Acceso y Trial [EN PROCESO]

#### [NEW] [Trial Guard](file:///D:/Code/gestorNautico/backend/src/auth/guards/trial.guard.ts)
- Middleware/Guard que verifica si `today > trialStartedAt + 14`.
- Si ha vencido, bloquea cualquier petición que no sea GET.

#### [MODIFY] [Auth Module](file:///D:/Code/gestorNautico/backend/src/auth/auth.service.ts)
- Login configurado para incluir `guarderiaId` en el payload.

---

### 3. Sistema de Onboarding (Frontend & Backend) [PENDIENTE]

#### [NEW] [Signup Page](file:///D:/Code/gestorNautico/frontend/src/features/auth/pages/Signup.tsx)
- Formulario de alta para la Marina (Guardería) y asignación del primer usuario `ADMIN`.

#### [NEW] [Onboarding Wizard](file:///D:/Code/gestorNautico/frontend/src/features/onboarding/components/SetupWizard.tsx)
- Flujo inicial para configuración de rack/zonas.
- **Navegación**: Soporte para navegar atrás/adelante y actualizar datos ya ingresados.


---

### 4. Interfaz de Usuario (Frontend) [PENDIENTE]

#### [NEW] [Trial Banner](file:///D:/Code/gestorNautico/frontend/src/features/dashboard/components/TrialStatus.tsx)
- Componente que muestra los días restantes de prueba.
- Banner de alerta cuando el sistema entra en modo "Solo Lectura".

## Verification Plan

### Automated Tests
- Verificar que las peticiones POST/DELETE devuelvan 403 Forbidden cuando el Trial ha vencido.
- Validar que un usuario logueado en la Guardería A no reciba datos de la Guardería B.

### Manual Verification
1. Registro de organización y validación de fecha de inicio.
2. Forzar fecha de vencimiento en DB y validar bloqueo de edición.

