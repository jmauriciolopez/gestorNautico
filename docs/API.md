# Guía de la API

## Autenticación
Todas las peticiones (excepto el portal público de facturas) requieren un header de autorización:
`Authorization: Bearer <token>`

El token se puede obtener en el login de `/auth/login`.

## Endpoints Principales

### Clientes y Embarcaciones
- `GET /clientes`: Lista de socios.
- `POST /clientes`: Crear nuevo socio.
- `GET /embarcaciones`: Lista de barcos en cuna.

### Finanzas
- `GET /cargos/pendientes`: Cargos sin pagar.
- `POST /pagos`: Registrar un cobro.
- `GET /facturas/:id/pdf`: Descargar comprobante.

### Reportes (Analíticos)
- `GET /reportes/ocupacion`: Estadísticas de cunas.
- `GET /reportes/ingresos`: Flujo de caja mensual.
- `GET /reportes/morosos`: Lista de deudores críticos.

## Documentación Técnica
Se recomienda el uso de **Swagger/OpenAPI** (pendiente de implementación completa) para explorar todos los esquemas de datos.
