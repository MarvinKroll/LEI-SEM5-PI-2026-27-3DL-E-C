# Client Questions & Clarifications Log

## 1. Overview
This document records all formal questions submitted to the Client / Product Owner (Course Faculty) during **Sprint 1**, along with the official clarifications received, agreed architectural assumptions, and their direct impact on the domain model and REST API implementation.

---

## 2. Questions & Clarifications Register

### Q01: Granularity of Abstract Stock Units
* **Related US**: `BCK09`, `BCK08`, `ARC04`
* **Question**: How should stock quantities be measured? Should stock be tracked in physical units (grams, milliliters, kilograms) or in abstract units?
* **Client Clarification**: Stock must be managed using **Abstract Stock Units** represented strictly as non-negative integers ($\mathbb{Z}_{\ge 0}$). The system does not deal with continuous fractional measurements. Each `ComponentSizeConfiguration` defines an integer number of abstract stock units consumed whenever that component is used in a pizza of that specific size.
* **Architectural Decision**: Implemented `currentStockUnits: Integer` in `StockInformation` and `stockUnitsConsumed: Integer` in `ComponentSizeConfiguration`. Decrement operations strictly enforce $\text{currentStock} - \text{consumed} \ge 0$.

---

### Q02: Pricing Model for Predefined vs Custom Pizzas
* **Related US**: `BCK08`, `BCK10`, `BCK11`, `ARC01`
* **Question**: Is the price of a predefined pizza fixed independently of its ingredients, or is it dynamically computed from the constituent ingredients' configurations?
* **Client Clarification**: A predefined pizza has a default recipe (`PizzaConfiguration`). Its price for a given size is calculated as the sum of the prices of its constituent components for that size, as configured in `ComponentSizeConfiguration`. For custom pizzas, the same rule applies: the customer pays the sum of each selected component's price for the chosen size.
* **Architectural Decision**: Encapsulated pricing logic in `PizzaConfiguration.calculateTotalPrice(sizeConfigs)`. A predefined pizza cannot be offered in a size unless all its components have an active `ComponentSizeConfiguration` for that size.

---

### Q03: Deletion Policy for Products, Categories, and Allergens
* **Related US**: `BCK03`, `BCK04`, `BCK05`, `ARC04`
* **Question**: What should happen when a manager attempts to delete a product category or allergen that is currently associated with products, or a product associated with historical orders?
* **Client Clarification**: Referential and business integrity must be maintained at all times. Physical deletion (`DELETE` CASCADE) is forbidden if the entity is associated with active or historical records. Instead, a **soft deletion** or deactivation mechanism must be applied, or the API must reject deletion with an explicit HTTP 409 Conflict until dependencies are reassociated.
* **Architectural Decision**: Entities include an `isActive: boolean` flag. Deletion endpoints perform dependency validation; if referenced, an `isActive = false` update is performed or an invariant violation is thrown.

---

### Q04: Pizza Component Cardinalities and Assembly Sequencing
* **Related US**: `BCK06`, `BCK07`, `BCK08`, `ARC01`
* **Question**: Can two component types share the same assembly order? What are the allowed culinary limits for each type?
* **Client Clarification**: Two component types cannot have the same assembly order; the ordering is strictly sequential to reflect the physical assembly line in the kitchen (e.g., 1: Dough Base, 2: Sauce, 3: Cheese, 4: Toppings). A pizza must have exactly one dough base ($\min = 1, \max = 1$). Sauce and cheese are typically $\min = 0, \max = 1$, while toppings may have an unbounded maximum or a business limit.
* **Architectural Decision**: Enforced uniqueness constraint on `assemblyOrder` in `PizzaComponentType`. Encapsulated cardinality verification inside `PizzaConfiguration.validateCardinalities()`.

---

### Q05: Dynamic Allergen Aggregation & Exclusion
* **Related US**: `BCK02`, `BCK04`, `BCK11`, `ARC01`
* **Question**: If a customer customizes a pizza by removing a default topping that contains an allergen, does the resulting pizza still contain that allergen?
* **Client Clarification**: No. Allergen presence is dynamic. The allergens of a pizza configuration must be calculated dynamically as the mathematical union of all allergens associated with the specific ingredients physically present in that configuration.
* **Architectural Decision**: Implemented dynamic allergen derivation via set union over active component allergens. The result is checked against the customer's `DietaryRestrictions` at review time.

---

### Q06: User Roles and Access Levels for Sprint 1
* **Related US**: `BCK01`, `BCK02`
* **Question**: Which user roles are required for Sprint 1, and what access rights do they have?
* **Client Clarification**: Sprint 1 must support at least three roles: `CUSTOMER`, `STAFF`, and `MANAGER`. Customers can browse the catalog and manage their profile. Staff can view recipes and update stock levels. Managers have full rights to manage products, categories, allergens, sizes, and pricing configurations.
* **Architectural Decision**: Implemented JWT-based role guards (`requireRole(['MANAGER'])`) protecting administrative routes in Express.

---

### Q07: Scope of AI Preparation Activities in Sprint 1
* **Related US**: `ARC01`, `ARC02`
* **Question**: Is the Prolog AI scheduling engine required to be fully functional in Sprint 1?
* **Client Clarification**: No. Sprint 1 requires domain modelling and architectural preparation for `PreparationActivity` and `KitchenResource`, ensuring the domain concepts are clearly defined and ready to interface with the Prolog engine in Sprint 2 and Sprint 3.
* **Architectural Decision**: Included `PreparationActivity` and `KitchenResource` entities in `docs/domain/domain-model.md` and documented the inter-module bridge in `docs/sad/02-context.md`.

---

### Q08: Entity Identifier and Uniqueness Rules
* **Related US**: `BCK03`, `BCK04`, `BCK05`, `BCK06`
* **Question**: How should entity identifiers be formatted, and which attributes must be unique?
* **Client Clarification**: System entities must use unique identifiers (UUIDs or sequential business keys). Product names, Category names, Allergen codes/names, and Pizza Size names must be unique to prevent operator confusion.
* **Architectural Decision**: Configured Prisma schema with `@unique` constraints on `Product.name`, `ProductCategory.name`, `Allergen.code`, `Allergen.name`, and `PizzaSize.name`.
