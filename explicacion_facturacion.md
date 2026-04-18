# Funcionamiento de la Facturación - Gestor Náutico

La facturación en el sistema está diseñada como un proceso **Híbrido**, con un fuerte componente **Automático (Batch)** y capacidades de gestión **Manual**.

## 1. Facturación Automática (Batch)

El sistema cuenta con un servicio especializado (`AutomaticBillingService`) que automatiza el ciclo de facturación mensual sin intervención humana.

### Cronograma y Frecuencia
*   **Generación de Cargos:** Se ejecuta **todos los días a las 00:00 (Medianoche)**.
*   **Auditoría de Deudas:** Se ejecuta **todos los días a las 09:00 AM**.

### Lógica de Facturación Mensual
El proceso de las 00:00 AM funciona de la siguiente manera:
1.  **Identificación de Clientes:** Filtra los clientes activos cuyo `diaFacturacion` (parámetro configurable entre 1 y 31) coincide con el día actual.
2.  **Cargos de Amarre:** Para cada cliente, recorre sus embarcaciones. Si la embarcación ocupa un espacio en un Rack, calcula la tarifa base del Rack aplicando los descuentos correspondientes (descuento por cliente y descuento específico por barco).
3.  **Cuotas Sociales:** Si el cliente tiene asignada una cuota (Individual o Familiar), genera el cargo correspondiente basado en los valores configurados en el sistema.
4.  **Consolidación de Consumos:** Busca cualquier cargo pendiente (consumos extras, servicios adicionales) que no haya sido facturado anteriormente y lo incluye en la liquidación.
5.  **Generación de Factura:** Si existen cargos, se crea una nueva `Factura` en estado **PENDIENTE**.

## 2. Auditoría y Notificaciones

El proceso de las 09:00 AM se encarga de la salud financiera:
*   **Detección de Vencimientos:** Identifica facturas pendientes con más de 7 días de antigüedad.
*   **Notificaciones Automáticas:** Envía correos electrónicos a los clientes con un recordatorio de deuda, el detalle del monto y un enlace directo para realizar el pago online.
*   **Alertas Administrativas:** Notifica a los usuarios con rol `ADMIN` sobre los incumplimientos detectados.

## 3. Facturación y Pagos Manuales

A través del **Módulo de Facturas** y **Módulo de Pagos** en el backend:
*   **Creación Manual:** Los administradores pueden generar facturas ad-hoc para conceptos no previstos en el ciclo automático.
*   **Registro de Cobros:** Cuando el cliente paga (ya sea por transferencia, efectivo o tarjeta), se registra el pago manualmente o vía webhook de pasarela, lo que cambia el estado de la factura a **PAGADA** y actualiza los movimientos de caja.

---
**Nota Técnica:** El motor de tareas programadas utiliza `@nestjs/schedule` basado en sintaxis Cron estándar.
