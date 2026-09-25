import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../infrastructure/db/prisma';
import { authenticate, authorize } from '../middlewares/authMiddleware';

const router = Router();

const configSchema = z.object({
  productId: z.string().min(1),
  pizzaSizeId: z.string().min(1),
  price: z.number().min(0),
  stockUnitsConsumed: z.number().int().min(0).default(1),
});

// GET /api/component-size-configs
router.get('/', async (req, res, next) => {
  try {
    const { productId, pizzaSizeId } = req.query;
    const configs = await prisma.componentSizeConfiguration.findMany({
      where: {
        productId: typeof productId === 'string' ? productId : undefined,
        pizzaSizeId: typeof pizzaSizeId === 'string' ? pizzaSizeId : undefined,
      },
      include: {
        product: true,
        pizzaSize: true,
      },
    });
    res.json(configs);
  } catch (err) {
    next(err);
  }
});

// POST /api/component-size-configs (BCK08)
router.post('/', authenticate, authorize(['MANAGER']), async (req, res, next) => {
  try {
    const data = configSchema.parse(req.body);

    // Business invariant check: Only products designated as Pizza Components may have Component Size Configurations (BCK08)
    const product = await prisma.product.findUnique({
      where: { id: data.productId },
    });

    if (!product) {
      res.status(404).json({ error: 'Product not found.' });
      return;
    }

    if (!product.isPizzaComponent) {
      res.status(422).json({
        error: 'Business Rule Violation: Only products designated as Pizza Components may have Component Size Configurations.',
      });
      return;
    }

    const pizzaSize = await prisma.pizzaSize.findUnique({
      where: { id: data.pizzaSizeId },
    });

    if (!pizzaSize) {
      res.status(404).json({ error: 'Pizza Size not found.' });
      return;
    }

    // Check if configuration already exists for this size
    const existing = await prisma.componentSizeConfiguration.findUnique({
      where: {
        productId_pizzaSizeId: {
          productId: data.productId,
          pizzaSizeId: data.pizzaSizeId,
        },
      },
    });

    if (existing) {
      res.status(409).json({
        error: 'Conflict: A configuration for this component and pizza size already exists.',
      });
      return;
    }

    const config = await prisma.componentSizeConfiguration.create({
      data,
      include: {
        product: true,
        pizzaSize: true,
      },
    });

    res.status(201).json(config);
  } catch (err) {
    next(err);
  }
});

// PUT /api/component-size-configs/:id
router.put('/:id', authenticate, authorize(['MANAGER']), async (req, res, next) => {
  try {
    const data = z.object({
      price: z.number().min(0),
      stockUnitsConsumed: z.number().int().min(0),
    }).parse(req.body);

    const config = await prisma.componentSizeConfiguration.update({
      where: { id: req.params.id },
      data,
      include: {
        product: true,
        pizzaSize: true,
      },
    });

    res.json(config);
  } catch (err) {
    next(err);
  }
});

export default router;
