import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../infrastructure/db/prisma';
import { authenticate, authorize } from '../middlewares/authMiddleware';

const router = Router();

const createPredefinedPizzaSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  categoryId: z.string().min(1),
  basePrice: z.number().min(0),
  defaultPizzaSizeId: z.string().min(1),
  componentProductIds: z.array(z.string().min(1)).min(1),
});

// GET /api/predefined-pizzas - List with available sizes & ingredients (BCK10)
router.get('/', async (req, res, next) => {
  try {
    const pizzas = await prisma.predefinedPizza.findMany({
      include: {
        product: {
          include: { category: true, allergens: true },
        },
        defaultConfiguration: {
          include: {
            pizzaSize: true,
            components: {
              include: {
                product: {
                  include: {
                    componentType: true,
                    allergens: true,
                    sizeConfigs: { include: { pizzaSize: true } },
                  },
                },
              },
            },
          },
        },
      },
    });

    const allSizes = await prisma.pizzaSize.findMany({ where: { isActive: true } });

    // Determine available sizes for each predefined pizza (BCK10)
    const result = pizzas.map(pizza => {
      const componentProducts = pizza.defaultConfiguration.components.map(c => c.product);
      
      const availableSizes = allSizes.filter(size => {
        // Must have a ComponentSizeConfiguration for every component on this size
        return componentProducts.every(comp =>
          comp.sizeConfigs.some(cfg => cfg.pizzaSizeId === size.id)
        );
      });

      // Calculate effective allergens (union of component allergens)
      const allergenMap = new Map<string, any>();
      for (const comp of componentProducts) {
        for (const allergen of comp.allergens) {
          allergenMap.set(allergen.id, allergen);
        }
      }

      return {
        id: pizza.id,
        productId: pizza.productId,
        name: pizza.product.name,
        description: pizza.product.description,
        basePrice: pizza.product.basePrice,
        category: pizza.product.category,
        defaultSize: pizza.defaultConfiguration.pizzaSize,
        defaultComponents: pizza.defaultConfiguration.components.map(c => ({
          productId: c.productId,
          name: c.product.name,
          componentType: c.product.componentType?.name,
          assemblyOrder: c.product.componentType?.assemblyOrder,
        })),
        availableSizes,
        allergens: Array.from(allergenMap.values()),
      };
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
});

// GET /api/predefined-pizzas/:id
router.get('/:id', async (req, res, next) => {
  try {
    const pizza = await prisma.predefinedPizza.findUnique({
      where: { id: req.params.id },
      include: {
        product: { include: { category: true, allergens: true } },
        defaultConfiguration: {
          include: {
            pizzaSize: true,
            components: {
              include: {
                product: {
                  include: {
                    componentType: true,
                    allergens: true,
                    sizeConfigs: { include: { pizzaSize: true } },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!pizza) {
      res.status(404).json({ error: 'Predefined pizza not found.' });
      return;
    }

    const allSizes = await prisma.pizzaSize.findMany({ where: { isActive: true } });
    const componentProducts = pizza.defaultConfiguration.components.map(c => c.product);
    
    const availableSizes = allSizes.filter(size => {
      return componentProducts.every(comp =>
        comp.sizeConfigs.some(cfg => cfg.pizzaSizeId === size.id)
      );
    });

    const allergenMap = new Map<string, any>();
    for (const comp of componentProducts) {
      for (const allergen of comp.allergens) {
        allergenMap.set(allergen.id, allergen);
      }
    }

    res.json({
      id: pizza.id,
      productId: pizza.productId,
      name: pizza.product.name,
      description: pizza.product.description,
      basePrice: pizza.product.basePrice,
      category: pizza.product.category,
      defaultSize: pizza.defaultConfiguration.pizzaSize,
      defaultComponents: pizza.defaultConfiguration.components.map(c => ({
        productId: c.productId,
        name: c.product.name,
        componentType: c.product.componentType?.name,
        assemblyOrder: c.product.componentType?.assemblyOrder,
      })),
      availableSizes,
      allergens: Array.from(allergenMap.values()),
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/predefined-pizzas (BCK10)
router.post('/', authenticate, authorize(['MANAGER']), async (req, res, next) => {
  try {
    const data = createPredefinedPizzaSchema.parse(req.body);

    // 1. Verify default pizza size
    const pizzaSize = await prisma.pizzaSize.findUnique({
      where: { id: data.defaultPizzaSizeId },
    });
    if (!pizzaSize) {
      res.status(404).json({ error: 'Default Pizza Size not found.' });
      return;
    }

    // 2. Fetch and validate all components
    const components = await prisma.product.findMany({
      where: { id: { in: data.componentProductIds } },
      include: {
        componentType: true,
        allergens: true,
        sizeConfigs: true,
      },
    });

    if (components.length !== data.componentProductIds.length) {
      res.status(400).json({ error: 'One or more component products were not found.' });
      return;
    }

    // Rule: Only active products designated as Pizza Components (BCK10)
    for (const comp of components) {
      if (!comp.isActive) {
        res.status(422).json({
          error: `Business Rule Violation: Product "${comp.name}" is not active.`,
        });
        return;
      }
      if (!comp.isPizzaComponent || !comp.componentType) {
        res.status(422).json({
          error: `Business Rule Violation: Product "${comp.name}" is not designated as a Pizza Component.`,
        });
        return;
      }
    }

    // Rule: Duplicate check in default configuration
    const uniqueIds = new Set(data.componentProductIds);
    if (uniqueIds.size !== data.componentProductIds.length) {
      res.status(422).json({
        error: 'Business Rule Violation: The same Pizza Component cannot occur more than once in the default configuration.',
      });
      return;
    }

    // Rule: Cardinality check per Pizza Component Type
    const allTypes = await prisma.pizzaComponentType.findMany();
    for (const type of allTypes) {
      const count = components.filter(c => c.componentTypeId === type.id).length;
      if (count < type.minQuantity) {
        res.status(422).json({
          error: `Business Rule Violation: Component Type "${type.name}" requires at least ${type.minQuantity} component(s), but ${count} were provided.`,
        });
        return;
      }
      if (type.maxQuantity !== null && count > type.maxQuantity) {
        res.status(422).json({
          error: `Business Rule Violation: Component Type "${type.name}" allows at most ${type.maxQuantity} component(s), but ${count} were provided.`,
        });
        return;
      }
    }

    // Calculate union of allergens
    const allergenIds = Array.from(
      new Set(components.flatMap(c => c.allergens.map(a => a.id)))
    );

    // 3. Create the sellable Product for this predefined pizza
    const product = await prisma.product.create({
      data: {
        name: data.name,
        description: data.description,
        categoryId: data.categoryId,
        isSellable: true,
        isStockControlled: false,
        isPizzaComponent: false,
        basePrice: data.basePrice,
        allergens: { connect: allergenIds.map(id => ({ id })) },
      },
    });

    // 4. Create default PizzaConfiguration
    const pizzaConfig = await prisma.pizzaConfiguration.create({
      data: {
        pizzaSizeId: pizzaSize.id,
        components: {
          create: data.componentProductIds.map(prodId => ({
            productId: prodId,
            quantity: 1,
          })),
        },
      },
    });

    // 5. Create PredefinedPizza link
    const predefinedPizza = await prisma.predefinedPizza.create({
      data: {
        productId: product.id,
        defaultConfigId: pizzaConfig.id,
      },
      include: {
        product: true,
        defaultConfiguration: {
          include: {
            pizzaSize: true,
            components: { include: { product: true } },
          },
        },
      },
    });

    res.status(201).json(predefinedPizza);
  } catch (err) {
    next(err);
  }
});

export default router;
