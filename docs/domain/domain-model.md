# Domain Model — Core Business Analysis & Modelling

## 1. Overview
This document specifies the conceptual and tactical **Domain Model** for the **LaPrizza** Information System, formulated using **Domain-Driven Design (DDD)** principles.

The domain layer encapsulates all business logic, invariants, entity relationships, and aggregate boundaries, isolated from persistence technologies (Prisma/PostgreSQL) and presentation protocols (REST/Express/React).

---

## 2. Ubiquitous Language (Glossary)

| Domain Term | Definition |
| :--- | :--- |
| **Product** | Any commercial item managed by the restaurant. Can be sellable directly, controlled by stock, and/or classified as a pizza component. |
| **ProductCategory** | A high-level classification for products (e.g., Beverages, Desserts, Pizza Ingredients, Packaged Snacks). |
| **Allergen** | A recognized substance (e.g., Gluten, Lactose, Peanuts) that may cause allergic reactions. Associated with products. |
| **DietaryRestriction** | A dietary preference or medical restriction declared by a Customer (e.g., Vegan, Gluten-Free). |
| **PizzaSize** | A standardized pizza dimension characterized by name (e.g., Small, Medium, Large) and diameter in cm. |
| **PizzaComponentType** | A structural role for pizza ingredients (e.g., *Base Dough*, *Base Sauce*, *Cheese*, *Topping*). Governed by assembly order and quantity limits. |
| **ComponentSizeConfiguration**| The pairing of a Pizza Component and a Pizza Size that defines its specific retail price and abstract stock consumption. |
| **StockInformation** | Abstract integer inventory units tracked per stock-controlled product. Invariant: `units >= 0`. |
| **PredefinedPizza** | A menu pizza recipe (e.g., *Margherita*) backed by a sellable product and an immutable default component configuration. |
| **PizzaConfiguration** | A specific composition of ingredients for a given size, satisfying component type cardinalities. |
| **Order & OrderItem** | An operational transaction placed by a Customer containing items, unit prices, and optional custom pizza configurations. |
| **PreparationActivity** | A discrete kitchen task (dough stretching, topping, baking) allocated to resources for AI scheduling (IART). |

---

## 3. Domain Model Class Diagram (Mermaid)

```mermaid
classDiagram
    class Customer {
        +UUID id
        +String name
        +Email email
        +PhoneNumber phone
        +Address address
        +List~DietaryRestriction~ dietaryRestrictions
        +registerRestriction(restriction)
    }

    class DietaryRestriction {
        +UUID id
        +String name
        +String description
        +List~Allergen~ associatedAllergens
    }

    class ProductCategory {
        +UUID id
        +String name
        +String description
        +Boolean isActive
    }

    class Allergen {
        +UUID id
        +String code
        +String name
        +String description
    }

    class Product {
        +UUID id
        +String name
        +String description
        +ProductCategory category
        +Boolean isSellable
        +Boolean isStockControlled
        +Boolean isPizzaComponent
        +Boolean isActive
        +Money basePrice
        +List~Allergen~ allergens
        +PizzaComponentType componentType
        +addAllergen(allergen)
        +removeAllergen(allergenId)
    }

    class PizzaSize {
        +UUID id
        +String name
        +Integer diameterCm
        +Boolean isActive
    }

    class PizzaComponentType {
        +UUID id
        +String name
        +Integer assemblyOrder
        +Integer minQuantity
        +Integer maxQuantity
        +validateQuantity(count)
    }

    class ComponentSizeConfiguration {
        +UUID id
        +Product pizzaComponent
        +PizzaSize pizzaSize
        +Money price
        +Integer stockUnitsConsumed
    }

    class StockInformation {
        +UUID id
        +Product product
        +Integer currentStockUnits
        +increaseStock(units)
        +decreaseStock(units)
        +hasSufficientStock(requestedUnits) Boolean
    }

    class PredefinedPizza {
        +UUID id
        +Product product
        +PizzaConfiguration defaultConfiguration
        +List~PizzaSize~ getAvailableSizes()
    }

    class PizzaConfiguration {
        +UUID id
        +PizzaSize size
        +List~Product~ components
        +validateCardinalities(componentTypes)
        +calculateTotalPrice(sizeConfigs) Money
        +getEffectiveAllergens() List~Allergen~
    }

    class Order {
        +UUID id
        +Customer customer
        +OrderStatus status
        +DateTime createdAt
        +List~OrderItem~ items
        +Money totalAmount
        +calculateTotal() Money
    }

    class OrderItem {
        +UUID id
        +Product product
        +Integer quantity
        +Money unitPrice
        +PizzaConfiguration customConfiguration
    }

    class PreparationActivity {
        +UUID id
        +OrderItem orderItem
        +ActivityType type
        +Duration estimatedDuration
        +ActivityStatus status
        +KitchenResource assignedResource
    }

    class KitchenResource {
        +UUID id
        +String name
        +ResourceType type
        +Integer capacity
        +Boolean isAvailable
    }

    Customer "1" --> "*" DietaryRestriction : registers
    DietaryRestriction "*" --> "*" Allergen : flags
    Product "*" --> "1" ProductCategory : classified under
    Product "*" --> "*" Allergen : contains
    Product "1" --> "0..1" PizzaComponentType : plays role of
    Product "1" --> "0..1" StockInformation : inventory tracked by
    ComponentSizeConfiguration "*" --> "1" Product : configures ingredient
    ComponentSizeConfiguration "*" --> "1" PizzaSize : for dimension
    PredefinedPizza "1" --> "1" Product : represents
    PredefinedPizza "1" --> "1" PizzaConfiguration : defines default recipe
    PizzaConfiguration "*" --> "1" PizzaSize : specifies dimension
    PizzaConfiguration "*" --> "*" Product : composed of
    Order "1" --> "*" OrderItem : contains
    Order "*" --> "1" Customer : submitted by
    OrderItem "1" --> "0..1" PizzaConfiguration : stores custom recipe
    PreparationActivity "*" --> "1" OrderItem : prepares
    PreparationActivity "*" --> "0..1" KitchenResource : utilizes
```

---

## 4. Invariants & Business Rules

### 4.1 Cardinalities and Assembly Ordering
1. **Uniqueness of Assembly Order**: Every `PizzaComponentType` has a strictly unique `assemblyOrder` integer (e.g., 1 for Dough, 2 for Sauce, 3 for Cheese, 4 for Toppings). No two types may share the same assembly order.
2. **Component Quantity Constraints**:
   * For every component type $T$ present in a pizza recipe:
     $$\text{minQuantity}(T) \le \text{count}(c \in \text{components} \mid \text{type}(c) = T) \le \text{maxQuantity}(T)$$
   * Standard culinary default:
     * *Base Dough*: $\min = 1, \max = 1$ (mandatory).
     * *Base Sauce*: $\min = 0, \max = 1$ (optional base).
     * *Cheese*: $\min = 0, \max = 2$ (optional/customizable).
     * *Toppings*: $\min = 0, \max = \text{unbounded}$.

### 4.2 Size-Dependent Availability
* A `PredefinedPizza` can only be offered in a given `PizzaSize` if **every single component** in its recipe has an active `ComponentSizeConfiguration` defined for that size. If an ingredient lacks configuration for *Large*, the pizza cannot be ordered in *Large*.

### 4.3 Abstract Stock Invariant
* Stock units are non-negative integers ($\mathbb{Z}_{\ge 0}$).
* Decrement operations must fail atomically if $\text{currentUnits} - \text{requestedUnits} < 0$.

### 4.4 Dynamic Allergen Propagation
* The allergens of a pizza configuration are dynamically derived as the set union of all allergens present in its constituent ingredients:
  $$\text{Allergens}(\text{Configuration}) = \bigcup_{c \in \text{Components}} \text{Allergens}(c)$$
