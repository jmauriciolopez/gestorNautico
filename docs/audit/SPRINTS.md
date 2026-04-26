# Project Roadmap: Sprints

## 🚩 Sprint 1: Foundation (Backend Core)
- **Goal**: Base functional backend and database schema.
- **Tasks**:
  - [x] NestJS App initialization.
  - [x] Database Connection (TypeORM setup).
  - [x] **Clientes** Module (CRUD).
  - [x] Basic Authentication.

## ⛵ Sprint 2: Core Business Logic
- **Goal**: Manage the main assets of the guardería.
- **Tasks**:
  - [x] **Embarcaciones** Module.
  - [x] Relationship Cliente ↔ Embarcación.
  - [x] Physical Infrastructure: **Zonas**, **Racks**, **Espacios**.

## 🔄 Sprint 3: The Engine (Operations)
- **Goal**: Implement the daily operational flow.
- **Tasks**:
  - [x] **Pedidos** Module.
  - [x] **Movimientos** (Registro de entradas/salidas de embarcaciones).
  - [x] Integration with Spaces (Updating occupancy).

## 💰 Sprint 4: Financial & Billing
- **Goal**: Monetize the operations.
- **Tasks**:
  - [x] **Cargos** (Automatic and manual charges).
  - [x] **Pagos** (Gateway or manual entry).
  - [x] **Caja** Opening/Closing logic.

## 🖥️ Sprint 5: Frontend Implementation
- **Goal**: A premium UI for managing the system.
- **Tasks**:
  - [x] React Shell + Navigation.
  - [x] Interactive Dashboard (Map of Racks).
  - [x] Forms and Lists for all entities.

## ✨ Sprint 6: Polish & QA
- **Goal**: Zero bugs and high performance.
- **Tasks**:
  - [ ] End-to-end testing of the "Daily Flow".
  - [ ] Mobile UI optimization.
  - [x] Final Documentation update (Audit reports, Dead Code, Findings).
