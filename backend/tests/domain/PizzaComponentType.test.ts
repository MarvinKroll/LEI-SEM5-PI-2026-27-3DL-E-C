import { PizzaComponentType } from '../../src/domain/models/PizzaComponentType';
import { BusinessRuleViolationError } from '../../src/domain/errors/DomainError';

describe('PizzaComponentType Domain Model (BCK07 / ARC05)', () => {
  it('should create valid pizza component type', () => {
    const type = new PizzaComponentType({
      id: 'type-1',
      name: 'Base Dough',
      assemblyOrder: 1,
      minQuantity: 1,
      maxQuantity: 1,
    });

    expect(type.name).toBe('Base Dough');
    expect(type.assemblyOrder).toBe(1);
    expect(type.minQuantity).toBe(1);
    expect(type.maxQuantity).toBe(1);
  });

  it('should reject invalid assembly order <= 0', () => {
    expect(() => {
      new PizzaComponentType({
        id: 'type-1',
        name: 'Invalid Order',
        assemblyOrder: 0,
        minQuantity: 0,
        maxQuantity: 2,
      });
    }).toThrow(BusinessRuleViolationError);
  });

  it('should reject maxQuantity less than minQuantity', () => {
    expect(() => {
      new PizzaComponentType({
        id: 'type-1',
        name: 'Invalid Quantities',
        assemblyOrder: 1,
        minQuantity: 3,
        maxQuantity: 1,
      });
    }).toThrow(BusinessRuleViolationError);
  });

  it('should validate allowed quantities within bounds', () => {
    const topping = new PizzaComponentType({
      id: 'type-topping',
      name: 'Topping',
      assemblyOrder: 4,
      minQuantity: 0,
      maxQuantity: null, // unbounded
    });

    expect(() => topping.validateQuantity(0)).not.toThrow();
    expect(() => topping.validateQuantity(5)).not.toThrow();
  });

  it('should throw error when quantity violates minQuantity', () => {
    const dough = new PizzaComponentType({
      id: 'type-dough',
      name: 'Base Dough',
      assemblyOrder: 1,
      minQuantity: 1,
      maxQuantity: 1,
    });

    expect(() => dough.validateQuantity(0)).toThrow(BusinessRuleViolationError);
    expect(() => dough.validateQuantity(2)).toThrow(BusinessRuleViolationError);
  });
});
