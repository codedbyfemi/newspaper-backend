import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';

export interface JwtPayload {
  adminId: string;
  email: string;
}

export class JwtUtil {
  /**
   * Generate JWT token
   */
  static generate(payload: JwtPayload): string {
    const TOKEN: string = jwt.sign(
        payload, 
        env.JWT_SECRET, 
        { expiresIn: env.JWT_EXPIRES_IN } as SignOptions
    );
    return TOKEN
  }

  /**
   * Verify JWT token
   */
  static verify(token: string): JwtPayload {
    try {
      return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }
}