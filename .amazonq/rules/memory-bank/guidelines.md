# Development Guidelines — Gestor Náutico

## Code Quality Standards

### TypeScript
- Backend uses relaxed TypeScript: `strictNullChecks: false`, `noImplicitAny: false` — avoid adding strict annotations that break existing patterns
- Frontend uses `typescript-eslint` recommended rules with `@typescript-eslint/no-explicit-any: 'off'` — `any` is permitted but should be minimized
- Unused variables trigger a warning; prefix intentionally unused params with `_` (e.g., `_id`)
- Always enable `emitDecoratorMetadata` and `experimentalDecorators` in backend tsconfig (required for NestJS DI)

### ESLint / Formatting
- Both layers use flat ESLint config (`eslint.config.js` / `eslint.config.mjs`) with `typescript-eslint`
- Frontend enforces `react-hooks/rules-of-hooks` and `react-refresh/only-export-components`
- Backend uses `eslint-config-prettier` + `eslint-plugin-prettier` — formatting is Prettier-driven
- Run `npm run format` (backend) before committing to normalize code style

---

## Backend Patterns (NestJS)

### Module Structure
Every domain follows this exact file layout:
```
<domain>/
├── <domain>.module.ts      # @Module() — imports, providers, controllers, exports
├── <domain>.controller.ts  # @Controller() + @UseGuards() + @Roles()
├── <domain>.service.ts     # @Injectable() — business logic + TypeORM repository
├── <domain>.entity.ts      # @Entity() — TypeORM entity class
└── dto/                    # Optional: CreateXxxDto, UpdateXxxDto
```

### Controller Pattern
```typescript
@Controller('clientes')
@UseGuards(AuthTokenGuard, RolesGuard)
@Roles(Role.SUPERADMIN, Role.ADMIN, Role.OPERADOR)
export class ClientesController {
  constructor(private readonly clientesService: ClientesService) {}

  @Get()    findAll() { return this.clientesService.findAll(); }
  @Get(':id') findOne(@Param('id') id: string) { return this.clientesService.findOne(+id); }
  @Post()   create(@Body() dto: Partial<Entity>) { return this.clientesService.create(dto); }
  @Put(':id') update(@Param('id') id: string, @Body() dto: Partial<Entity>) { ... }
  @Delete(':id') remove(@Param('id') id: string) { ... }
}
```
- Always apply `@UseGuards(AuthTokenGuard, RolesGuard)` at class level
- Always apply `@Roles(...)` at class level with the minimum required roles
- Convert string `id` params to number with `+id`
- Add `@ApiTags('ModuleName')` for Swagger documentation

### Entity Pattern
```typescript
@Entity('table_name')
export class MyEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 150 })
  nombre: string;

  @Column({ default: true })
  activo: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```
- Use `@PrimaryGeneratedColumn()` for auto-increment IDs
- Always include `@CreateDateColumn()` and `@UpdateDateColumn()`
- Use `@Column({ type: 'enum', enum: EnumType, default: EnumType.VALUE })` for enum columns
- Enums are defined in the entity file and re-exported (e.g., `Role` in `user.entity.ts`)

### Auth Decorators
```typescript
// Mark a route as public (bypasses AuthTokenGuard)
@Public()
@Get('public-endpoint')

// Restrict to specific roles
@Roles(Role.ADMIN, Role.SUPERADMIN)

// Fine-grained permissions (metadata only — implement guard separately)
@Permissions('clientes:write')
```
- `@Public()` sets `IS_PUBLIC_KEY` metadata; `AuthTokenGuard` checks this before validating JWT
- `@Permissions()` uses `SetMetadata(PERMISSIONS_KEY, permissions)` — variadic string args

### Authentication Flow
- JWT extracted from `Authorization: Bearer <token>` header OR `token` httpOnly cookie
- Login sets `token` cookie (httpOnly, secure in prod, `sameSite: 'none'` in prod / `'lax'` in dev)
- `ConfigService` used for all env var access — never use `process.env` directly in services

### Async Module Configuration
```typescript
TypeOrmModule.forRootAsync({
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => ({ ... }),
})
```
- Always use `forRootAsync` + `ConfigService` for modules that need env vars (TypeORM, Mailer)

### Validation
- Global `ValidationPipe` with `{ transform: true, whitelist: true, forbidNonWhitelisted: true }`
- DTOs use `class-validator` decorators (`@IsString()`, `@IsEmail()`, `@IsOptional()`, etc.)
- `whitelist: true` strips unknown properties automatically

---

## Frontend Patterns (React)

### HTTP Client Usage
Two clients exist — use `httpClient` (axios, `shared/api/HttpClient.ts`) as the primary:
```typescript
import { httpClient } from '../../../shared/api/HttpClient';

// GET
const data = await httpClient.get<MyType>('/endpoint');

// POST
const result = await httpClient.post<MyType>('/endpoint', payload);

// PUT / PATCH / DELETE
await httpClient.put<MyType>('/endpoint/1', payload);
await httpClient.delete('/endpoint/1');
```
- `httpClient` automatically injects `Authorization: Bearer <token>` from `localStorage`
- `httpClient` handles 401 responses by calling the `unauthorizedCallback` (set by `AuthContext`)
- `fetchClient` (native fetch) exists but is secondary — prefer `httpClient` for new code

### TanStack Query Pattern
```typescript
// Query
const { data, isLoading, error } = useQuery({
  queryKey: ['clientes'],
  queryFn: () => httpClient.get<Cliente[]>('/clientes'),
});

// Mutation
const mutation = useMutation({
  mutationFn: (data: Partial<Cliente>) => httpClient.post('/clientes', data),
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ['clientes'] }),
});
```
- Always invalidate related queries on mutation success
- Query keys should be arrays: `['entity']` or `['entity', id]`

### Auth & Role-Based Access
```typescript
// Access auth state
const { user, isAuthenticated, login, logout } = useAuth();

// Protect routes by role
<ProtectedRoute allowedRoles={[Role.ADMIN, Role.SUPERADMIN]}>
  <Route path="finanzas" element={<FinanzasPage />} />
</ProtectedRoute>
```
- `useAuth()` must be used inside `<AuthProvider>`
- Token stored in `localStorage` under key `'token'`
- Session verified on app load via `GET /auth/me`

### Theming
- Use CSS variables for all colors: `var(--bg-primary)`, `var(--bg-secondary)`, `var(--text-primary)`, `var(--text-secondary)`
- Combine with Tailwind: `className="bg-[var(--bg-primary)] text-[var(--text-primary)]"`
- Dark/light mode toggled via `ThemeContext` — never hardcode color values

### Component Conventions
- Feature pages live in `features/<domain>/pages/`
- Reusable UI components go in `shared/components/`
- Context providers go in `features/<domain>/context/` or `shared/context/`
- Custom hooks go in `hooks/` (global) or co-located in feature folder
- Export components as named exports from feature files; default export only for page components

### Routing
- All routes defined centrally in `App.tsx`
- Public routes: `/login`, `/bajada-publica`, `/unauthorized`
- Protected routes wrapped in `<ProtectedRoute>` (no roles = any authenticated user)
- Role-restricted routes use `<ProtectedRoute allowedRoles={[...]}>` as a wrapper `<Route>`
- Fallback `<Route path="*">` redirects to `/`

---

## Testing Conventions

### Backend (Jest)
- Unit test files: `<name>.spec.ts` co-located with source
- E2E tests: `test/app.e2e-spec.ts` with separate `jest-e2e.json` config
- Use `@nestjs/testing` `Test.createTestingModule()` for unit tests

### Frontend (Playwright)
- E2E tests in `tests/e2e/*.spec.ts`
- Config: `playwright.config.ts` — Chromium only, `workers: 1`, `retries: 1`, `timeout: 30000ms`
- Base URL: `http://localhost:5173` (Vite dev server must be running)
- Screenshots on failure, trace on first retry

---

## Naming Conventions
| Item | Convention | Example |
|------|-----------|---------|
| Backend files | kebab-case | `clientes.service.ts` |
| NestJS classes | PascalCase | `ClientesService` |
| Frontend components | PascalCase | `ClientesList.tsx` |
| Frontend hooks | camelCase with `use` prefix | `useGlobalSearch.ts` |
| DB table names | snake_case plural | `users`, `embarcaciones` |
| API endpoints | kebab-case plural | `/clientes`, `/embarcaciones` |
| Enum values | SCREAMING_SNAKE_CASE | `Role.SUPERADMIN` |
| Spanish domain terms | Keep in Spanish | `embarcaciones`, `cajas`, `cargos` |

## Key Architectural Rules
1. Never bypass `AuthTokenGuard` except with explicit `@Public()` decorator
2. Always use `ConfigService` for env vars — never `process.env` directly in NestJS services
3. TypeORM `synchronize: true` is development-only — never enable in production
4. The `Role` enum is defined in both `backend/src/users/user.entity.ts` and `frontend/src/types/index.ts` — keep them in sync
5. CORS is configured with `credentials: true` — frontend requests must include credentials
6. All financial and admin routes require at minimum `Role.ADMIN`; user management requires `Role.SUPERADMIN`
