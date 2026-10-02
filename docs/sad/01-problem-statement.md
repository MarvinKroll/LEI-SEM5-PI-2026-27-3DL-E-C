# 01 — Problem Statement

## 1. Executive Summary
**LaPrizza** is a modern, high-throughput artisanal pizza restaurant seeking to build an integrated information system. The system must coordinate customer interactions, flexible menu catalog management, dynamic pizza customization ("Build Your Pizza"), real-time inventory tracking, and multi-station kitchen preparation workflows.

This project is developed as part of the 5th Semester Integrative Project in Informatics Engineering (**LEI**) at the Instituto Superior de Engenharia do Porto (**ISEP**), spanning the course units:
* **ARQSI** (*Arquitetura de Sistemas*)
* **LAPR5** (*Laboratório e Projeto V*)
* **SGRAI** (*Sistemas Gráficos e Interação*)
* **IART** (*Inteligência Artificial*)
* **ASIST** (*Administração de Sistemas*)

---

## 2. Business Context & Challenges

### 2.1 The Operational Challenge
In traditional restaurant point-of-sale (POS) and inventory systems, products are modeled as fixed, static stock-keeping units (SKUs) or ad-hoc order notes. However, a contemporary pizza establishment introduces complex operational dynamics:
1. **Dynamic Composition**: Pizzas can be either predefined recipes (e.g., Margherita, Diavola) or customized by customers from scratch or by altering base components.
2. **Size-Dependent Scaling**: Ingredients do not scale linearly by size alone; a "Large" pizza consumes distinct abstract units of dough, sauce, cheese, and toppings compared to a "Small" or "Medium" pizza, each with distinct pricing and stock depletion rules.
3. **Food Safety & Allergen Traceability**: Customers with severe food allergies (e.g., gluten, dairy, tree nuts) or dietary restrictions (e.g., vegetarian, vegan, lactose-free) require guaranteed transparency. The system must dynamically compute allergens based on the exact combination of selected ingredients.
4. **Abstract Stock Control**: Stock is consumed in non-negative abstract integer units to avoid fractional floating-point inaccuracies, requiring atomic transactional guarantees.
5. **Kitchen Throughput & Operational Bottlenecks**: As orders arrive, preparation involves multi-stage workflows (dough preparation, topping assembly, oven baking, cutting/packaging) requiring future algorithmic scheduling (IART) and workstation dispatching.

---

## 3. Core Problems Addressed by the Architecture

| Problem Domain | Challenge Description | Architectural Impact |
| :--- | :--- | :--- |
| **Pizza Composition & Cardinalities** | Components follow strict culinary assembly rules (e.g., exactly one dough base, at most one base sauce, maximum topping limits). | Encapsulated in pure Domain Entities (`PizzaComponentType`, `PizzaConfiguration`) with strict invariant enforcement independent of UI frameworks. |
| **Size Configuration Decoupling** | Each ingredient's price and stock unit consumption depends on the pizza size (`Small`, `Medium`, `Large`). | Introduction of explicit `ComponentSizeConfiguration` association entities and domain validation services. |
| **Allergen Cascading** | Allergen information must never be manually duplicated; it must be derived dynamically from constituent products. | Computed properties in domain entities that perform set union operations over component allergens. |
| **Cross-Disciplinary Integration** | The core back-end must interface with a 3D WebGL configurator (SGRAI), an AI Prolog scheduling engine (IART), and containerized infrastructure (ASIST). | Adherence to Clean / Onion Architecture with well-defined REST API contracts and clear DTO boundaries. |
| **Data Integrity & Traceability** | Historical orders, recipes, and customers cannot suffer data corruption when menu items or prices change. | Soft deletion, immutability of recorded order snapshots, and database referential constraints. |

---

## 4. Key Stakeholders & Expectations

* **Customers**:
  * Seamless digital catalog browsing with instant allergen filtering.
  * Transparent pricing updates during pizza configuration.
  * Dietary restriction tracking against their profile.
* **Kitchen Staff**:
  * Accurate, structured assembly instructions adhering to culinary order (Dough → Sauce → Cheese → Toppings).
  * Reliable stock depletion preventing out-of-stock order commitments.
* **Restaurant Managers & Administrators**:
  * Intuitive administrative REST APIs to configure categories, allergens, sizes, and stock.
  * Complete auditability of catalog items and operational inventory levels.
* **Engineering & Architecture Team**:
  * High automated test coverage (>80% domain logic).
  * Loose coupling between business logic, database persistence, and presentation interfaces.
  * Predictable, reproducible build and deployment pipelines.

---

## 5. Architectural Success Criteria

1. **High Invariant Cohesion**: 100% of business validation rules (component cardinalities, stock non-negativity, size compatibility) are verified within the domain layer before database persistence.
2. **Interoperability**: REST API contracts conforming to OpenAPI 3.0, readily consumable by web frontends, 3D visualization clients, and AI micro-agents.
3. **Extensibility**: Ability to introduce Sprint 2 and Sprint 3 features (order placement, Prolog scheduling, 3D kitchen visualization) without modifying Sprint 1 domain entities.
