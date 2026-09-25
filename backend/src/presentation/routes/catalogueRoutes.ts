import { Router } from 'express';
import { prisma } from '../../infrastructure/db/prisma';

const router = Router();

// GET /api/catalogue - Customer facing product catalogue (BCK11)
router.get('/', async (req, res, next) => {
  try {
    const { categoryId } = req.query;

    const sellableProducts = await prisma.product.findMany({
      where: {
        isSellable: true,
        isActive: true,
        categoryId: typeof categoryId === 'string' ? categoryId : undefined,
      },
      include: {
        category: true,
        allergens: true,
        predefinedPizza: {
          include: {
            defaultConfiguration: {
              include: {
                pizzaSize: true,
                components: {
                  include: {
                    product: {
                      include: {
                        componentType: true,
                        allergens: true,
                        sizeConfigs: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    const allSizes = await prisma.pizzaSize.findMany({ where: { isActive: true } });

    const catalogue = sellableProducts.map(p => {
      if (p.predefinedPizza) {
        const components = p.predefinedPizza.defaultConfiguration.components.map(c => c.product);
        
        // Available sizes where all components have size configs (BCK10 / BCK11)
        const availableSizes = allSizes.filter(size => {
          return components.every(comp =>
            comp.sizeConfigs.some(cfg => cfg.pizzaSizeId === size.id)
          );
        });

        // Union of allergens
        const allergenMap = new Map<string, any>();
        for (const comp of components) {
          for (const allg of comp.allergens) {
            allergenMap.set(allg.id, allg);
          }
        }

        return {
          id: p.id,
          name: p.name,
          description: p.description,
          category: p.category.name,
          basePrice: p.basePrice,
          isPizza: true,
          allergens: Array.from(allergenMap.values()),
          defaultSize: p.predefinedPizza.defaultConfiguration.pizzaSize.name,
          defaultComponents: p.predefinedPizza.defaultConfiguration.components.map(c => ({
            name: c.product.name,
            type: c.product.componentType?.name,
          })),
          availableSizes: availableSizes.map(s => ({
            id: s.id,
            name: s.name,
            diameterCm: s.diameterCm,
          })),
        };
      }

      // Non-pizza sellable products (e.g. beverages)
      return {
        id: p.id,
        name: p.name,
        description: p.description,
        category: p.category.name,
        basePrice: p.basePrice,
        isPizza: false,
        allergens: p.allergens,
      };
    });

    res.json(catalogue);
  } catch (err) {
    next(err);
  }
});

// GET /api/catalogue/:id - Details of a single sellable product (BCK11)
router.get('/:id', async (req, res, next) => {
  try {
    const product = await prisma.product.findFirst({
      where: { id: req.params.id, isSellable: true, isActive: true },
      include: {
        category: true,
        allergens: true,
        predefinedPizza: {
          include: {
            defaultConfiguration: {
              include: {
                pizzaSize: true,
                components: {
                  include: {
                    product: {
                      include: {
                        componentType: true,
                        allergens: true,
                        sizeConfigs: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!product) {
      res.status(404).json({ error: 'Product not found in catalogue.' });
      return;
    }

    if (product.predefinedPizza) {
      const allSizes = await prisma.pizzaSize.findMany({ where: { isActive: true } });
      const components = product.predefinedPizza.defaultConfiguration.components.map(c => c.product);

      const availableSizes = allSizes.filter(size => {
        return components.every(comp =>
          comp.sizeConfigs.some(cfg => cfg.pizzaSizeId === size.id)
        );
      });

      const allergenMap = new Map<string, any>();
      for (const comp of components) {
        for (const allg of comp.allergens) {
          allergenMap.set(allg.id, allg);
        }
      }

      res.json({
        id: product.id,
        name: product.name,
        description: product.description,
        category: product.category.name,
        basePrice: product.basePrice,
        isPizza: true,
        allergens: Array.from(allergenMap.values()),
        defaultSize: product.predefinedPizza.defaultConfiguration.pizzaSize.name,
        defaultComponents: product.predefinedPizza.defaultConfiguration.components.map(c => ({
          name: c.product.name,
          type: c.product.componentType?.name,
        })),
        availableSizes: availableSizes.map(s => ({
          id: s.id,
          name: s.name,
          diameterCm: s.diameterCm,
        })),
      });
      return;
    }

    res.json({
      id: product.id,
      name: product.name,
      description: product.description,
      category: product.category.name,
      basePrice: product.basePrice,
      isPizza: false,
      allergens: product.allergens,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
