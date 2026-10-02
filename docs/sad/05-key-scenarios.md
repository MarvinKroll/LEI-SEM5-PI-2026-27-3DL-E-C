# 05 — Key Architectural Scenarios

## 1. Overview
This document specifies the critical architectural and quality attribute scenarios for the **LaPrizza** Information System. Following standard Software Engineering Institute (**SEI**) and IEEE 42010 quality attribute specifications, each scenario identifies the **Source**, **Stimulus**, **Artifact**, **Environment**, **Response**, and **Response Measure**.

---

## 2. Architectural Scenarios

### Scenario 1: Dynamic Pizza Pricing and Size-Dependent Stock Consumption (Correctness & Consistency)
* **Quality Attribute**: Functional Correctness & Consistency
* **Source**: Customer or Front-End Client.
* **Stimulus**: Customer configures a custom pizza (or selects a predefined pizza) and switches size between *Small*, *Medium*, and *Large*.
* **Artifact**: `PizzaConfiguration`, `ComponentSizeConfiguration`, `ProductService`, `PizzaCatalogService`.
* **Environment**: Normal production run.
* **Response**:
  1. The system verifies that every component in the configuration has a valid `ComponentSizeConfiguration` for the target size.
  2. The system checks culinary cardinalities (`assemblyOrder`, `minQuantity`, `maxQuantity`).
  3. Total price is calculated dynamically as the sum of all component prices for that size.
  4. The required abstract stock units for each component are aggregated.
* **Response Measure**: Latency < 100 ms; 100% invariant adherence; mathematical price precision without rounding discrepancies.

---

### Scenario 2: Allergen Aggregation & Customer Dietary Protection (Safety & Reliability)
* **Quality Attribute**: Safety & Data Integrity
* **Source**: Authenticated Customer with registered `DietaryRestrictions` (e.g., Celiac / Gluten Allergy, Lactose Intolerance).
* **Stimulus**: Customer browses pizzas or customizes a pizza by adding ingredients containing allergens.
* **Artifact**: `Product`, `Allergen`, `Customer`, `CatalogController`.
* **Environment**: Catalog browsing and interactive pizza building.
* **Response**:
  1. The system computes the set union of all allergens associated with constituent ingredients:
     $$\text{Allergens}_{\text{pizza}} = \bigcup_{c \in \text{Components}} \text{Allergens}(c)$$
  2. The system correlates the computed allergens with the customer's active dietary restrictions.
  3. Explicit visual badges and warnings are generated in the response DTO.
* **Response Measure**: Zero false negatives (no allergens omitted); deterministic calculation; 100% test coverage for allergen inheritance.

---

### Scenario 3: Concurrent Stock Depletion & Non-Negative Inventory Guarantee (Concurrency & Robustness)
* **Quality Attribute**: Concurrency & Data Integrity
* **Source**: Multiple concurrent customer checkouts during peak order hours.
* **Stimulus**: Two separate orders attempt to checkout simultaneously. Product $P$ currently has only 5 abstract stock units available. Order $A$ requires 3 units, while Order $B$ requires 4 units.
* **Artifact**: `StockInformation`, `IStockRepository`, `PrismaStockRepository`, Database Transaction Manager.
* **Environment**: Peak load under high concurrent HTTP requests.
* **Response**:
  1. The database isolates both operations using atomic transactional updates.
  2. Order $A$'s transaction executes first, successfully decrementing stock from 5 to 2 units.
  3. Order $B$'s transaction attempts to decrement 4 units. The domain invariant condition ($\text{currentStock} - \text{requested} \ge 0$) fails.
  4. Order $B$'s stock decrement operation aborts cleanly and rolls back.
  5. The API returns an explicit HTTP 409 Conflict or 400 Bad Request error indicating insufficient stock.
* **Response Measure**: Stock level never drops below 0 ($\text{Stock} \ge 0$ invariant strictly maintained); zero race conditions; zero orphaned reservations.

---

### Scenario 4: 3D WebGL Configurator Data Feeding (Interoperability & Performance)
* **Quality Attribute**: Performance & Interoperability
* **Source**: 3D Visualization Module (SGRAI / Three.js canvas in browser).
* **Stimulus**: Front-end loads the "Build Your Pizza" 3D canvas and requests component metadata (layering order, diameter, available ingredients).
* **Artifact**: REST API Presentation Layer (`/api/pizza-component-types`, `/api/pizza-sizes`, `/api/products`).
* **Environment**: Client initialization across various network conditions.
* **Response**:
  1. REST API responds with structured JSON containing strictly ordered component types sorted by `assemblyOrder` (e.g., 1: Base Dough, 2: Base Sauce, 3: Cheese, 4: Toppings).
  2. Active pizza sizes (diameter in cm) and component associations are returned in a single round-trip.
* **Response Measure**: Server response time < 50 ms; payload size < 30 KB; strictly structured schema conforming to OpenAPI 3.0 specs.

---

### Scenario 5: Future AI Preparation Scheduling Handoff (Extensibility & Modifiability)
* **Quality Attribute**: Modifiability & Architectural Extensibility
* **Source**: Order Placement & Kitchen Management workflow (Sprint 2/3).
* **Stimulus**: A customer order is confirmed and moves to preparation status.
* **Artifact**: `PreparationActivity`, `KitchenResource`, Prolog Scheduling Bridge (IART).
* **Environment**: Multi-station kitchen with multiple cooks and limited oven capacity.
* **Response**:
  1. The system creates a list of `PreparationActivity` entities representing each step:
     * Assembly (dough stretching, sauce application, ingredient topping).
     * Baking (oven slot duration and temperature constraint).
     * Packaging & Dispatch.
  2. Activities are exported as structured Prolog facts for the constraint logic programming solver.
* **Response Measure**: The core domain model requires zero alterations to accommodate the Prolog scheduler bridge; loose coupling between Express and Prolog subsystems.
