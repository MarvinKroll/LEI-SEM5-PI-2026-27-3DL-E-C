import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../infrastructure/db/prisma';
import { authenticate, authorize } from '../middlewares/authMiddleware';

const router = Router();

const productSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  categoryId: z.string().uuid().or(z.string().min(1)),
  isSellable: z.boolean().default(false),
  isStockControlled: z.boolean().default(false),
  isPizzaComponent: z.boolean().default(false),
  basePrice: z.number().min(0).optional().nullable(),
  componentTypeId: z.string().uuid().or(z.string().min(1)).optional().nullable(),
  allergenIds: z.array(z.string()).optional(),
  initialStockUnits: z.number().int().min(0).optional(),
});

// GET /api/products - Searchable and filterable (BCK05)
router.get('/', async (req, res, next) => {
  try {
    const { query, categoryId, isSellable, isPizzaComponent, isActive } = req.query;

    const where: any = {};

    if (typeof query === 'string' && query.trim() !== '') {
      where.OR = [
        { name: { contains: query } },
        { description: { contains: query } },
      ];
    }

    if (typeof categoryId === 'string') {
      where.categoryId = categoryId;
    }

    if (isSellable !== undefined) {
      where.isSellable = isSellable === 'true';
    }

    if (isPizzaComponent !== undefined) {
      where.isPizzaComponent = isPizzaComponent === 'true';
    }

    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        category: true,
        componentType: true,
        allergens: true,
        stock: true,
        sizeConfigs: { include: { pizzaSize: true } },
      },
      orderBy: { name: 'asc' },
    });

    res.json(products);
  } catch (err) {
    next(err);
  }
});

// GET /api/products/:id
router.get('/:id', async (req, res, next) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: {
        category: true,
        componentType: true,
        allergens: true,
        stock: true,
        sizeConfigs: { include: { pizzaSize: true } },
      },
    });

    if (!product) {
      res.status(404).json({ error: 'Product not found.' });
      return;
    }

    res.json(product);
  } catch (err) {
    next(err);
  }
});

// POST /api/products (BCK05)
router.post('/', authenticate, authorize(['MANAGER']), async (req, res, next) => {
  try {
    const data = productSchema.parse(req.body);

    // Business rule: Pizza Component must have componentTypeId (BCK05)
    if (data.isPizzaComponent && !data.componentTypeId) {
      res.status(400).json({
        error: 'Validation Error: A product designated as a Pizza Component must be associated with a Pizza Component Type.',
      });
      return;
    }

    // Business rule: Non-pizza component cannot have componentTypeId
    if (!data.isPizzaComponent && data.componentTypeId) {
      res.status(400).json({
        error: 'Validation Error: Only products designated as Pizza Components can have a Pizza Component Type.',
      });
      return;
    }

    const product = await prisma.product.create({
      data: {
        name: data.name,
        description: data.description,
        categoryId: data.categoryId,
        isSellable: data.isSellable,
        isStockControlled: data.isStockControlled,
        isPizzaComponent: data.isPizzaComponent,
        basePrice: data.basePrice,
        componentTypeId: data.componentTypeId,
        allergens: data.allergenIds ? { connect: data.allergenIds.map(id => ({ id })) } : undefined,
        stock: data.isStockControlled
          ? { create: { currentStockUnits: data.initialStockUnits || 0 } }
          : undefined,
      },
      include: {
        category: true,
        componentType: true,
        allergens: true,
        stock: true,
      },
    });

    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
});

// PUT /api/products/:id - Update product
router.put('/:id', authenticate, authorize(['MANAGER']), async (req, res, next) => {
  try {
    const data = productSchema.partial().parse(req.body);

    const existing = await prisma.product.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      res.status(404).json({ error: 'Product not found.' });
      return;
    }

    const isPizzaComp = data.isPizzaComponent !== undefined ? data.isPizzaComponent : existing.isPizzaComponent;
    const compTypeId = data.componentTypeId !== undefined ? data.componentTypeId : existing.componentTypeId;

    if (isPizzaComp && !compTypeId) {
      res.status(400).json({
        error: 'Validation Error: A product designated as a Pizza Component must be associated with a Pizza Component Type.',
      });
      return;
    }

    const updated = await prisma.product.update({
      where: { id: req.params.id },
      data: {
        name: data.name,
        description: data.description,
        categoryId: data.categoryId,
        isSellable: data.isSellable,
        isStockControlled: data.isStockControlled,
        isPizzaComponent: data.isPizzaComponent,
        basePrice: data.basePrice,
        componentTypeId: data.componentTypeId,
        allergens: data.allergenIds ? { set: data.allergenIds.map(id => ({ id })) } : undefined,
      },
      include: {
        category: true,
        componentType: true,
        allergens: true,
        stock: true,
      },
    });

    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/products/:id/deactivate (BCK05: distinguishing products no longer actively used)
router.patch('/:id/deactivate', authenticate, authorize(['MANAGER']), async (req, res, next) => {
  try {
    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: { isActive: false },
    });
    res.json(product);
  } catch (err) {
    next(err);
  }
});

export default router;
