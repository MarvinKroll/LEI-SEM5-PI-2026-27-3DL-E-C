import { BusinessRuleViolationError } from '../errors/DomainError';

export interface PizzaComponentTypeProps {
  id: string;
  name: string;
  assemblyOrder: number;
  minQuantity: number;
  maxQuantity: number | null; // null represents unbounded
  createdAt?: Date;
  updatedAt?: Date;
}

export class PizzaComponentType {
  private props: PizzaComponentTypeProps;

  constructor(props: PizzaComponentTypeProps) {
    if (!props.name || props.name.trim().length === 0) {
      throw new BusinessRuleViolationError('Pizza Component Type name cannot be empty.');
    }
    if (props.assemblyOrder <= 0) {
      throw new BusinessRuleViolationError('Assembly order must be a positive integer.');
    }
    if (props.minQuantity < 0) {
      throw new BusinessRuleViolationError('Minimum quantity cannot be negative.');
    }
    if (props.maxQuantity !== null && props.maxQuantity < props.minQuantity) {
      throw new BusinessRuleViolationError('Maximum quantity cannot be less than minimum quantity.');
    }

    this.props = {
      ...props,
      name: props.name.trim(),
    };
  }

  get id(): string { return this.props.id; }
  get name(): string { return this.props.name; }
  get assemblyOrder(): number { return this.props.assemblyOrder; }
  get minQuantity(): number { return this.props.minQuantity; }
  get maxQuantity(): number | null { return this.props.maxQuantity; }

  public validateQuantity(quantity: number): void {
    if (quantity < this.props.minQuantity) {
      throw new BusinessRuleViolationError(
        `Component type "${this.props.name}" requires at least ${this.props.minQuantity} items (provided: ${quantity}).`
      );
    }
    if (this.props.maxQuantity !== null && quantity > this.props.maxQuantity) {
      throw new BusinessRuleViolationError(
        `Component type "${this.props.name}" allows at most ${this.props.maxQuantity} items (provided: ${quantity}).`
      );
    }
  }

  public toJSON(): PizzaComponentTypeProps {
    return { ...this.props };
  }
}
