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
- [**Operaciones](./docs/OPERATIONS.md)**: Guía de flujos operativos (subidas, bajadas, facturación).
- [**Notificaciones](./docs/NOTIFICACIONES.md)**: Lógica de envío de correos y plantillas.
- [**Auditoría HBS](./docs/audit/HBS_TEMPLATES_AUDIT.md)**: Relevamiento técnico de plantillas de email.
- [**Hoja de Ruta SaaS](./docs/plans/PLAN_MULTITENANT.md)**: Plan para la transición a Multi-Tenant.

## 📋 Estado del Proyecto
Consulta el [**BACKLOG.md**](./BACKLOG.md) para ver las tareas pendientes y hitos recientemente completados.

## 🚀 Despliegue (Deployment)

El proyecto utiliza un modelo de despliegue híbrido: **Frontend en AWS** (para máxima velocidad mediante CDN) y **Backend en Render**.

### ⚙️ Backend (Render)
- **URL**: `https://gestornautico-backend.onrender.com`
- **Base de Datos**: Neon (PostgreSQL).
- **CI/CD**: Despliegue automático desde la carpeta `backend/` al hacer push a `main`.

#### Comandos de Base de Datos (Backend):
- **Resetear DB**: `npm run db:reset` (Limpia todas las tablas).
- **Cargar Datos Demo**: `npm run seed:demo` (Crea usuarios, embarcaciones y datos iniciales).

### 🏗️ Infraestructura Frontend (AWS)
Ubicación: `frontend/terraform/`

La infraestructura se gestiona mediante **Terraform** e incluye:
- **S3 Bucket**: Hosting de archivos estáticos (dist/).
- **CloudFront (CDN)**: Distribución global con soporte para SPA (redirección de errores 403/404 a index.html).
- **ACM (Certificate Manager)**: Certificado SSL gestionado automáticamente en `us-east-1`.

#### Pasos para actualizar la infraestructura:
1. Navegar a `frontend/terraform/`.
2. Ejecutar `terraform plan` para previsualizar cambios.
3. Ejecutar `terraform apply` para aplicar.

### 🤖 CI/CD con GitHub Actions
El despliegue es automático al hacer push a `main`.

#### Secretos requeridos en GitHub:
Configurar en `Settings > Secrets and variables > Actions`:
- `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY`: Credenciales de despliegue.
- `CLOUDFRONT_DISTRIBUTION_ID`: ID de la distribución (`E1ZHE8PJB3TNML`).
- `VITE_API_URL`: `https://gestornautico-backend.onrender.com`
- `VITE_API_PREFIX`: `/api` (o el que uses)

### 🌐 Configuración DNS (Externo)
Para el dominio `guarderia.criterioingenieria.online`, se requieren dos registros **CNAME**:
1. **Validación SSL**: El registro `_dcd569...` (proporcionado por ACM).
2. **Aplicación**: `guarderia` -> `d3ls217b0pxzhi.cloudfront.net` (**Nube Gris / DNS Only** en Cloudflare).

## 🛠️ Tecnologías
- **Frontend**: React, Vite, Recharts, Lucide Icons, Framer Motion.
- **Backend**: NestJS, TypeORM, Class-validator.
- **Infraestructura**: PostgreSQL, Resend (SMTP), AWS (S3 + CloudFront via Terraform), Render (Backend CI/CD).

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
