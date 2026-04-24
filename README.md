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

## 🗄️ Gestión de Base de Datos

### Reiniciar Base de Datos (Desde Cero)
Para eliminar todas las tablas, esquemas y volver a un estado totalmente limpio:
1. Ir a la carpeta `backend/`.
2. Ejecutar:
   ```powershell
   npm run db:reset
   ```
3. Reiniciar el servidor backend (`npm run start:dev`). TypeORM recreará automáticamente las tablas al iniciar.

### Cargar Datos de Demostración (Seed Demo)
Para poblar la base de datos con un set de datos de prueba completo (clientes, embarcaciones, facturas históricas):
1. Desde la carpeta `backend/`, ejecutar:
   ```powershell
   npm run seed:demo
   ```
   *Nota: Este comando también limpia las tablas antes de cargar los nuevos datos.*

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
- **Infraestructura**: PostgreSQL, Resend (SMTP).

## 🔐 Control de Acceso (RBAC)

El sistema implementa una matriz estricta de permisos basada en roles:

| Módulo | OPERADOR | SUPERVISOR | ADMIN | SUPERADMIN |
| :--- | :---: | :---: | :---: | :---: |
| **Dashboard** | Operativo | Ambos | Ambos | Ambos |
| **Operaciones** | ✅ | ✅ | ✅ | ✅ |
| **Clientes / Emb.** | Lectura | ✅ | ✅ | ✅ |
| **Servicios** | ❌ | ✅ | ✅ | ✅ |
| **Finanzas / Fact.** | ❌ | ❌ | ✅ | ✅ |
| **Reportes** | ❌ | ❌ | ✅ | ✅ |
| **Infraestructura** | ❌ | ❌ | ✅ | ✅ |
| **Usuarios / Conf.** | ❌ | ❌ | ✅ | ✅ |
| **Sedes (SaaS)** | ❌ | ❌ | ❌ | ✅ |
| **Ayuda** | ✅ | ✅ | ✅ | ✅ |

*Nota: El acceso a la creación y edición de Clientes/Embarcaciones está restringido para el rol Operador.*

---
Desarrollado para la optimización de la gestión náutica moderna.
