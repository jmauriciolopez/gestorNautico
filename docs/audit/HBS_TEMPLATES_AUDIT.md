# Auditoría de Templates Handlebars (.hbs) — Gestor Náutico

Este documento detalla el uso y estado de los templates de correo electrónico (Handlebars) dentro del sistema. Todos los archivos se encuentran en `backend/src/notificaciones/templates/`.

## 1. Mapeo de Templates Activos

| Template | Servicio / Controlador | Trigger (Evento) | Propósito |
| :--- | :--- | :--- | :--- |
| **`aviso-deuda`** | `AutomaticBillingService` | Cron diario (9 AM) | Notificar al cliente sobre facturas vencidas. |
| | `NotificacionesController` | Endpoint `/test-email` | Prueba de diagnóstico SMTP. |
| **`factura-v1`** | `FacturasService` | Acción manual/auto | Envío de factura emitida con el PDF adjunto. |
| **`confirmacion-bajada`** | `OperacionesService` | Cron (1h post-solicitud) | Confirmar al cliente que su pedido de bajada fue recibido. |
| **`bajada-completada`** | `OperacionesService` | Cambio de estado | Notificar que el barco ya está en el agua. |
| **`subida-completada`** | `OperacionesService` | Cambio de estado | Notificar que el barco ya está guardado en su cuna. |
| **`bajada-cancelada`** | `OperacionesService` | Cambio de estado | Notificar la cancelación de una solicitud de bajada. |

---

## 2. Detalle Técnico de Contexto (Variables)

A continuación se listan las variables que cada template espera recibir en su objeto de contexto:

### `aviso-deuda.hbs`
*   `clienteNombre`: Nombre completo del cliente.
*   `numeroFactura`: Código/Número de la factura.
*   `fechaEmision`: Fecha legible.
*   `montoTotal`: Total adeudado formateado.
*   `paymentLink`: URL para pago online.
*   `anio`: Año actual para el footer.

### `factura-v1.hbs`
*   `cliente`: Nombre del cliente.
*   `numero`: Número de factura.
*   `fecha`: Fecha de emisión.
*   `total`: Monto total.

### `confirmacion-bajada.hbs` / `bajada-completada.hbs` / `bajada-cancelada.hbs`
*   `clienteNombre`: Nombre del cliente.
*   `barcoNombre`: Nombre de la embarcación.
*   `fechaHora`: Timestamp de la operación.
*   `anio`: Año actual.
*   `motivo`: (Solo en `bajada-cancelada`) Razón de la cancelación.

### `subida-completada.hbs`
*   `clienteNombre`: Nombre del cliente.
*   `barcoNombre`: Nombre de la embarcación.
*   `fechaHora`: Timestamp de la operación.
*   `anio`: Año actual.

---

## 3. Templates Huérfanos o Sin Uso Detectado

Los siguientes archivos existen en el directorio de templates pero no tienen referencias directas en el código actual del backend:

1.  **`bajada-confirmada.hbs`**: Parece ser una versión redundante de `confirmacion-bajada.hbs`.
2.  **`servicio-completado.hbs`**: Aunque la documentación `NOTIFICACIONES.md` lo menciona, el servicio de servicios/taller actual no dispara este email de forma literal. Está disponible para su implementación futura.

---

## 4. Observaciones de Auditoría

*   **Codificación**: Algunos archivos presentan caracteres mal interpretados (ej: `Nǭutico`, `Nǧmero`). Se recomienda normalizar a UTF-8 o usar entidades HTML.
*   **Consistencia**: Se observa una mezcla entre `clienteNombre` y `cliente` en diferentes templates. Sería ideal estandarizar el nombre de las variables de contexto.
*   **Estilos**: La mayoría de los templates usan estilos modernos (Tailwind-like/Inline CSS) con bordes redondeados y tipografía Inter/Arial.
