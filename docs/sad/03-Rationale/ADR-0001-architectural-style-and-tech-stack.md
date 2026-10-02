# ADR-0001: Adoption of Clean Architecture and TypeScript REST API for Core Back-End

## Status
**Accepted**

## Date
2026-10-02

## Context & Problem Statement
The **LaPrizza** Information System must implement rich domain rules, including:
1. Dynamic pizza composition with strict culinary cardinalities (assembly order, min/max quantities per component type).
2. Non-linear, size-dependent pricing and stock unit consumption.
3. Multi-ingredient allergen cascading and dietary restriction verification.
4. Non-negative abstract stock units with atomic decrement operations.

In addition, the back-end serves as the foundational backbone across five academic course units, integrating with:
* A React/TypeScript Single Page Application (**LAPR5**).
* A 3D WebGL / Three.js pizza builder and kitchen viewer (**SGRAI**).
* An AI constraint logic programming scheduler in SWI-Prolog (**IART**).
* Containerized deployment and system administration (**ASIST**).

We must decide on an architectural pattern and technology stack that guarantees high domain testability, strict separation of concerns, and clear contract interfaces without premature operational complexity.

---

## Decision Drivers
* **Domain Isolation**: Domain invariants must be testable in memory without database or HTTP mocks.
* **Evolutionary Architecture**: The system must easily absorb Sprint 2 and Sprint 3 requirements without refactoring core logic.
* **Interoperability**: Clear machine-readable contracts (OpenAPI/Swagger) for consumption by Web, 3D, and AI clients.
* **Developer Ergonomics**: Type safety across all layers to prevent runtime type errors.
* **Simplicity of Execution**: Low operational overhead for local development and CI/CD pipelines.

---

## Considered Alternatives

### Alternative 1: Traditional Monolithic MVC (Coupled Active Record / Prisma in Controllers)
* **Pros**: Rapid prototyping; minimal boilerplate; fewer files.
* **Cons**: Severe violation of Dependency Inversion; business logic gets scattered across controllers and database hooks; unit testing requires running databases or extensive mock scaffolding; high risk of regression as new modules are introduced.

### Alternative 2: Microservices Architecture
* **Pros**: Autonomous deployment and scaling of individual bounded contexts (Catalog, Stock, Ordering, AI Bridge).
* **Cons**: Massive operational complexity, distributed transactions (Sagas), network latency, redundant boilerplate, and unnecessary overhead for a student engineering team in Sprint 1.

### Alternative 3: NestJS Heavyweight Framework
* **Pros**: Built-in dependency injection container; strong opinionated structure.
* **Cons**: High cognitive overhead due to complex decorator patterns and framework lock-in; slower compile cycles; obscures pure architectural understanding.

### Alternative 4: Clean / Onion Architecture in Pure TypeScript & Express (Selected)
* **Pros**:
  * Concentric layers with strict inward dependency rules (Dependencies point towards the Domain).
  * Pure TypeScript Domain Entities containing zero framework or database imports.
  * Dependency Inversion via Repository Interfaces.
  * Lightweight Express HTTP engine with Zod schema validation.
  * Effortless persistence swapping (SQLite for local dev/testing, PostgreSQL for production).
* **Cons**: Requires explicit DTOs and mapping layers between Domain and Persistence.

---

## Decision Outcome
We decided to adopt **Clean / Onion Architecture** implemented with **TypeScript**, **Node.js**, **Express**, and **Prisma ORM**.

### Architectural Layers
```
+-----------------------------------------------------------+
| Presentation Layer (Express Controllers, Middleware, Zod)  |
|   +-----------------------------------------------------+  |
|   | Application Layer (Use Cases, DTOs, Mappers)        |  |
|   |   +-----------------------------------------------+ |  |
|   |   | Domain Layer (Entities, Value Objects,        | |  |
|   |   |               Invariants, Repo Interfaces)     | |  |
|   |   +-----------------------------------------------+ |  |
|   +-----------------------------------------------------+  |
| Infrastructure Layer (Prisma Client, Repos, Auth/Bcrypt)  |
+-----------------------------------------------------------+
```

1. **Domain Layer (Core)**:
   * Contains POJO Entities (`Product`, `PizzaConfiguration`, `StockInformation`, `Allergen`, etc.) and Value Objects (`Money`, `Email`).
   * Defines repository interfaces (`IProductRepository`, `IStockRepository`).
   * Absolutely zero dependencies on Express, Prisma, or external libraries.
2. **Application Layer**:
   * Contains use cases / services (`ProductService`, `StockService`, `PizzaCatalogService`).
   * Translates incoming DTOs into domain operations and converts domain results to response DTOs.
3. **Infrastructure Layer**:
   * Implements domain repository interfaces using Prisma ORM.
   * Manages database migrations, connection pooling, and external security utilities (Bcrypt password hashing).
4. **Presentation Layer**:
   * Express routes and controllers handling HTTP semantics (request parsing, status codes 200/201/400/404).
   * Zod validation middleware parsing and sanitizing input payloads.
   * OpenAPI/Swagger UI endpoints.

---

## Consequences & Trade-offs

### Positive
* **Fast, Pure Unit Tests**: Over 18 automated unit and integration tests run in seconds without spinning up a heavy test database.
* **High Maintainability**: A database schema migration or API route change does not affect the core domain calculations.
* **Predictable Contracts**: Consumers (React frontend, 3D WebGL module) rely on deterministic JSON schemas documented in Swagger.

### Negative & Mitigations
* **Mapping Overhead**: Entities must be converted to/from Prisma models and DTOs.
  * *Mitigation*: Dedicated mapper utilities (`productMapper.ts`) keep mapping clean, declarative, and isolated.
