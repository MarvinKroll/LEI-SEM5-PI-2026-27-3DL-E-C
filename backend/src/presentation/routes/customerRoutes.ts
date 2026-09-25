import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../infrastructure/db/prisma';
import { authenticate, authorize } from '../middlewares/authMiddleware';

const router = Router();

const customerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  vatNumber: z.string().optional(),
  address: z.string().optional(),
  dietaryRestrictionIds: z.array(z.string()).optional(),
});

// GET /api/customers - Searchable (BCK02)
router.get('/', authenticate, authorize(['MANAGER', 'STAFF']), async (req, res, next) => {
  try {
    const { query } = req.query;
    const whereClause: any = {};

    if (typeof query === 'string' && query.trim() !== '') {
      whereClause.OR = [
        { name: { contains: query } },
        { email: { contains: query } },
        { phone: { contains: query } },
      ];
    }

    const customers = await prisma.customer.findMany({
      where: whereClause,
      include: { dietaryRestrictions: true },
      orderBy: { name: 'asc' },
    });

    res.json(customers);
  } catch (err) {
    next(err);
  }
});

// GET /api/customers/:id
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const customer = await prisma.customer.findUnique({
      where: { id: req.params.id },
      include: { dietaryRestrictions: true },
    });
    if (!customer) {
      res.status(404).json({ error: 'Customer not found.' });
      return;
    }
    res.json(customer);
  } catch (err) {
    next(err);
  }
});

// POST /api/customers
router.post('/', authenticate, authorize(['MANAGER', 'STAFF']), async (req, res, next) => {
  try {
    const data = customerSchema.parse(req.body);
    const customer = await prisma.customer.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        vatNumber: data.vatNumber,
        address: data.address,
        dietaryRestrictions: data.dietaryRestrictionIds
          ? { connect: data.dietaryRestrictionIds.map(id => ({ id })) }
          : undefined,
      },
      include: { dietaryRestrictions: true },
    });
    res.status(201).json(customer);
  } catch (err) {
    next(err);
  }
});

// PUT /api/customers/:id
router.put('/:id', authenticate, authorize(['MANAGER', 'STAFF']), async (req, res, next) => {
  try {
    const data = customerSchema.partial().parse(req.body);
    const customer = await prisma.customer.update({
      where: { id: req.params.id },
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        vatNumber: data.vatNumber,
        address: data.address,
        dietaryRestrictions: data.dietaryRestrictionIds
          ? { set: data.dietaryRestrictionIds.map(id => ({ id })) }
          : undefined,
      },
      include: { dietaryRestrictions: true },
    });
    res.json(customer);
  } catch (err) {
    next(err);
  }
});

export default router;
