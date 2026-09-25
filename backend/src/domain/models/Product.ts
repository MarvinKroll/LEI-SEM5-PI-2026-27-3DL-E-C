import { BusinessRuleViolationError } from '../errors/DomainError';
import { Allergen } from './Allergen';
import { PizzaComponentType } from './PizzaComponentType';
import { ProductCategory } from './ProductCategory';

export interface ProductProps {
  id: string;
  name: string;
  description?: string | null;
  categoryId: string;
  category?: ProductCategory;
  isSellable: boolean;
  isStockControlled: boolean;
  isPizzaComponent: boolean;
  isActive: boolean;
  basePrice?: number | null;
  componentTypeId?: string | null;
  componentType?: PizzaComponentType | null;
  allergens?: Allergen[];
  createdAt?: Date;
  updatedAt?: Date;
}

export class Product {
  private props: ProductProps;

  constructor(props: ProductProps) {
    if (!props.name || props.name.trim().length === 0) {
      throw new BusinessRuleViolationError('Product name cannot be empty.');
    }
    if (!props.categoryId) {
      throw new BusinessRuleViolationError('Product must belong to a category.');
    }
    if (props.isPizzaComponent && !props.componentTypeId) {
      throw new BusinessRuleViolationError('A product designated as a Pizza Component must be associated with a Pizza Component Type.');
    }
    if (!props.isPizzaComponent && props.componentTypeId) {
      throw new BusinessRuleViolationError('A product not designated as a Pizza Component cannot have a Pizza Component Type.');
    }
    if (props.isSellable && props.basePrice !== null && props.basePrice !== undefined && props.basePrice < 0) {
      throw new BusinessRuleViolationError('Product base price cannot be negative.');
    }

    this.props = {
      ...props,
      name: props.name.trim(),
      isActive: props.isActive ?? true,
      allergens: props.allergens || [],
    };
  }

  get id(): string { return this.props.id; }
  get name(): string { return this.props.name; }
  get description(): string | null | undefined { return this.props.description; }
  get categoryId(): string { return this.props.categoryId; }
  get isSellable(): boolean { return this.props.isSellable; }
  get isStockControlled(): boolean { return this.props.isStockControlled; }
  get isPizzaComponent(): boolean { return this.props.isPizzaComponent; }
  get isActive(): boolean { return this.props.isActive; }
  get basePrice(): number | null | undefined { return this.props.basePrice; }
  get componentTypeId(): string | null | undefined { return this.props.componentTypeId; }
  get allergens(): Allergen[] { return this.props.allergens || []; }

  public deactivate(): void {
    this.props.isActive = false;
  }

  public activate(): void {
    this.props.isActive = true;
  }

  public toJSON(): ProductProps {
    return { ...this.props };
  }
}
