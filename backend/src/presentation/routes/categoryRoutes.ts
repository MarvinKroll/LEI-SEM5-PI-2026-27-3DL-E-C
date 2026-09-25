import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../infrastructure/db/prisma';
import { authenticate, authorize } from '../middlewares/authMiddleware';

const router = Router();

const categorySchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
});

// GET /api/categories - Searchable (BCK03)
router.get('/', async (req, res, next) => {
  try {
    const { query } = req.query;
    const categories = await prisma.productCategory.findMany({
      where: typeof query === 'string' && query.trim() !== ''
        ? {
            OR: [
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
    res.json(categories);
  } catch (err) {
    next(err);
  }
});

// POST /api/categories
router.post('/', authenticate, authorize(['MANAGER']), async (req, res, next) => {
  try {
    const { name, description } = categorySchema.parse(req.body);
    const category = await prisma.productCategory.create({
      data: { name, description },
    });
    res.status(201).json(category);
  } catch (err) {
    next(err);
  }
});

// PUT /api/categories/:id
router.put('/:id', authenticate, authorize(['MANAGER']), async (req, res, next) => {
  try {
    const { name, description } = categorySchema.parse(req.body);
    const category = await prisma.productCategory.update({
      where: { id: req.params.id },
      data: { name, description },
    });
    res.json(category);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/categories/:id - Cannot delete if referenced by existing products (BCK03)
router.delete('/:id', authenticate, authorize(['MANAGER']), async (req, res, next) => {
  try {
    const productCount = await prisma.product.count({
      where: { categoryId: req.params.id },
    });

    if (productCount > 0) {
      res.status(409).json({
        error: 'Conflict: Cannot delete product category that is referenced by existing products.',
      });
      return;
    }

    await prisma.productCategory.delete({
      where: { id: req.params.id },
    });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;
