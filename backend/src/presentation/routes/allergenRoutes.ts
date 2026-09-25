import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../infrastructure/db/prisma';
import { authenticate, authorize } from '../middlewares/authMiddleware';

const router = Router();

const allergenSchema = z.object({
  code: z.string().min(2),
  name: z.string().min(2),
  description: z.string().optional(),
});

// GET /api/allergens - Searchable (BCK04)
router.get('/', async (req, res, next) => {
  try {
    const { query } = req.query;
    const allergens = await prisma.allergen.findMany({
      where: typeof query === 'string' && query.trim() !== ''
        ? {
            OR: [
              { code: { contains: query } },
              { name: { contains: query } },
              { description: { contains: query } },
            ],
          }
        : undefined,
      include: {
        _count: { select: { products: true } },
      },
      orderBy: { name: 'asc' },
    });
    res.json(allergens);
  } catch (err) {
    next(err);
  }
});

// POST /api/allergens
router.post('/', authenticate, authorize(['MANAGER']), async (req, res, next) => {
  try {
    const data = allergenSchema.parse(req.body);
    const allergen = await prisma.allergen.create({
      data: {
        code: data.code.toUpperCase(),
        name: data.name,
        description: data.description,
      },
    });
    res.status(201).json(allergen);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/allergens/:id - Cannot delete if referenced by existing products (BCK04)
router.delete('/:id', authenticate, authorize(['MANAGER']), async (req, res, next) => {
  try {
    const productCount = await prisma.product.count({
      where: { allergens: { some: { id: req.params.id } } },
    });

    if (productCount > 0) {
      res.status(409).json({
        error: 'Conflict: Cannot delete allergen that is referenced by existing products.',
      });
      return;
    }

    await prisma.allergen.delete({
      where: { id: req.params.id },
    });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;
