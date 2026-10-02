# 04 — Architectural Principles and Guidelines

## 1. Overview
This document specifies the core engineering principles, design rules, and development guidelines governing the implementation of the **LaPrizza** Information System. These guidelines ensure architectural consistency, maintainability, testability, and high code quality across all team members and project sprints.

---

## 2. Core Architectural Principles

### 2.1 Clean / Onion Architecture & Inward Dependencies
* The system is structured into four concentric layers: **Presentation**, **Application**, **Domain**, and **Infrastructure**.
* **The Dependency Rule**: Source code dependencies must only point inward, toward the core Domain. 
* The **Domain Layer** has zero knowledge of databases (Prisma), web frameworks (Express), or third-party presentation tools. It defines repository interfaces (`IRepository`), which are implemented by the **Infrastructure Layer** using the **Dependency Inversion Principle (DIP)**.

### 2.2 Domain-Driven Design (DDD)
* **Ubiquitous Language**: Terminology used in business requirements (e.g., `PizzaComponentType`, `PredefinedPizza`, `AbstractStockUnit`, `AssemblyOrder`) is reflected verbatim in class names, database tables, and API endpoints.
* **Rich Domain Models vs Anemic Models**: Business rules and invariants are encapsulated within Domain Entities and Value Objects, not scattered across controllers or helper scripts.
* **Aggregate Roots**: Entities such as `Product`, `PizzaConfiguration`, and `Order` act as aggregate roots, safeguarding their internal state consistency.

### 2.3 SOLID Principles
1. **Single Responsibility Principle (SRP)**: Each class or module has one and only one reason to change. Controllers parse HTTP; Services orchestrate use cases; Entities enforce business rules; Repositories handle queries.
2. **Open/Closed Principle (OCP)**: New pizza component types or product categories can be configured via database records without changing application code.
3. **Liskov Substitution Principle (LSP)**: Repository implementations (e.g., in-memory mock vs Prisma SQLite vs Prisma PostgreSQL) are interchangeable without breaking domain services.
4. **Interface Segregation Principle (ISP)**: Clients depend only on specific repository and service interfaces they actually consume.
5. **Dependency Inversion Principle (DIP)**: High-level modules (Application Services) do not depend on low-level modules (Prisma Client); both depend on abstractions (Domain Interfaces).

### 2.4 Fail-Fast & Boundary Validation
* Requests entering the system are validated immediately at the boundary (**Presentation Layer**) using declarative **Zod schemas**. Malformed payloads are rejected before allocating domain resources.
* Invariants inside domain entities throw typed domain errors (e.g., `InvalidCardinalityException`, `InsufficientStockException`), which are intercepted by centralized error handling middleware.

---

## 3. Development and Design Guidelines

### 3.1 REST API Design Standards
* **Resource-Oriented URIs**: Use plural nouns and kebab-case for resource paths:
  * `/api/products`
  * `/api/pizza-sizes`
  * `/api/pizza-component-types`
  * `/api/component-size-configurations`
  * `/api/stock`
* **HTTP Verbs**:
  * `GET`: Safe and idempotent data retrieval.
  * `POST`: Creation of new subordinate resources.
  * `PUT`: Complete idempotent replacement of an existing resource.
  * `PATCH`: Partial modification of resource state (e.g., updating stock units).
  * `DELETE`: Deletion or deactivation of a resource.
* **HTTP Status Codes**:
  * `200 OK`: Successful retrieval or update.
  * `201 Created`: Successful creation with `Location` header or returned resource.
  * `400 Bad Request`: Input syntax or validation schema failure.
  * `401 Unauthorized`: Missing or invalid JWT bearer token.
  * `403 Forbidden`: Authenticated user lacks required role (`MANAGER`, `STAFF`).
  * `404 Not Found`: Requested resource does not exist.
  * `409 Conflict`: Business invariant or uniqueness conflict (e.g., duplicate product name or non-empty category deletion).
  * `500 Internal Server Error`: Unhandled server exceptions (with sanitized message to client).
* **Standardized Error Envelope**:
  ```json
  {
    "error": {
      "code": "INSUFFICIENT_STOCK",
      "message": "Stock reduction exceeds available abstract units.",
      "timestamp": "2026-10-02T12:00:00.000Z"
    }
  }
  ```

### 3.2 Authentication & Security Guidelines
* **Stateless JWT Tokens**: Authentication uses short-lived JSON Web Tokens signed with secret keys stored in `.env`.
* **Password Hashing**: User credentials must be hashed with strong cryptographic salts using **bcrypt** (minimum 10 rounds) or **Argon2id**. Plaintext passwords must never be logged or persisted.
* **Role-Based Access Control (RBAC)**: Protected endpoints enforce role guards:
  * `Customer`: View catalog, manage own profile and orders.
  * `Staff`: Update stock, update kitchen preparation status.
  * `Manager`: Full administrative access (create products, sizes, components, pricing).

### 3.3 Persistence & Data Integrity Guidelines
* **Abstract Stock Units**: Inventory is tracked strictly in non-negative integer units (`units >= 0`). Fractional units are forbidden to avoid floating-point drift.
* **Atomic Transactions**: Stock decrements and order placements must execute inside database transactions to prevent race conditions during concurrent orders.
* **Soft Deletion & Referential Integrity**: Products, categories, and allergens referenced by historical orders cannot be physically deleted. Instead, an `isActive: boolean` flag is toggled to preserve historical integrity.
* **Clean Mapping**: Database models generated by Prisma are never exposed directly to the Presentation layer; they are mapped to Domain Entities, which are subsequently transformed to Application DTOs.

### 3.4 Automated Testing Strategy
* **Testing Pyramid**:
  * **Unit Tests (Jest)**: Fast, in-memory validation of domain invariants (e.g., verifying pizza size availability rules, component cardinalities, allergen calculations). Target: 100% domain coverage.
  * **Integration Tests (Supertest + Jest)**: End-to-end HTTP request testing validating controller routing, middleware, and database operations.
* **Reproducibility**: The entire test suite must execute cleanly with a single command:
  ```bash
  npm test
  ```
