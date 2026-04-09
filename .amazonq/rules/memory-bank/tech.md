# Technology Stack — Gestor Náutico

## Languages
- TypeScript 5.7 — used in both backend and frontend
- JavaScript (ES modules) — config files (vite, postcss, tailwind, eslint)

## Backend

### Runtime & Framework
- Node.js (LTS)
- NestJS 11 — modular MVC framework
- TypeORM 0.3 — ORM with PostgreSQL driver (`pg`)

### Key Libraries
| Library | Version | Purpose |
|---|---|---|
| @nestjs/jwt | ^11 | JWT token generation/validation |
| @nestjs/config | ^4 | Environment variable management |
| @nestjs/swagger | ^11 | OpenAPI/Swagger docs |
| @nestjs/schedule | ^6 | Cron jobs (automatic billing) |
| @nestjs-modules/mailer | ^2 | Email via Nodemailer + Handlebars |
| bcrypt | ^6 | Password hashing |
| class-validator | ^0.14 | DTO validation |
| class-transformer | ^0.5 | DTO transformation |
| cookie-parser | ^1.4 | HttpOnly cookie parsing |
| pdfkit | ^0.18 | PDF generation |

### Database
- PostgreSQL (any version compatible with pg ^8)
- TypeORM `synchronize: true` in development (auto-migrates schema)
- SSL support configurable via `DATABASE_SSL` env var

### Backend Dev Commands
```bash
cd backend
npm run start:dev      # Watch mode development server (port 3000 by default)
npm run build          # Compile TypeScript to dist/
npm run start:prod     # Run compiled production build
npm run test           # Jest unit tests
npm run test:e2e       # Jest e2e tests
npm run lint           # ESLint with auto-fix
npm run format         # Prettier format
```

### Backend Environment Variables (`.env`)
```
DATABASE_HOST=
DATABASE_PORT=
DATABASE_USERNAME=
DATABASE_PASSWORD=
DATABASE_NAME=
DATABASE_SSL=false
JWT_SECRET=
NODE_ENV=development
PORT=3000
MAIL_HOST=
MAIL_PORT=
MAIL_SECURE=
MAIL_USER=
MAIL_PASS=
MAIL_FROM=
```

## Frontend

### Runtime & Build
- Node.js (LTS)
- Vite 6 — dev server and bundler
- React 19 + React DOM 19

### Key Libraries
| Library | Version | Purpose |
|---|---|---|
| react-router-dom | ^7 | Client-side routing |
| @tanstack/react-query | ^5 | Server state management |
| axios | ^1.14 | HTTP client (used alongside fetchClient) |
| tailwindcss | ^3.4 | Utility-first CSS |
| framer-motion | ^12 | Animations |
| lucide-react | ^1.7 | Icon library |
| recharts | ^3.8 | Charts/data visualization |
| react-hot-toast | ^2.6 | Toast notifications |
| js-cookie | ^3 | Cookie access |

### Testing
- Vitest 4 — unit/component tests
- Playwright 1.58 — E2E tests (`tests/e2e/`)
- `@vitest/browser` — browser-mode component tests

### Frontend Dev Commands
```bash
cd frontend
npm run dev            # Vite dev server (default port 5173)
npm run build          # Production build to dist/
npm run preview        # Preview production build
npm run lint           # ESLint
npm run test:browser   # Vitest browser tests (Chromium)
npm run test:ui        # Vitest UI
npx playwright test    # Run Playwright E2E tests
```

### Frontend Environment Variables (`.env`)
```
VITE_API_URL=http://localhost:3001
```

## Code Quality Tools

### Both Projects
- ESLint 9 (flat config) with `typescript-eslint`
- Prettier (backend only, via `eslint-plugin-prettier`)

### Backend ESLint Config
- `eslint.config.mjs` — flat config format
- `eslint-config-prettier` to disable formatting rules

### Frontend ESLint Config
- `eslint.config.js` — flat config format
- Plugins: `eslint-plugin-react`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`

## CSS / Styling
- Tailwind CSS 3.4 with PostCSS + Autoprefixer
- CSS custom properties for theming: `--bg-primary`, `--bg-secondary`, `--bg-surface`, `--border-primary`, `--border-secondary`, `--text-primary`, `--text-secondary`
- Dark/light mode toggled via ThemeContext (class on root element)

## Deployment Notes
- Backend listens on `0.0.0.0:${PORT}` for container compatibility
- CORS configured with `credentials: true` and `origin: true` (reflects request origin)
- Auth token stored in HttpOnly cookie (`token`); `secure: true` and `sameSite: 'none'` in production
- `app_build/` and `production_artifacts/` directories exist for build outputs
