import { BusinessRuleViolationError } from '../errors/DomainError';

export interface PizzaSizeProps {
  id: string;
  name: string;
  diameterCm?: number | null;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class PizzaSize {
  private props: PizzaSizeProps;

  constructor(props: PizzaSizeProps) {
    if (!props.name || props.name.trim().length === 0) {
      throw new BusinessRuleViolationError('Pizza Size name cannot be empty.');
    }
    if (props.diameterCm !== undefined && props.diameterCm !== null && props.diameterCm <= 0) {
      throw new BusinessRuleViolationError('Pizza diameter must be a positive integer.');
    }

    this.props = {
      ...props,
      name: props.name.trim(),
      isActive: props.isActive ?? true,
    };
  }

  get id(): string { return this.props.id; }
  get name(): string { return this.props.name; }
  get diameterCm(): number | null | undefined { return this.props.diameterCm; }
  get isActive(): boolean { return this.props.isActive; }

  public deactivate(): void {
    this.props.isActive = false;
  }

  public activate(): void {
    this.props.isActive = true;
  }

  public toJSON(): PizzaSizeProps {
    return { ...this.props };
  }
}
