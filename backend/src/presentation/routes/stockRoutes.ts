import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../infrastructure/db/prisma';
import { authenticate, authorize } from '../middlewares/authMiddleware';

const router = Router();

const adjustStockSchema = z.object({
  units: z.number().int().positive('Units must be a positive integer.'),
  reason: z.string().optional(),
});

// GET /api/stock - Searchable by product name/description (BCK09)
router.get('/', authenticate, authorize(['MANAGER', 'STAFF']), async (req, res, next) => {
  try {
    const { query } = req.query;
    const stockList = await prisma.stockInformation.findMany({
      where: typeof query === 'string' && query.trim() !== ''
        ? {
            product: {
              OR: [
                { name: { contains: query } },
                { description: { contains: query } },
              ],
            },
          }
        : undefined,
      include: {
        product: {
          include: { category: true, componentType: true },
        },
      },
      orderBy: { product: { name: 'asc' } },
    });
    res.json(stockList);
  } catch (err) {
    next(err);
  }
});

// GET /api/stock/:productId - Consult single product stock
router.get('/:productId', authenticate, authorize(['MANAGER', 'STAFF']), async (req, res, next) => {
  try {
    const stock = await prisma.stockInformation.findUnique({
      where: { productId: req.params.productId },
      include: {
        product: true,
      },
    });

    if (!stock) {
      res.status(404).json({ error: 'Stock information for product not found.' });
      return;
    }

    res.json(stock);
  } catch (err) {
    next(err);
  }
});

// POST /api/stock/:productId/increase (BCK09)
router.post('/:productId/increase', authenticate, authorize(['MANAGER', 'STAFF']), async (req, res, next) => {
  try {
    const { units } = adjustStockSchema.parse(req.body);

    const product = await prisma.product.findUnique({
      where: { id: req.params.productId },
      include: { stock: true },
    });

    if (!product) {
      res.status(404).json({ error: 'Product not found.' });
      return;
    }

    if (!product.isStockControlled) {
      res.status(422).json({
        error: 'Business Rule Violation: Product is not designated as subject to stock control.',
      });
      return;
    }

    const updated = await prisma.stockInformation.upsert({
      where: { productId: product.id },
      update: { currentStockUnits: { increment: units } },
      create: { productId: product.id, currentStockUnits: units },
      include: { product: true },
    });

    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// POST /api/stock/:productId/decrease (BCK09)
router.post('/:productId/decrease', authenticate, authorize(['MANAGER', 'STAFF']), async (req, res, next) => {
  try {
    const { units } = adjustStockSchema.parse(req.body);

    const product = await prisma.product.findUnique({
      where: { id: req.params.productId },
      include: { stock: true },
    });

    if (!product) {
      res.status(404).json({ error: 'Product not found.' });
      return;
    }

    if (!product.isStockControlled || !product.stock) {
      res.status(422).json({
        error: 'Business Rule Violation: Product is not subject to stock control or has no stock record.',
      });
      return;
    }

    // Invariant: reduction must not result in negative stock quantity (BCK09)
    if (product.stock.currentStockUnits < units) {
      res.status(422).json({
        error: `Business Rule Violation: Insufficient stock. Current stock is ${product.stock.currentStockUnits} units, cannot decrease by ${units} units.`,
      });
      return;
    }

    const updated = await prisma.stockInformation.update({
      where: { productId: product.id },
      data: { currentStockUnits: { decrement: units } },
      include: { product: true },
    });

    res.json(updated);
  } catch (err) {
    next(err);
  }
});

export default router;
