import { BusinessRuleViolationError } from '../errors/DomainError';

export interface StockInformationProps {
  id: string;
  productId: string;
  currentStockUnits: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export class StockInformation {
  private props: StockInformationProps;

  constructor(props: StockInformationProps) {
    if (!props.productId) {
      throw new BusinessRuleViolationError('StockInformation requires a valid productId.');
    }
    if (props.currentStockUnits < 0 || !Number.isInteger(props.currentStockUnits)) {
      throw new BusinessRuleViolationError('Stock quantity must be a non-negative integer of abstract stock units.');
    }

    this.props = { ...props };
  }

  get id(): string { return this.props.id; }
  get productId(): string { return this.props.productId; }
  get currentStockUnits(): number { return this.props.currentStockUnits; }

  public increaseStock(units: number): void {
    if (units <= 0 || !Number.isInteger(units)) {
      throw new BusinessRuleViolationError('Stock increase quantity must be a positive integer.');
    }
    this.props.currentStockUnits += units;
  }

  public decreaseStock(units: number): void {
    if (units <= 0 || !Number.isInteger(units)) {
      throw new BusinessRuleViolationError('Stock decrease quantity must be a positive integer.');
    }
    if (this.props.currentStockUnits - units < 0) {
      throw new BusinessRuleViolationError(
        `Insufficient stock: current stock is ${this.props.currentStockUnits}, requested reduction is ${units}. Stock cannot be negative.`
      );
    }
    this.props.currentStockUnits -= units;
  }

  public toJSON(): StockInformationProps {
    return { ...this.props };
  }
}
