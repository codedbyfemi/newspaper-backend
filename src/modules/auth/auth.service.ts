import prisma from '../../config/database';
import { PasswordUtil } from '../../utils/password.util';
import { JwtUtil } from '../../utils/jwt.util';
import { AuthResponse, SetupPasswordRequest, LoginRequest } from './auth.types';

export class AuthService {
  /**
   * First-time password setup for allowlisted admin
   */
  async setupPassword(data: SetupPasswordRequest): Promise<AuthResponse> {
    const { email, password } = data;

    // Validate password strength
    const validation = PasswordUtil.validate(password);
    if (!validation.valid) {
      throw new Error(validation.message);
    }

    // Check if email is in allowlist
    const admin = await prisma.admin.findUnique({
      where: { email },
    });

    if (!admin) {
      throw new Error('Email not allowlisted');
    }

    // Check if password already set
    if (admin.passwordHash) {
      throw new Error('Account already activated. Please use login instead.');
    }

    // Hash password and update admin
    const passwordHash = await PasswordUtil.hash(password);
    const updatedAdmin = await prisma.admin.update({
      where: { email },
      data: { passwordHash },
    });

    // Generate JWT
    const token = JwtUtil.generate({
      adminId: updatedAdmin.id,
      email: updatedAdmin.email,
    });

    return {
      token,
      admin: {
        id: updatedAdmin.id,
        email: updatedAdmin.email,
        name: updatedAdmin.name,
      },
    };
  }

  /**
   * Standard login with email and password
   */
  async login(data: LoginRequest): Promise<AuthResponse> {
    const { email, password } = data;

    // Find admin by email
    const admin = await prisma.admin.findUnique({
      where: { email },
    });

    if (!admin) {
      throw new Error('Invalid credentials');
    }

    // Check if account is activated (password set)
    if (!admin.passwordHash) {
      throw new Error('Account not activated. Please set your password first.');
    }

    // Verify password
    const isPasswordValid = await PasswordUtil.compare(password, admin.passwordHash);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    // Generate JWT
    const token = JwtUtil.generate({
      adminId: admin.id,
      email: admin.email,
    });

    return {
      token,
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
      },
    };
  }

  /**
   * Get admin profile by ID
   */
  async getProfile(adminId: string) {
    const admin = await prisma.admin.findUnique({
      where: { id: adminId },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    if (!admin) {
      throw new Error('Admin not found');
    }

    return admin;
  }
}