import { Request, Response, NextFunction } from 'express';
import { TokenService, UserTokenPayload } from '../../infrastructure/auth/tokenService';

export interface AuthenticatedRequest extends Request {
  user?: UserTokenPayload;
}

export function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized: Missing or invalid token format.' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = TokenService.verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Unauthorized: Invalid or expired token.' });
  }
}

export function authorize(roles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized: Authentication required.' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        error: `Forbidden: User role "${req.user.role}" does not have permission to access this resource.`,
      });
      return;
    }

    next();
  };
}
