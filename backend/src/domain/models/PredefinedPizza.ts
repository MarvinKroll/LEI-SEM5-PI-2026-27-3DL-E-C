import { BusinessRuleViolationError } from '../errors/DomainError';
import { ComponentSizeConfiguration } from './ComponentSizeConfiguration';
import { PizzaConfiguration } from './PizzaConfiguration';
import { PizzaSize } from './PizzaSize';
import { Product } from './Product';

export interface PredefinedPizzaProps {
  id: string;
  productId: string;
  product: Product;
  defaultConfiguration: PizzaConfiguration;
}

export class PredefinedPizza {
  private props: PredefinedPizzaProps;

  constructor(props: PredefinedPizzaProps) {
    if (!props.product.isSellable) {
      throw new BusinessRuleViolationError('A Predefined Pizza must be represented by an appropriate sellable product.');
    }
    this.props = { ...props };
  }

  get id(): string { return this.props.id; }
  get productId(): string { return this.props.productId; }
  get product(): Product { return this.props.product; }
  get defaultConfiguration(): PizzaConfiguration { return this.props.defaultConfiguration; }

  /**
   * A Predefined Pizza may only be made available in Pizza Sizes for which ALL Pizza Components
   * in its default configuration have a corresponding ComponentSizeConfiguration.
   */
  public determineAvailableSizes(
    allSizes: PizzaSize[],
    allSizeConfigs: ComponentSizeConfiguration[]
  ): PizzaSize[] {
    const requiredProductIds = this.props.defaultConfiguration.components.map(c => c.product.id);

    return allSizes.filter(size => {
      if (!size.isActive) return false;

      // Check if all components have a config for this size
      const hasAllConfigs = requiredProductIds.every(prodId =>
        allSizeConfigs.some(cfg => cfg.productId === prodId && cfg.pizzaSizeId === size.id)
      );

      return hasAllConfigs;
    });
  }

  public toJSON() {
    return {
      id: this.props.id,
      productId: this.props.productId,
      productName: this.props.product.name,
      defaultConfiguration: this.props.defaultConfiguration.toJSON(),
    };
  }
}
