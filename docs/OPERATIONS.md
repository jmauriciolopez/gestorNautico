# Guía de Operaciones - Gestor Náutico

Esta guía describe los flujos de trabajo principales para la gestión diaria de la guardería.

## 🚢 Gestión de Embarcaciones y Movimientos

### 🌊 Flujo de Bajada Simplificado (4 Pasos)
Este flujo gestiona la salida de una embarcación desde su rack hacia el agua y su posterior retorno.

1.  **Solicitud (Pendiente)**:
    - **Operador**: Crea una "Nueva Solicitud" desde el monitor interno.
    - **Cliente**: Solicita vía Portal Web ingresando DNI y Matrícula.
    - El sistema valida deudas y disponibilidad horaria.
2.  **Gestión Inicial (Cancelación)**:
    - El operador puede **Cancelar** la solicitud si hay impedimentos técnicos o administrativos. Se notifica al cliente por email.
3.  **Ejecución: Marca Bajada (En Agua)**:
    - Al iniciar la maniobra y poner el barco en el agua, el operador selecciona **Bajar a Agua**.
    - **Efectos Automáticos**: 
        - Registro de movimiento (Tipo: Salida).
        - Embarcación cambia a estado `EN_AGUA`.
        - El espacio en el rack se marca como **Libre** (disponible temporalmente).
        - Se envía email automático al cliente.
4.  **Cierre: Vuelta a la Cuna (Finalizada)**:
    - Cuando el cliente regresa, el operador selecciona **Vuelta a Cuna**.
    - **Efectos Automáticos**: 
        - Registro de movimiento (Tipo: Entrada).
        - Embarcación vuelve a estado `EN_CUNA`.
        - El espacio vuelve a marcarse como **Ocupado**.
        - La solicitud desaparece del monitor activo tras 24hs.


### 🏗️ Flujo de Subida (Retorno a Cuna)
Este flujo registra el re-ingreso de la embarcación a su lugar de guarda.

1.  **Localización**: El marinero busca la embarcación en el **Buscador Global** por nombre o matrícula.
2.  **Registro Directo**:
    - Selecciona **Registrar Movimiento** -> Tipo: **Entrada**.
    - El sistema sugiere automáticamente su cuna habitual.
3.  **Confirmación**:
    - Al guardar, la embarcación vuelve a estado `EN_CUNA`.
    - El espacio se marca como **Ocupado** en el dashboard.
    - **Auditoría de Horario**: Si la subida ocurre después de la hora configurada (ej: 18:00hs), el sistema lo marcará automáticamente como "Fuera de Hora" para su posterior revisión en auditoría.

### Asignación de Ubicación
- Las embarcaciones deben estar asignadas a un **Espacio** (Cuna) dentro de un **Rack** y una **Zona**.
- Si una embarcación se retira definitivamente, el espacio debe marcarse como **Disponible**.

## 💰 Facturación y Cobros

### Ciclo Mensual de Facturación
- El sistema genera automáticamente los cargos de "Guardería Mensual" el día 1 de cada mes (Configurable).
- Los cargos se agrupan en una **Factura** que puede ser enviada por email.
- **Mora Automática**: Diariamente a las 9:00 AM, el sistema audita facturas vencidas. Si superan los días de gracia, aplica automáticamente un recargo fijo y un interés mensual proporcional, actualizando el total de la deuda.

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
