/**
 * Generate a 6-digit OTP
 */
export class OtpUtil {
  static generate(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Calculate OTP expiration time
   */
  static getExpiryTime(minutes: number): Date {
    return new Date(Date.now() + minutes * 60 * 1000);
  }

  /**
   * Check if OTP is expired
   */
  static isExpired(expiresAt: Date): boolean {
    return new Date() > expiresAt;
  }
}