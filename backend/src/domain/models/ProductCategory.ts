import { BusinessRuleViolationError } from '../errors/DomainError';

export interface ProductCategoryProps {
  id: string;
  name: string;
  description?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export class ProductCategory {
  private props: ProductCategoryProps;

  constructor(props: ProductCategoryProps) {
    if (!props.name || props.name.trim().length === 0) {
      throw new BusinessRuleViolationError('Product category name cannot be empty.');
    }
    this.props = {
      ...props,
      name: props.name.trim(),
    };
  }

  get id(): string { return this.props.id; }
  get name(): string { return this.props.name; }
  get description(): string | null | undefined { return this.props.description; }

  public update(name: string, description?: string | null): void {
    if (!name || name.trim().length === 0) {
      throw new BusinessRuleViolationError('Product category name cannot be empty.');
    }
    this.props.name = name.trim();
    this.props.description = description;
  }

  public toJSON(): ProductCategoryProps {
    return { ...this.props };
  }
}
