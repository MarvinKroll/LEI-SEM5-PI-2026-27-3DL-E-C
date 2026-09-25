import { PizzaConfiguration } from '../../src/domain/models/PizzaConfiguration';
import { Product } from '../../src/domain/models/Product';
import { Allergen } from '../../src/domain/models/Allergen';
import { PizzaComponentType } from '../../src/domain/models/PizzaComponentType';
import { BusinessRuleViolationError } from '../../src/domain/errors/DomainError';

describe('PizzaConfiguration Domain Model (BCK10 / ARC05)', () => {
  const gluten = new Allergen({ id: 'allg-1', code: 'GLUTEN', name: 'Gluten' });
  const dairy = new Allergen({ id: 'allg-2', code: 'DAIRY', name: 'Dairy' });

  const doughType = new PizzaComponentType({
    id: 'type-dough',
    name: 'Base Dough',
    assemblyOrder: 1,
    minQuantity: 1,
    maxQuantity: 1,
  });

  const cheeseType = new PizzaComponentType({
    id: 'type-cheese',
    name: 'Cheese',
    assemblyOrder: 3,
    minQuantity: 0,
    maxQuantity: 1,
  });

  const doughProduct = new Product({
    id: 'prod-dough',
    name: 'Traditional Dough',
    categoryId: 'cat-ing',
    isSellable: false,
    isStockControlled: true,
    isPizzaComponent: true,
    isActive: true,
    componentTypeId: 'type-dough',
    allergens: [gluten],
  });

  const cheeseProduct = new Product({
    id: 'prod-cheese',
    name: 'Mozzarella',
    categoryId: 'cat-ing',
    isSellable: false,
    isStockControlled: true,
    isPizzaComponent: true,
    isActive: true,
    componentTypeId: 'type-cheese',
    allergens: [dairy],
  });

  it('should calculate effective allergens as the union of all components', () => {
    const config = new PizzaConfiguration({
      id: 'cfg-1',
      pizzaSizeId: 'size-medium',
      components: [
        { product: doughProduct, quantity: 1 },
        { product: cheeseProduct, quantity: 1 },
      ],
    });

    const allergens = config.getEffectiveAllergens();
    expect(allergens).toHaveLength(2);
    expect(allergens.map(a => a.code)).toEqual(expect.arrayContaining(['GLUTEN', 'DAIRY']));
  });

  it('should reject configuration containing duplicate components', () => {
    const config = new PizzaConfiguration({
      id: 'cfg-1',
      pizzaSizeId: 'size-medium',
      components: [
        { product: doughProduct, quantity: 1 },
        { product: doughProduct, quantity: 1 },
      ],
    });

    expect(() => {
      config.validate([doughType, cheeseType]);
    }).toThrow(BusinessRuleViolationError);
  });

  it('should reject configuration missing mandatory Base Dough component', () => {
    const config = new PizzaConfiguration({
      id: 'cfg-1',
      pizzaSizeId: 'size-medium',
      components: [
        { product: cheeseProduct, quantity: 1 },
      ],
    });

    expect(() => {
      config.validate([doughType, cheeseType]);
    }).toThrow(BusinessRuleViolationError);
  });
});
