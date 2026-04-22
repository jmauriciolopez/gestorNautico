# Guía de Operaciones - Gestor Náutico

Esta guía describe los flujos de trabajo principales para la gestión diaria de la guardería.

## 🚢 Gestión de Embarcaciones y Movimientos

### Registro de Movimiento (Bajar/Subir Barco)
1. El marinero o administrativo busca la embarcación en el **Buscador Global**.
2. Selecciona **Registrar Movimiento**.
3. El sistema valida si la embarcación tiene deudas pendientes (alerta visual).
4. Se confirma la acción y se registra el log de auditoría.

### Asignación de Ubicación
- Las embarcaciones deben estar asignadas a un **Espacio** (Cuna) dentro de un **Rack** y una **Zona**.
- Si una embarcación se retira definitivamente, el espacio debe marcarse como **Disponible**.

## 💰 Facturación y Cobros

### Ciclo Mensual de Facturación
- El sistema genera automáticamente los cargos de "Guardería Mensual" el día 1 de cada mes (Configurable).
- Los cargos se agrupan en una **Factura** que puede ser enviada por email.

### Registro de Pagos
- Los pagos se pueden registrar desde la **Cuenta Corriente** del cliente.
- Cada pago debe estar asociado a una **Caja Abierta**. No se pueden registrar pagos si no hay una caja operativa.
- Al liquidar un cargo, la factura asociada cambia su estado a **PAGADA**.

### Exportación PDF
- Las facturas y recibos de pago pueden descargarse en formato PDF profesional para entregar al cliente.

## 📊 Monitoreo y Reportes
- **Dashboard de Ocupación**: Revisar diariamente para optimizar el uso de los racks.
- **Reporte de Ingresos**: Comparativa mensual de recaudación vs. proyectado.
- **Auditoría de Logs**: Revisar el historial en `docs/audit/` para trazabilidad de cambios críticos.
