# System Blueprint: Gestor Náutico SaaS

## 🏗️ Technical Architecture
- **Layer 1 (Directiva):** Antigravity Orchestrator + `.antigravity/` context.
- **Layer 2 (Logic):** NestJS (Modular Architecture) + PostgreSQL.
- **Layer 3 (UI):** React (Sleek/Vibrant Aesthetics).

## 🚀 Success Criteria
- [ ] Backend: API modular con soporte para Clientes, Embarcaciones y Caja.
- [ ] Frontend: Dashboard interactivo con visualización de espacios/racks.
- [ ] Operación: Flujo completo desde Pedido hasta Cierre de Caja.
- [ ] Seguridad: Autenticación robusta (Cookies + Headers).

## 🛠️ Module Breakdown
1. **Auth Module**: JWT, `auth/me`, Session management.
2. **Entities Module**: Clientes, Embarcaciones.
3. **Logistics Module**: Zonas, Racks, Espacios (Jerarquía física).
4. **Operations Module**: Pedidos, Movimientos (Lanzamientos/Guardados).
5. **Billing Module**: Cargos, Pagos, Caja.

## 🤝 Resource Strategy
- **Base Code**: Reutilización de bloques de proyectos previos (confirmado por el usuario).
- **Refinement**: Antigravity agents (Dev + QA) para pulir y adaptar el código pegado.
