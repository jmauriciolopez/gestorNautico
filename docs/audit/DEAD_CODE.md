# Dead Code Report - gestorNautico

Este reporte identifica símbolos definidos que NUNCA son usados en el workspace (referenciados 0 veces).

## 📊 Resumen de Auditoría
- **Total Símbolos Analizados**: ~12,000
- **Símbolos Muertos Identificados**: 9,221 (Incluyendo scratch, scripts y boilerplate)
- **Confianza**: 1.0 (Sin referencias detectadas)

## 🔴 Símbolos Muertos en Core (Backend)

| Símbolo | Archivo | Motivo |
| :--- | :--- | :--- |
| `AppController` | `backend/src/app.controller.ts` | Archivo no alcanzable desde el grafo principal |
| `AppService` | `backend/src/app.service.ts` | Archivo no alcanzable desde el grafo principal |
| `AuthController` | `backend/src/auth/auth.controller.ts` | Archivo no alcanzable desde el grafo principal |
| `AuthService` | `backend/src/auth/auth.service.ts` | Archivo no alcanzable desde el grafo principal |
| `LoginAttemptsService`| `backend/src/auth/login-attempts.service.ts` | No referenciado |
| `Permissions` | `backend/src/auth/decorators/permissions.decorator.ts` | Decorador sin uso activo |
| `GlobalRoute` | `backend/src/auth/decorators/global-route.decorator.ts` | Decorador sin uso activo |
| `AuthApikeyGuard` | `backend/src/auth/guards/AuthApikeyGuard.ts` | Guard no referenciado |
| `AuthTokenGuard` | `backend/src/auth/guards/AuthTokenGuard.ts` | Guard no referenciado (posible F.P. por uso en decoradores) |

## 📂 Scripts y Utilidades (Scratch)
*Estos archivos se consideran obsoletos y deberían ser eliminados.*

- `backend/scratch/check_db.js`
- `backend/scratch/check_duplicates.js`
- `backend/scratch/check_espacio.js`
- `backend/scratch/cleanup_db.js`
- `backend/scripts/db-reset.js` (Sustituido por procesos internos)
- `backend/scripts/seed-demo.js` (Sustituido por SeederService)

## ⚠️ Notas sobre Falsos Positivos
Símbolos marcados como `unreachable_file` en el backend podrían ser falsos positivos si el motor de indexación no está detectando correctamente las inyecciones de NestJS o las importaciones dinámicas. Se recomienda validación manual antes de eliminar código core.
