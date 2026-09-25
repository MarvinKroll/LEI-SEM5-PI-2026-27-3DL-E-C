import { BusinessRuleViolationError } from '../errors/DomainError';

export interface AllergenProps {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Allergen {
  private props: AllergenProps;

  constructor(props: AllergenProps) {
    if (!props.code || props.code.trim().length === 0) {
      throw new BusinessRuleViolationError('Allergen code cannot be empty.');
    }
    if (!props.name || props.name.trim().length === 0) {
      throw new BusinessRuleViolationError('Allergen name cannot be empty.');
    }
    this.props = {
      ...props,
      code: props.code.trim().toUpperCase(),
      name: props.name.trim(),
    };
  }

  get id(): string { return this.props.id; }
  get code(): string { return this.props.code; }
  get name(): string { return this.props.name; }
  get description(): string | null | undefined { return this.props.description; }

  public toJSON(): AllergenProps {
    return { ...this.props };
  }
}
