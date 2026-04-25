# Auditoría Backend — Findings

## Prioridad: 🔴 Alta · 🟡 Media · ⚪ Baja

---

## 🔴 1. `synchronize: true` en producción

El `app.module.ts:85` tiene `synchronize: true` habilitado en la conexión TypeORM. Esto permite que TypeORM modifique el esquema de la DB automáticamente en cada start.

**Archivo:** `src/app.module.ts:85`

**Acción:** Deshabilitar para producción:
```ts
synchronize: process.env.NODE_ENV !== 'production',
```
O mejor, usar migrations con TypeORM.

---

## 🔴 2. `PdfService` — 140+ errores de tipos con `any` dispersos

`pdfkit-table` no tiene tipos TypeScript oficiales. El archivo entero usa `as any` para call chains sobre `PDFDocument`. Cada método `.text()`, `.fontSize()`, `.moveDown()`, `.fillColor()`, `.table()`, etc. es `any`-typed.

**Archivo:** `src/common/pdf/pdf.service.ts`

**Acción:** Crear un archivo de declaración de tipos para `pdfkit-table`:
```ts
// src/common/pdf/pdfkit.d.ts
declare module 'pdfkit-table' {
  import { PDFDocument as PDFKitDocument, PDFPage, TableOptions } from 'pdfkit';
  export default class PDFDocument {
    // ... типизировать методы цепочки
    text(content: string, x?: number, y?: number, options?: object): this;
    fontSize(size: number): this;
    fillColor(color: string): this;
    moveDown(lines?: number): this;
    // ...
    table(data: object, options?: TableOptions): this;
  }
}
```
O usar `// eslint-disable-next-line` por archivo con justificación.

---

## 🟡 3. `AuthService` — Migración de contraseñas en texto plano

En `auth.service.ts:28-33`, si la contraseña no hace match con bcrypt y no empieza con `$2b$`, se hace match contra texto plano directo y se migra. Esto es un vector de ataque si la DB está comprometida o si hay logs.

**Archivo:** `src/auth/auth.service.ts:28-33`

**Acción:** Registrar un evento de auditoría al migrar. Deshabilitar el plaintext fallback después de la migración inicial. Implementar una flag de `forceRehash` en la entidad User.

---

## 🟡 4. `auth.service.ts` — Sin rate limiting en login

El endpoint `/auth/login` no tiene protección contra brute force. Un atacante puede intentar fuerza bruta sin límite.

**Archivo:** `src/auth/auth.controller.ts` (ausente endpoint implícito vía auth.service)

**Acción:** Implementar Throttler de NestJS o un guard personalizado de rate limiting:
```ts
@UseGuards(ThrottlerGuard)
@Post('login')
async login(@Body() loginDto: LoginDto) { ... }
```

---

## 🟡 5. `DashboardService` — Queries N+1 potenciales

El método `getSummary()` hace 12 queries secuenciales/parallel. Algunas queries como `getFinanzasSeries()` ejecutan 6 queries SQL adicionales dentro de un `Promise.all()`. En alta concurrencia, esto puede generar carga significativa.

**Archivo:** `src/dashboard/dashboard.service.ts:30-107`

**Acción:** Consolidar las queries de series financieras en una sola query SQL con `GROUP BY`.

---

## 🟡 6. `AuthTokenGuard` — `console.log` en producción

El guard usa `console.log` para errores de autenticación y token faltante. Esto genera ruido en logs de producción.

**Archivo:** `src/auth/guards/AuthTokenGuard.ts:35,48`

**Acción:** Usar el `Logger` de NestJS inyectable en su lugar.

---

## 🟡 7. `SeederService` — Truncate sin restricción en producción

El seeder hace `TRUNCATE TABLE ... CASCADE` en todas las tablas. Si se corre en producción, destruye todos los datos.

**Archivo:** `src/database/seeder.service.ts:44-57`

**Acción:** Agregar guard check:
```ts
if (process.env.NODE_ENV === 'production') {
  throw new Error('Seed no permitido en producción');
}
```

---

## 🟡 8. `ClientesService.getCuentaCorriente` — Sin paginación

Trae TODOS los cargos y pagos de un cliente sin límite. Un cliente con 10,000 movimientos consume mucha memoria.

**Archivo:** `src/clientes/clientes.service.ts:74-113`

**Acción:** Agregar paginación con límite por defecto y cursor-based pagination para el historial.

---

## 🟡 9. `CajasService.getResumen` — Query SQL cruda sin type safety

El aggregate en SQL usa `getRawOne()` con cast manual a `string`. Funciona pero frágil si el schema cambia.

**Archivo:** `src/cajas/cajas.service.ts:165-174`

**Acción:** Definir una interfaz para el resultado raw:
```ts
interface CajasRawAgg {
  totalRecaudado: string;
  totalEfectivo: string;
}
```

---

## 🟡 10. `JwtService.verifyAsync` retorna `unknown`

En `AuthTokenGuard.ts:41`, `payload` es `unknown`. Se asigna directo a `request.user` sin validación de tipo.

**Archivo:** `src/auth/guards/AuthTokenGuard.ts:41-44`

**Acción:** Definir interfaz `JwtPayload` y type-guard:
```ts
interface JwtPayload {
  sub: number;
  usuario: string;
  role: string;
  nombre: string;
}
```

---

## ⚪ 11. `app.module.ts` — `MailerModule` requerido globalmente

El módulo de mailer se importa unconditionally. Si `MAIL_*` vars de entorno no están seteadas, falla en startup. El app no puede arrancar sin configuración de email.

**Archivo:** `src/app.module.ts:49-73`

**Acción:** Opcionalizar con `ConfigService` check:
```ts
MailerModule.forRootAsync({
  useFactory: (configService: ConfigService) => {
    if (!configService.get('MAIL_HOST')) return {};
    // ...
  }
})
```

---

## ⚪ 12. Imports no usados — `IsPositive` en DTO

`caja-operacion.dto.ts` importa `IsPositive` pero no lo usa.

**Archivo:** `src/cajas/dto/caja-operacion.dto.ts:1`

**Acción:** `npm run lint --fix`.

---

## ⚪ 13. `pdf.service.ts` — `require()` en ESM

Usa `require('pdfkit-table')` con comment `eslint-disable`. Funciona en CJS pero el proyecto usa ESM.

**Archivo:** `src/common/pdf/pdf.service.ts:2-3`

**Acción:** Convertir a import dinámico:
```ts
const PDFDocument = (await import('pdfkit-table')).default;
```

---

## ⚪ 14. `DashboardService` — `as any` en order anidado

En `getRackMap()`, el order anidado de TypeORM usa `as any` para mantener la query funcionando.

**Archivo:** `src/dashboard/dashboard.service.ts:233`

**Acción:** Definir el tipo correcto de `FindOptionsRelations` para `Zona`.

---

## ⚪ 15. `ValidationPipe` — `require()` dentro de factory

En `main.ts:53`, usa `require('@nestjs/common')` dentro de la exceptionFactory en lugar del import top-level.

**Archivo:** `src/main.ts:53`

**Acción:** Mover `BadRequestException` al import del file.

---

## 📋 Tabla de Resumen

| # | Finding | Severidad | Esfuerzo | Archivos |
|---|--------|----------|----------|----------|
| 1 | synchronize: true prod | 🔴 Alta | Bajo | app.module.ts |
| 2 | PdfService 140+ any errors | 🔴 Alta | Alto | pdf.service.ts |
| 3 | Password plaintext fallback | 🟡 Media | Bajo | auth.service.ts |
| 4 | Sin rate limiting login | 🟡 Media | Medio | auth.controller.ts |
| 5 | N+1 queries dashboard | 🟡 Media | Medio | dashboard.service.ts |
| 6 | console.log en guard | 🟡 Media | Bajo | AuthTokenGuard.ts |
| 7 | Seeder destructive en prod | 🟡 Media | Bajo | seeder.service.ts |
| 8 | getCuentaCorriente sin límite | 🟡 Media | Bajo | clientes.service.ts |
| 9 | Query raw sin tipo | 🟡 Media | Bajo | cajas.service.ts |
| 10 | Jwt payload unknown | 🟡 Media | Bajo | AuthTokenGuard.ts |
| 11 | MailerModule requerido | 🟡 Media | Medio | app.module.ts |
| 12 | Import IsPositive no usado | ⚪ Baja | Bajo | caja-operacion.dto.ts |
| 13 | require() ESM en pdf | ⚪ Baja | Medio | pdf.service.ts |
| 14 | as any order nested | ⚪ Baja | Medio | dashboard.service.ts |
| 15 | require() en ValidationPipe | ⚪ Baja | Bajo | main.ts |