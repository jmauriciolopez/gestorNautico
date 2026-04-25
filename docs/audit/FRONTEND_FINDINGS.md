# Auditoría Frontend — Findings

## Prioridad: 🔴 Alta · 🟡 Media · ⚪ Baja

---

## 🔴 1. TypeScript sin compilación activa

El proyecto no tiene `tsconfig.json` y `tsc --noEmit` no funciona. No hay typecheck en CI/CD.

**Impacto:** Tipos `any` dispersos en el codebase nunca fallan en compilación, permitiendo regressions de tipos.

**Archivos afectados:**
- `src/shared/api/HttpClient.ts:86-107` — métodos `post`, `put`, `patch`, `delete` con `data?: any`
- `src/features/finanzas/hooks/useFinanzas.ts` — `createCargo`, `createPago` sin tipos
- `src/features/infraestructura/pages/InfraestructuraPage.tsx:98` — `handleUpdateRack` con `data: any`
- `src/features/dashboard/pages/Dashboard.tsx:157` — `updateEmbarcacion` con `data: any`

**Acción:** Crear `tsconfig.json` basado en el template de Vite. Habilitar `strict: true` progresivamente.

---

## 🟡 2. react-hooks/exhaustive-deps — 2 advertencias

Dos `useEffect` en modales capturan closures de funciones definidas en el scope del componente sin incluirlas como dependencias o usar ref.

**Archivos:**
- `src/features/facturacion/components/FacturaDetailModal.tsx:21`
- `src/features/facturacion/components/FacturaEditModal.tsx:31`

**Acción:** Extraer `fetchAuditLogs` y `fetchPendingCargos` como funciones stable (useCallback) o usar eslint-disable con comentario Justificado.

---

## 🟡 3. Auth — Sin refresh token flow

El token se almacena en localStorage y se usa directamente. Si expira, el usuario experimenta un request 401 fallido antes de ser redirigido al login.

**Archivo:** `src/features/auth/context/AuthContext.tsx`

**Acción:** Implementar refresh token endpoint o aumentar TTL del JWT. Como mínimo, capturar token expiration desde el payload JWT (`exp`) y hacer pre-emptive redirect.

---

## 🟡 4. ReactQueryDevtools en producción

`ReactQueryDevtools` se renderiza unconditionally en `src/App.tsx:118` incluso en builds de producción.

**Archivo:** `src/App.tsx:118`

**Acción:** Envolver con `import.meta.env.DEV`:
```tsx
{import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
```

---

## 🟡 5. staleTime: 0 global

El `QueryClient` tiene `staleTime: 0` y `gcTime: 0` por defecto. Todas las queries se re-fecthdean en cada refocus de ventana, generando requests innecesarios.

**Archivo:** `src/api/queryClient.ts`

**Acción:** Definir `staleTime` por query según su naturaleza. Dashboard/stats pueden ser 30s, datos operativos 5s. `gcTime` al menos 5min.

---

## ⚪ 6. Imports no usados — 18 advertencias ESLint

Limpieza de deuda. Ningún impacto en runtime pero acumulan ruido y confusión.

**Archivos con mayores offending:**
- `src/features/clientes/components/CuentaCorrientePanel.tsx` — `Wallet`, `TrendingDown`
- `src/features/embarcaciones/hooks/useEmbarcaciones.ts` — `selectData`, `embarcaciones`, `meta`
- `src/features/facturacion/components/FacturaEditModal.tsx` — `ChevronRight`, `Package`, `Clock`, `AlertCircle`, `e`
- `src/features/finanzas/pages/FinanzasPage.tsx` — `AxiosError`
- `src/features/clientes/hooks/useClientes.ts` — `selectData`
- `src/features/servicios/hooks/useServicios.ts` — `selectData`

**Acción:** Correr `npm run lint -- --fix` o limpieza manual archivo por archivo.

---

## ⚪ 7. ConfirmDialog — Sin atributos ARIA

El modal de confirmación no tiene `role="dialog"`, `aria-modal="true"`, ni `aria-labelledby`. Visually correct pero semánticamente inaccesible.

**Archivo:** `src/shared/components/modals/ConfirmDialog.tsx`

**Acción:** Agregar:
```tsx
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="confirm-dialog-title"
>
  <h3 id="confirm-dialog-title">{options.title}</h3>
```

---

## ⚪ 8. Login shortcut en producción

Las credenciales `superadmin / super123` se pre-pueblan al hacer click en el logo en localhost.

**Archivo:** `src/features/auth/Login.tsx:35-40`

**Acción:** Deshabilitar con `import.meta.env.DEV` o feature flag `VITE_DEV_SHORTCUT=true`.

---

## ⚪ 9. useDebounce — Re-renders sin memo

El hook `useDebounce` crea un timer por cada render del componente padre sin memoización. En listas grandes con typing rápido, puede generar múltiples re-renders por character.

**Archivo:** `src/hooks/useDebounce.ts`

**Acción:** Considerar usar `useDeferredValue` de React o implementar un debounce con ref interno para evitar recreaciones.

---

## 📋 Tabla de Resumen

| # | Finding | Severidad | Esfuerzo | Archivos |
|---|--------|----------|----------|----------|
| 1 | tsconfig.json ausente | 🔴 Alta | Medio | Todo el proyecto |
| 2 | exhaustive-deps warnings | 🟡 Media | Bajo | 2 archivos |
| 3 | Sin refresh token | 🟡 Media | Alto | AuthContext |
| 4 | Devtools en prod | 🟡 Media | Bajo | App.tsx |
| 5 | staleTime 0 global | 🟡 Media | Bajo | queryClient.ts |
| 6 | Imports no usados | ⚪ Baja | Bajo | 6 archivos |
| 7 | ARIA en ConfirmDialog | ⚪ Baja | Bajo | ConfirmDialog.tsx |
| 8 | Login shortcut | ⚪ Baja | Bajo | Login.tsx |
| 9 | useDebounce sin memo | ⚪ Baja | Medio | useDebounce.ts |