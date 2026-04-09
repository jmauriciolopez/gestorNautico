# Project Structure — Gestor Náutico

## Repository Layout

```
gestorNautico/
├── backend/                  # NestJS REST API
│   └── src/
│       ├── app.module.ts     # Root module, wires all feature modules
│       ├── main.ts           # Bootstrap entry point
│       ├── auth/             # JWT authentication, guards, decorators
│       ├── users/            # User management & roles
│       ├── clientes/         # Client (marina customer) management
│       ├── embarcaciones/    # Vessel management
│       ├── ubicaciones/      # Berth location assignments
│       ├── zonas/            # Zone definitions
│       ├── racks/            # Rack definitions
│       ├── espacios/         # Individual berth/space definitions
│       ├── movimientos/      # Vessel entry/exit movements
│       ├── pedidos/          # Service requests
│       ├── operaciones/      # Launch/retrieval operations
│       ├── cajas/            # Cash register / till
│       ├── cargos/           # Charge line items
│       ├── pagos/            # Payment records
│       ├── facturas/         # Invoices + automatic billing scheduler
│       ├── catalogo/         # Service catalog
│       ├── registros/        # Service log entries
│       ├── notificaciones/   # Email notifications (Handlebars templates)
│       ├── dashboard/        # KPI aggregation
│       ├── search/           # Global search
│       ├── configuracion/    # Per-installation settings
│       ├── database/         # Seeder & initial data services
│       └── common/pdf/       # Shared PDF generation (pdfkit)
│
├── frontend/                 # React + Vite SPA
│   └── src/
│       ├── api/              # fetchClient (fetch wrapper) + queryClient (TanStack Query)
│       ├── components/       # Shared UI: auth guards, layout, search
│       ├── context/          # ThemeContext (dark/light mode)
│       ├── features/         # Feature-sliced modules (see below)
│       ├── hooks/            # Shared hooks (useDebounce, useGlobalSearch)
│       ├── shared/           # Cross-feature: ConfirmContext, shared components
│       ├── types/            # Global TypeScript types (Role enum, entities)
│       ├── App.tsx           # Router setup, providers composition
│       └── main.tsx          # Vite entry point
│
├── .amazonq/rules/memory-bank/  # AI assistant memory bank
├── .antigravity/                # Architecture & sprint docs
├── docs_guarderia_nautica/      # Extended API & architecture docs
└── guarderia-nautica-repo/      # Reference documentation
```

## Frontend Feature Slice Structure

Each feature under `frontend/src/features/<feature>/` follows:
```
<feature>/
├── pages/        # Route-level page components
├── components/   # Feature-specific UI components
├── hooks/        # Feature-specific React Query hooks
└── context/      # Feature-specific context (e.g. AuthContext)
```

Features: `auth`, `clientes`, `embarcaciones`, `operaciones`, `infraestructura`, `finanzas`, `facturacion`, `servicios`, `dashboard`, `notificaciones`, `configuracion`, `users`, `help`

## Backend Module Structure

Each NestJS module under `backend/src/<module>/` follows:
```
<module>/
├── <module>.module.ts      # Module definition, imports, providers
├── <module>.controller.ts  # HTTP route handlers
├── <module>.service.ts     # Business logic
├── <entity>.entity.ts      # TypeORM entity
└── dto/                    # Data Transfer Objects (class-validator)
```

## Core Architectural Patterns

### Backend
- NestJS modular architecture — each domain is a self-contained module
- TypeORM with PostgreSQL; entities use `synchronize: true` in development
- JWT authentication stored in HttpOnly cookies
- Role-based access control via custom `@Permissions()` decorator and `AuthTokenGuard`
- Swagger/OpenAPI documentation via `@ApiTags` decorators
- Scheduled tasks via `@nestjs/schedule` (automatic billing)
- Email via `@nestjs-modules/mailer` with Handlebars templates
- PDF generation via `pdfkit` in a shared `common/pdf` module

### Frontend
- React 19 + React Router v7 for SPA routing
- TanStack Query v5 for server state (caching, mutations, invalidation)
- Axios + custom `fetchClient` wrapper for HTTP calls
- CSS custom properties (`var(--bg-primary)`, etc.) for theming via ThemeContext
- Tailwind CSS for utility-first styling
- `ProtectedRoute` + `RoleGuard` components enforce RBAC on the client side
- `ConfirmContext` provides a global async confirmation dialog
- `react-hot-toast` for notifications; `framer-motion` for animations
- Recharts for dashboard data visualization

## Key Component Relationships

```
App.tsx
 └── QueryClientProvider → ThemeProvider → BrowserRouter
      └── AuthProvider → ConfirmProvider
           └── ProtectedRoute (checks auth + role)
                └── AppLayout (sidebar + outlet)
                     └── Feature Pages (consume React Query hooks)
                          └── fetchClient → NestJS API
```

```
NestJS Request Flow:
HTTP Request → AuthTokenGuard (JWT cookie) → Controller → Service → TypeORM Repository → PostgreSQL
```
