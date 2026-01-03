import nodemailer from 'nodemailer';
import { env } from '../config/env';

export class EmailUtil {
  private static transporter = nodemailer.createTransport({
    host: env.EMAIL_HOST,
    port: env.EMAIL_PORT,
    secure: env.EMAIL_PORT === 465,
    auth: {
      user: env.EMAIL_USER,
      pass: env.EMAIL_PASSWORD,
    },
  });

  /**
   * Send OTP email for community join request
   */
  static async sendJoinOtp(
    email: string,
    name: string,
    communityName: string,
    otp: string
  ): Promise<void> {
    const mailOptions = {
      from: env.EMAIL_FROM,
      to: email,
      subject: `Join ${communityName} - Verification Code`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome to ${communityName}!</h2>
          <p>Hi ${name},</p>
          <p>You've requested to join <strong>${communityName}</strong>.</p>
          <p>Your verification code is:</p>
          <div style="background: #f4f4f4; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
            ${otp}
          </div>
          <p>This code will expire in ${env.OTP_EXPIRY_MINUTES} minutes.</p>
          <p>If you didn't request this, please ignore this email.</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
          <p style="color: #666; font-size: 12px;">This is an automated message from School Newspaper Community Platform.</p>
        </div>
      `,
    };

    await this.transporter.sendMail(mailOptions);
  }

  /**
   * Send OTP email for community leave request
   */
  static async sendLeaveOtp(
    email: string,
    name: string,
    communityName: string,
    otp: string
  ): Promise<void> {
    const mailOptions = {
      from: env.EMAIL_FROM,
      to: email,
      subject: `Leave ${communityName} - Verification Code`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Leave ${communityName}</h2>
          <p>Hi ${name},</p>
          <p>You've requested to leave <strong>${communityName}</strong>.</p>
          <p>Your verification code is:</p>
          <div style="background: #f4f4f4; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
            ${otp}
          </div>
          <p>This code will expire in ${env.OTP_EXPIRY_MINUTES} minutes.</p>
          <p>If you didn't request this, please ignore this email and your membership will remain active.</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
          <p style="color: #666; font-size: 12px;">This is an automated message from School Newspaper Community Platform.</p>
        </div>
      `,
    };

    await this.transporter.sendMail(mailOptions);
  }

  /**
   * Send notification email when member is removed by admin
   */
  static async sendRemovalNotification(
    email: string,
    name: string,
    communityName: string
  ): Promise<void> {
    const mailOptions = {
      from: env.EMAIL_FROM,
      to: email,
      subject: `Membership Update - ${communityName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>${communityName} Membership Update</h2>
          <p>Hi ${name},</p>
          <p>Your membership in <strong>${communityName}</strong> has been updated by an administrator.</p>
          <p>If you have any questions, please contact the community administrators.</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
          <p style="color: #666; font-size: 12px;">This is an automated message from School Newspaper Community Platform.</p>
        </div>
      `,
    };

    await this.transporter.sendMail(mailOptions);
  }
}