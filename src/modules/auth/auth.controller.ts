import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { ResponseUtil } from '../../utils/response.util';
import { SetupPasswordRequest, LoginRequest } from './auth.types';

const authService = new AuthService();

export class AuthController {
  /**
   * POST /admin/auth/setup
   * First-time password setup
   */
  async setupPassword(req: Request, res: Response) {
    try {
      const { email, password } = req.body as SetupPasswordRequest;

      if (!email || !password) {
        return ResponseUtil.error(res, 'Email and password are required', 400);
      }

      const result = await authService.setupPassword({ email, password });
      return ResponseUtil.success(res, result, 201);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Setup failed';
      
      if (message === 'Email not allowlisted') {
        return ResponseUtil.error(res, message, 403);
      }
      
      if (message.includes('Account already activated')) {
        return ResponseUtil.error(res, message, 400);
      }

      return ResponseUtil.error(res, message, 400);
    }
  }

  /**
   * POST /admin/auth/login
   * Standard login
   */
  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body as LoginRequest;

      if (!email || !password) {
        return ResponseUtil.error(res, 'Email and password are required', 400);
      }

      const result = await authService.login({ email, password });
      return ResponseUtil.success(res, result, 200);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';

      if (message.includes('Account not activated')) {
        return ResponseUtil.error(res, message, 403);
      }

      return ResponseUtil.error(res, 'Invalid credentials', 401);
    }
  }

  /**
   * GET /admin/auth/me
   * Get current admin profile
   */
  async getMe(req: Request, res: Response) {
    try {
      // adminId is added by auth middleware
      const adminId = (req as any).adminId;
      const admin = await authService.getProfile(adminId);
      return ResponseUtil.success(res, { admin }, 200);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to get profile';
      return ResponseUtil.error(res, message, 400);
    }
  }

  /**
   * POST /admin/auth/logout
   * Logout (client-side token deletion)
   */
  async logout(req: Request, res: Response) {
    // With JWT, logout is handled client-side by deleting the token
    return ResponseUtil.success(res, { message: 'Logged out successfully' }, 200);
  }
}