# Project Roadmap: Sprints

## 🚩 Sprint 1: Foundation (Backend Core)
- **Goal**: Base functional backend and database schema.
- **Tasks**:
  - [ ] NestJS App initialization.
  - [ ] Database Connection (Prisma/TypeORM setup).
  - [ ] **Clientes** Module (CRUD).
  - [ ] Basic Authentication.

## ⛵ Sprint 2: Core Business Logic
- **Goal**: Manage the main assets of the guardería.
- **Tasks**:
  - [ ] **Embarcaciones** Module.
  - [ ] Relationship Cliente ↔ Embarcación.
  - [ ] Physical Infrastructure: **Zonas**, **Racks**, **Espacios**.

## 🔄 Sprint 3: The Engine (Operations)
- **Goal**: Implement the daily operational flow.
- **Tasks**:
  - [ ] **Pedidos** Module.
  - [ ] **Movimientos** (Registro de entradas/salidas de embarcaciones).
  - [ ] Integration with Spaces (Updating occupancy).

## 💰 Sprint 4: Financial & Billing
- **Goal**: Monetize the operations.
- **Tasks**:
  - [ ] **Cargos** (Automatic and manual charges).
  - [ ] **Pagos** (Gateway or manual entry).
  - [ ] **Caja** Opening/Closing logic.

## 🖥️ Sprint 5: Frontend Implementation
- **Goal**: A premium UI for managing the system.
- **Tasks**:
  - [ ] React Shell + Navigation.
  - [ ] Interactive Dashboard (Map of Racks).
  - [ ] Forms and Lists for all entities.

## ✨ Sprint 6: Polish & QA
- **Goal**: Zero bugs and high performance.
- **Tasks**:
  - [ ] End-to-end testing of the "Daily Flow".
  - [ ] Mobile UI optimization.
  - [ ] Final Documentation update.
