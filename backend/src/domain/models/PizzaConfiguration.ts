import { BusinessRuleViolationError } from '../errors/DomainError';
import { Allergen } from './Allergen';
import { PizzaComponentType } from './PizzaComponentType';
import { Product } from './Product';

export interface PizzaConfigComponentItem {
  product: Product;
  quantity: number;
}

export interface PizzaConfigurationProps {
  id: string;
  pizzaSizeId: string;
  components: PizzaConfigComponentItem[];
}

export class PizzaConfiguration {
  private props: PizzaConfigurationProps;

  constructor(props: PizzaConfigurationProps) {
    if (!props.pizzaSizeId) {
      throw new BusinessRuleViolationError('Pizza configuration requires a pizzaSizeId.');
    }
    this.props = {
      ...props,
      components: props.components || [],
    };
  }

  get id(): string { return this.props.id; }
  get pizzaSizeId(): string { return this.props.pizzaSizeId; }
  get components(): PizzaConfigComponentItem[] { return this.props.components; }

  /**
   * Validates business invariants:
   * 1. All products must be active and designated as pizza components.
   * 2. No duplicate pizza components.
   * 3. Satisfies min and max cardinalities for each component type.
   */
  public validate(componentTypes: PizzaComponentType[]): void {
    const seenProductIds = new Set<string>();

    for (const item of this.props.components) {
      if (!item.product.isActive) {
        throw new BusinessRuleViolationError(`Product "${item.product.name}" is inactive and cannot be in a pizza configuration.`);
      }
      if (!item.product.isPizzaComponent) {
        throw new BusinessRuleViolationError(`Product "${item.product.name}" is not designated as a Pizza Component.`);
      }
      if (seenProductIds.has(item.product.id)) {
        throw new BusinessRuleViolationError(`Pizza Component "${item.product.name}" cannot occur more than once in the configuration.`);
      }
      seenProductIds.add(item.product.id);
    }

    // Group by component type and validate min/max
    for (const type of componentTypes) {
      const count = this.props.components.filter(
        c => c.product.componentTypeId === type.id
      ).length;

      type.validateQuantity(count);
    }
  }

  /**
   * Allergen information is derived from the components participating in the configuration.
   */
  public getEffectiveAllergens(): Allergen[] {
    const allergenMap = new Map<string, Allergen>();
    for (const item of this.props.components) {
      for (const allergen of item.product.allergens) {
        allergenMap.set(allergen.id, allergen);
      }
    }
    return Array.from(allergenMap.values());
  }

  public toJSON() {
    return {
      id: this.props.id,
      pizzaSizeId: this.props.pizzaSizeId,
      components: this.props.components.map(c => ({
        productId: c.product.id,
        productName: c.product.name,
        quantity: c.quantity,
      })),
      effectiveAllergens: this.getEffectiveAllergens().map(a => a.toJSON()),
    };
  }
}
