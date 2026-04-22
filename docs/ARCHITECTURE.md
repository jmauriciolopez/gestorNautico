# Arquitectura del Sistema - Gestor Náutico

## Stack Tecnológico
- **Backend**: NestJS (Node.js) con TypeORM.
- **Base de Datos**: PostgreSQL (Soporte para esquemas multitenant).
- **Frontend**: React con Vite y TailwindCSS.
- **Gráficos**: Recharts para visualización de datos.
- **Notificaciones**: Sistema basado en plantillas Handlebars y SMTP (Resend).

## Estructura de Módulos
El sistema está dividido en módulos cohesivos siguiendo el patrón de NestJS:

### Núcleo Operativo
- **Clientes**: Gestión de socios y cuentas corrientes.
- **Embarcaciones**: Registro de barcos, tarifas y asociaciones con clientes.
- **Infraestructura (Zonas/Racks/Espacios)**: Gestión física de la guardería.
- **Operaciones**: Registro de movimientos (subidas/bajadas) y órdenes de servicio.

### Núcleo Financiero
- **Cargos**: Generación de deudas manuales y automáticas.
- **Pagos**: Liquidación de cargos y gestión de cajas diarias.
- **Facturas**: Generación de comprobantes y exportación a PDF.
- **Reportes**: Análisis de ocupación, morosidad e ingresos.

### Servicios Transversales
- **Autenticación**: JWT con seguridad basada en roles (Superadmin, Admin, Supervisor).
- **Configuración**: Parámetros globales del sistema (precios, datos de contacto).
- **Buscador**: Indexación y búsqueda global en tiempo real.
