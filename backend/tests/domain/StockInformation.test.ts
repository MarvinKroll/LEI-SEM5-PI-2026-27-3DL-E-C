import { StockInformation } from '../../src/domain/models/StockInformation';
import { BusinessRuleViolationError } from '../../src/domain/errors/DomainError';

describe('StockInformation Domain Model (BCK09 / ARC05)', () => {
  it('should initialize with valid abstract stock units', () => {
    const stock = new StockInformation({
      id: 'stock-1',
      productId: 'prod-1',
      currentStockUnits: 20,
    });

    expect(stock.currentStockUnits).toBe(20);
    expect(stock.productId).toBe('prod-1');
  });

  it('should reject negative initial stock quantity', () => {
    expect(() => {
      new StockInformation({
        id: 'stock-1',
        productId: 'prod-1',
        currentStockUnits: -5,
      });
    }).toThrow(BusinessRuleViolationError);
  });

  it('should increase stock correctly by positive integer', () => {
    const stock = new StockInformation({
      id: 'stock-1',
      productId: 'prod-1',
      currentStockUnits: 10,
    });

    stock.increaseStock(15);
    expect(stock.currentStockUnits).toBe(25);
  });

  it('should decrease stock correctly when sufficient units exist', () => {
    const stock = new StockInformation({
      id: 'stock-1',
      productId: 'prod-1',
      currentStockUnits: 10,
    });

    stock.decreaseStock(4);
    expect(stock.currentStockUnits).toBe(6);
  });

  it('should prevent stock reduction from resulting in negative stock quantity', () => {
    const stock = new StockInformation({
      id: 'stock-1',
      productId: 'prod-1',
      currentStockUnits: 5,
    });

    expect(() => {
      stock.decreaseStock(6);
    }).toThrow(BusinessRuleViolationError);
  });
});
