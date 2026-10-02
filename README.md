# LaPrizza — LEI-ISEP 5th Semester Integrative Project (2026/27)

> Integrative Project for LAPR5, ARQSI, SGRAI, IART, and ASIST at Instituto Superior de Engenharia do Porto (ISEP).

---

## 📌 Project Overview
**LaPrizza** is an integrated information system supporting the management and operational workflows of a modern pizza restaurant.

This repository accommodates all project modules across the semester:
* **`backend/`**: Node.js & TypeScript REST API following Clean Architecture & Domain-Driven Design (DDD).
* **`frontend/`**: React + TypeScript single-page application built with Vite and Vitest.
* **`docs/`**: Architectural documentation, Domain Models, and System Specifications.
* **`_bmad/`**: AI Agent framework and engineering methodologies.

---

## 🏛️ Architecture & Domain Documentation
* **[ARC01 — Core Domain Analysis and Modelling](docs/ARC01-Domain-Model.md)**: Conceptual DDD domain model, entity relationships, business invariants, and cardinalities.
* **[ARC02 — System Architecture](docs/ARC02-System-Architecture.md)**: 4-layer Clean Architecture (Presentation, Application, Domain, Infrastructure) and inter-module integrations.

---

## 🚀 Getting Started (Back-End)

### Prerequisites
* **Node.js**: v20+ (tested on v26)
* **npm**: v10+

### Setup & Run
```bash
# 1. Navigate to the backend directory
cd backend

# 2. Install dependencies
npm install

# 3. Initialize & push database schema (SQLite for local dev)
npx prisma db push

# 4. Seed initial Sprint 1 data (categories, sizes, component types, sample pizzas & stock)
npm run prisma:seed

# 5. Start development server
npm run dev
```

The server will be available at:
* **REST API**: `http://localhost:3000`
* **Swagger / OpenAPI Documentation**: `http://localhost:3000/api/docs`

---

## 🌐 Getting Started (Front-End)

### Setup & Run
```bash
# 1. Navigate to the frontend directory
cd frontend

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```

The frontend will be available at `http://localhost:5173`.

---

## 🧪 Automated Testing (ARC05)
Run the automated test suite covering domain business rules and REST API integration:

```bash
cd backend
npm test
```

---

## 📦 Sprint 1 Scope & Status

| Area | ID | User Story | Status |
| :--- | :--- | :--- | :--- |
| **ENG** | `ENG01` | Project Repository & Development Environment | ✅ Configured |
| **ENG** | `ENG02` | Sprint Planning & Project Monitoring | ✅ Configured |
| **ENG** | `ENG03` | Self and Peer Evaluation | 📝 Guideline ready |
| **ARC** | `ARC01` | Core Domain Analysis and Modelling | ✅ Documented in `docs/` |
| **ARC** | `ARC02` | System Architecture | ✅ Documented in `docs/` |
| **ARC** | `ARC03` | REST API Design & Contracts | ✅ OpenAPI / Swagger |
| **ARC** | `ARC04` | Persistence & Data Integrity | ✅ Prisma ORM (SQLite / PostgreSQL) |
| **ARC** | `ARC05` | Automated Testing | ✅ Jest & Supertest (18/18 passing) |
| **BCK** | `BCK01` | User and Authentication Management | ✅ JWT + Argon2/Bcrypt |
| **BCK** | `BCK02` | Customer Management & Dietary Restrictions | ✅ Implemented |
| **BCK** | `BCK03` | Product Category Management | ✅ Implemented |
| **BCK04** | Allergen Management | ✅ Implemented |
| **BCK** | `BCK05` | Product Management (Sellable, Stock, Pizza Components) | ✅ Implemented |
| **BCK** | `BCK06` | Pizza Size Management | ✅ Implemented |
| **BCK** | `BCK07` | Pizza Component Type Management (Cardinalities & Order) | ✅ Implemented |
| **BCK** | `BCK08` | Pizza Component Configuration (Size-dependent price & stock) | ✅ Implemented |
| **BCK** | `BCK09` | Stock Information Management (Abstract Stock Units) | ✅ Implemented |
| **BCK** | `BCK10` | Predefined Pizza Management (Composition & Availability) | ✅ Implemented |
| **BCK** | `BCK11` | Product Catalogue & Product Information | ✅ Implemented |
