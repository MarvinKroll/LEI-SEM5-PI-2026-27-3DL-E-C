import { BusinessRuleViolationError } from '../errors/DomainError';

export interface ComponentSizeConfigurationProps {
  id: string;
  productId: string;
  pizzaSizeId: string;
  price: number;
  stockUnitsConsumed: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export class ComponentSizeConfiguration {
  private props: ComponentSizeConfigurationProps;

  constructor(props: ComponentSizeConfigurationProps) {
    if (!props.productId) {
      throw new BusinessRuleViolationError('ComponentSizeConfiguration requires a valid productId.');
    }
    if (!props.pizzaSizeId) {
      throw new BusinessRuleViolationError('ComponentSizeConfiguration requires a valid pizzaSizeId.');
    }
    if (props.price < 0) {
      throw new BusinessRuleViolationError('Component price cannot be negative.');
    }
    if (props.stockUnitsConsumed < 0 || !Number.isInteger(props.stockUnitsConsumed)) {
      throw new BusinessRuleViolationError('Stock units consumed must be a non-negative integer.');
    }

    this.props = { ...props };
  }

  get id(): string { return this.props.id; }
  get productId(): string { return this.props.productId; }
  get pizzaSizeId(): string { return this.props.pizzaSizeId; }
  get price(): number { return this.props.price; }
  get stockUnitsConsumed(): number { return this.props.stockUnitsConsumed; }

  public update(price: number, stockUnitsConsumed: number): void {
    if (price < 0) {
      throw new BusinessRuleViolationError('Component price cannot be negative.');
    }
    if (stockUnitsConsumed < 0 || !Number.isInteger(stockUnitsConsumed)) {
      throw new BusinessRuleViolationError('Stock units consumed must be a non-negative integer.');
    }
    this.props.price = price;
    this.props.stockUnitsConsumed = stockUnitsConsumed;
  }

  public toJSON(): ComponentSizeConfigurationProps {
    return { ...this.props };
  }
}
