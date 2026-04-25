# Mapa de Notificaciones — Gestor Náutico

## Canales disponibles

| Canal | Descripción |
|-------|-------------|
| **In-app** | Se guarda en tabla `notificaciones`, aparece en el popover del header con badge de no leídas. Polling cada 30 segundos. |
| **Email** | Enviado via SMTP (Resend) usando templates Handlebars en `backend/src/notificaciones/templates/` |

---

## Cuadro completo de eventos

### Operaciones

| Evento | Trigger | Canal | Destinatario |
|--------|---------|-------|-------------|
| Solicitud de bajada desde portal público | Cliente completa el formulario público `/bajada-publica` | In-app | OPERADOR |
| Confirmación de bajada | Cron job — 1 hora después de la solicitud | Email | Cliente (si tiene email) |
| Nueva solicitud de movimiento (pedido) | Operador/Admin crea un pedido interno | In-app | OPERADOR + ADMIN |
| Cambio de estado de pedido | Operador actualiza el estado del pedido | In-app | ADMIN |

### Servicios / Taller

| Evento | Trigger | Canal | Destinatario |
|--------|---------|-------|-------------|
| Servicio programado | Operador agenda un servicio con fecha | In-app | OPERADOR |
| Servicio completado | Operador marca el servicio como completado | In-app | ADMIN |
| Servicio completado | Operador marca el servicio como completado | Email | Cliente (si tiene email) |

### Facturación / Finanzas

| Evento | Trigger | Canal | Destinatario |
|--------|---------|-------|-------------|
| Nueva factura generada | Admin/Supervisor emite una factura | In-app | ADMIN |
| Factura liquidada | Admin marca factura como PAGADA (con método de pago) | In-app | OPERADOR |
| Factura vencida (+7 días) | Cron job automático de facturación | In-app | ADMIN |
| Factura vencida (+7 días) | Cron job automático de facturación | Email | Cliente (si tiene email) |

### Caja

| Evento | Trigger | Canal | Destinatario |
|--------|---------|-------|-------------|
| Apertura de caja | Admin/Supervisor abre una sesión de caja | In-app | ADMIN |
| Cierre de caja | Admin/Supervisor cierra la sesión de caja | In-app | ADMIN |

---

## Templates de email disponibles

| Template | Usado en |
|----------|---------|
| `confirmacion-bajada` | Confirmación de solicitud de bajada al cliente |
| `servicio-completado` | Aviso al cliente cuando su embarcación sale del taller |
| `aviso-deuda` | Recordatorio de pago por factura vencida |

---

## Tipos de notificación (in-app)

| Tipo | Color / Ícono | Uso |
|------|--------------|-----|
| `INFO` | Azul / Info | Eventos informativos generales |
| `EXITO` | Verde / Check | Operaciones completadas exitosamente |
| `ALERTA` | Ámbar / Warning | Situaciones que requieren atención |
| `SISTEMA` | Gris / Shield | Eventos del sistema (apertura/cierre de caja) |

---

## Eventos pendientes de implementar

| Evento | Prioridad | Notas |
|--------|-----------|-------|
| Embarcación con deuda vencida > 30 días | Alta | Útil para cobranza proactiva |
| Cargos próximos a vencer (7 días) | Alta | Aviso preventivo al cliente |
| Movimiento de embarcación (entrada/salida) | Media | Registro de trazabilidad |
| Nuevo cliente registrado | Baja | Bienvenida al sistema |

---

## Arquitectura

```
Evento de negocio
      │
      ▼
  Service.ts  ──► notificacionesService.createForRole(Role.X, { titulo, mensaje, tipo })
                        │
                        ├──► Guarda en tabla `notificaciones` para cada usuario del rol
                        │
                        └──► (opcional) sendEmailNotification(email, subject, template, context)
                                    │
                                    └──► MailerService (SMTP Resend)
```

**Frontend polling:** `useNotificaciones` → `refetchInterval: 30000` ms
