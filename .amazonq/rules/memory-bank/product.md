# Product Overview — Gestor Náutico

## Purpose
Gestor Náutico is a SaaS platform for managing nautical marinas (guarderías náuticas). It digitizes and streamlines the full operational lifecycle of a marina: from client and vessel registration to berth management, billing, and financial reporting.

## Value Proposition
- Replaces manual/paper-based marina operations with a unified digital system
- Provides role-based access so admins, operators, and staff each see only what they need
- Automates recurring billing and notifications, reducing administrative overhead
- Offers a public-facing vessel retrieval request form (no login required)

## Key Features

### Client & Vessel Management
- Full CRUD for clients (clientes) and their vessels (embarcaciones)
- Client search and filtering

### Infrastructure Management
- Hierarchical storage structure: Zonas → Racks → Espacios (zones, racks, berths)
- Ubicaciones (location assignments) linking vessels to specific berths

### Operations
- Movimientos: vessel entry/exit tracking
- Pedidos: service requests
- Operaciones: launch/retrieval operations with a public request form (SolicitudBajadaPublica)

### Financial Management
- Cajas: cash register / till management
- Cargos: charge items
- Pagos: payment recording
- Facturas: invoice generation with PDF export
- Automatic billing via scheduled service

### Services & Catalog
- Catalogo: service catalog
- Registros: service log entries
- Dashboard with financial and operational KPIs

### Notifications
- Email notifications via Nodemailer + Handlebars templates
- In-app notification entity

### Configuration
- Per-installation configuration (configuracion module)
- User management with roles: SUPERADMIN, ADMIN, OPERADOR

## Target Users
- Marina owners and administrators (SUPERADMIN, ADMIN roles)
- Marina operational staff (OPERADOR role)
- Vessel owners (public form only, no account required)

## Use Cases
1. Daily check-in/check-out of vessels
2. Monthly automatic invoice generation for storage fees
3. Tracking outstanding payments and generating financial reports
4. Managing physical berth availability and assignments
5. Requesting vessel retrieval via public URL (no login)
