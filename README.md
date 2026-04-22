# Gestor Náutico - SaaS Multi-Tenant

Sistema integral de gestión para guarderías náuticas y clubes, diseñado para escalar como una plataforma SaaS híbrida.

## 🚀 Inicio Rápido

### Requisitos
- Node.js 18+
- PostgreSQL
- NPM o PNPM

### Instalación
1. Clonar el repositorio.
2. Configurar variables de entorno en `./backend/.env` y `./frontend/.env`.
3. Instalar dependencias en ambas carpetas: `npm install`.
4. Iniciar desarrollo:
   - Backend: `npm run start:dev`
   - Frontend: `npm run dev`

## 📂 Documentación Centralizada

Toda la documentación técnica y operativa se encuentra en la carpeta [`docs/`](./docs/):

- **[Arquitectura](./docs/ARCHITECTURE.md)**: Stack tecnológico y estructura de módulos.
- **[API Reference](./docs/API.md)**: Guía de endpoints y autenticación.
- **[Operaciones](./docs/OPERATIONS.md)**: Guía de flujos operativos (subidas, bajadas, facturación).
- **[Notificaciones](./docs/NOTIFICACIONES.md)**: Lógica de envío de correos y plantillas.
- **[Hoja de Ruta SaaS](./docs/plans/PLAN_MULTITENANT.md)**: Plan para la transición a Multi-Tenant.

## 📋 Estado del Proyecto
Consulta el [**BACKLOG.md**](./BACKLOG.md) para ver las tareas pendientes y hitos recientemente completados.

## 🛠️ Tecnologías
- **Frontend**: React, Vite, Recharts, Lucide Icons, Framer Motion.
- **Backend**: NestJS, TypeORM, Class-validator.
- **Infraestructura**: PostgreSQL, Docker (próximamente), Resend (SMTP).

---
Desarrollado para la optimización de la gestión náutica moderna.
