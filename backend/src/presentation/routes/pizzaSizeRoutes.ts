import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../infrastructure/db/prisma';
import { authenticate, authorize } from '../middlewares/authMiddleware';

const router = Router();

const sizeSchema = z.object({
  name: z.string().min(2),
  diameterCm: z.number().int().positive().optional(),
  isActive: z.boolean().default(true),
});

// GET /api/pizza-sizes - Searchable (BCK06)
router.get('/', async (req, res, next) => {
  try {
    const { query } = req.query;
    const sizes = await prisma.pizzaSize.findMany({
      where: typeof query === 'string' && query.trim() !== ''
        ? { name: { contains: query } }
        : undefined,
      orderBy: { diameterCm: 'asc' },
    });
    res.json(sizes);
  } catch (err) {
    next(err);
  }
});

// POST /api/pizza-sizes
router.post('/', authenticate, authorize(['MANAGER']), async (req, res, next) => {
  try {
    const data = sizeSchema.parse(req.body);
    const size = await prisma.pizzaSize.create({
      data,
    });
    res.status(201).json(size);
  } catch (err) {
    next(err);
  }
});

// PUT /api/pizza-sizes/:id
router.put('/:id', authenticate, authorize(['MANAGER']), async (req, res, next) => {
  try {
    const data = sizeSchema.partial().parse(req.body);
    const size = await prisma.pizzaSize.update({
      where: { id: req.params.id },
      data,
    });
    res.json(size);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/pizza-sizes/:id - Cannot delete if referenced by existing business information (BCK06)
router.delete('/:id', authenticate, authorize(['MANAGER']), async (req, res, next) => {
  try {
    const configsCount = await prisma.componentSizeConfiguration.count({
      where: { pizzaSizeId: req.params.id },
    });
    const pizzaConfigsCount = await prisma.pizzaConfiguration.count({
      where: { pizzaSizeId: req.params.id },
    });

    if (configsCount > 0 || pizzaConfigsCount > 0) {
      res.status(409).json({
        error: 'Conflict: Cannot delete pizza size that is referenced by component configurations or pizzas.',
      });
      return;
    }

    await prisma.pizzaSize.delete({
      where: { id: req.params.id },
    });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;
