import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'laprizza_fallback_secret_key_2026';

export interface UserTokenPayload {
  userId: string;
  email: string;
  role: string;
}

export class TokenService {
  public static generateToken(payload: UserTokenPayload, expiresIn: any = '24h'): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn });
  }

  public static verifyToken(token: string): UserTokenPayload {
    return jwt.verify(token, JWT_SECRET) as UserTokenPayload;
  }
}
