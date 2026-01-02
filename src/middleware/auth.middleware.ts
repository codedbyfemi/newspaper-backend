import { Request, Response, NextFunction } from 'express';
import { JwtUtil } from '../utils/jwt.util';
import { ResponseUtil } from '../utils/response.util';

/**
 * Middleware to protect admin routes
 * Verifies JWT token and adds adminId to request
 */
export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return ResponseUtil.error(res, 'Authorization token required', 401);
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const payload = JwtUtil.verify(token);

    // Add adminId to request object
    (req as any).adminId = payload.adminId;
    (req as any).adminEmail = payload.email;

    next();
  } catch (error) {
    return ResponseUtil.error(res, 'Invalid or expired token', 401);
  }
};