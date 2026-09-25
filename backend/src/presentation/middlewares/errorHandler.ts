import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { BusinessRuleViolationError, EntityNotFoundError } from '../../domain/errors/DomainError';

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Zod Validation Error (ARC03: input validation)
  if (err instanceof ZodError) {
    res.status(400).json({
      error: 'Validation Error',
      details: err.errors.map(e => ({ field: e.path.join('.'), message: e.message })),
    });
    return;
  }

  // Domain Entity Not Found (404)
  if (err instanceof EntityNotFoundError) {
    res.status(404).json({
      error: 'Not Found',
      message: err.message,
    });
    return;
  }

  // Domain Business Invariant Violation (400 / 422)
  if (err instanceof BusinessRuleViolationError) {
    res.status(422).json({
      error: 'Business Rule Violation',
      message: err.message,
    });
    return;
  }

  // Generic or Database Constraint Error (409 Conflict)
  if (err.code === 'P2002') {
    res.status(409).json({
      error: 'Conflict',
      message: `A record with this unique field already exists.`,
    });
    return;
  }

  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'An unexpected error occurred.',
  });
}
