import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 12;

export class PasswordUtil {
  /**
   * Hash a plain text password
   */
  static async hash(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
  }

  /**
   * Compare plain text password with hashed password
   */
  static async compare(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  /**
   * Validate password strength (optional)
   * Minimum 8 characters, at least 1 uppercase, 1 lowercase, 1 number
   */
  static validate(password: string): { valid: boolean; message?: string } {
    if (password.length < 8) {
      return { valid: false, message: 'Password must be at least 8 characters long' };
    }

    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);

    if (!hasUppercase) {
      return { valid: false, message: 'Password must contain at least one uppercase letter' };
    }

    if (!hasLowercase) {
      return { valid: false, message: 'Password must contain at least one lowercase letter' };
    }

    if (!hasNumber) {
      return { valid: false, message: 'Password must contain at least one number' };
    }

    return { valid: true };
  }
}