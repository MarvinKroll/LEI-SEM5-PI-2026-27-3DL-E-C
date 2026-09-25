import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../infrastructure/db/prisma';
import { authenticate, authorize } from '../middlewares/authMiddleware';

const router = Router();

const componentTypeSchema = z.object({
  name: z.string().min(2),
  assemblyOrder: z.number().int().positive(),
  minQuantity: z.number().int().min(0).default(0),
  maxQuantity: z.number().int().min(0).nullable().optional(),
});

// GET /api/pizza-component-types - Searchable (BCK07)
router.get('/', async (req, res, next) => {
  try {
    const { query } = req.query;
    const types = await prisma.pizzaComponentType.findMany({
      where: typeof query === 'string' && query.trim() !== ''
        ? { name: { contains: query } }
        : undefined,
      include: {
        _count: { select: { products: true } },
      },
      orderBy: { assemblyOrder: 'asc' },
    });
    res.json(types);
  } catch (err) {
    next(err);
  }
});

// POST /api/pizza-component-types
router.post('/', authenticate, authorize(['MANAGER']), async (req, res, next) => {
  try {
    const data = componentTypeSchema.parse(req.body);

    // Business invariant check: unique assembly order (BCK07)
    const existingOrder = await prisma.pizzaComponentType.findUnique({
      where: { assemblyOrder: data.assemblyOrder },
    });
    if (existingOrder) {
      res.status(400).json({
        error: `Assembly order ${data.assemblyOrder} is already in use by "${existingOrder.name}". Assembly orders must be unique.`,
      });
      return;
    }

    if (data.maxQuantity !== null && data.maxQuantity !== undefined && data.maxQuantity < data.minQuantity) {
      res.status(400).json({
        error: 'Max quantity cannot be less than min quantity.',
      });
      return;
    }

    const type = await prisma.pizzaComponentType.create({ data });
    res.status(201).json(type);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/pizza-component-types/:id - Cannot delete if referenced by existing business information (BCK07)
router.delete('/:id', authenticate, authorize(['MANAGER']), async (req, res, next) => {
  try {
    const productCount = await prisma.product.count({
      where: { componentTypeId: req.params.id },
    });

    if (productCount > 0) {
      res.status(409).json({
        error: 'Conflict: Cannot delete component type that is referenced by existing products.',
      });
      return;
    }

    await prisma.pizzaComponentType.delete({
      where: { id: req.params.id },
    });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;
