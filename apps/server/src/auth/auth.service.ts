import { prisma } from "../db/prisma.js";
import {
  hashPassword,
  verifyPassword,
  generateResetToken,
  hashResetToken,
} from "./crypto.js";
import { OtpService, normalizePhoneNumber } from "./otp.service.js";
import { SessionService } from "./session.service.js";
import type {
  RegisterInput,
  LoginInput,
  OtpRequestInput,
  OtpVerifyInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  UpdateProfileInput,
  ChangePasswordInput,
} from "./auth.validation.js";

const RESET_TOKEN_EXPIRY_MS = 60 * 60 * 1000; // 1 hour

export interface AuthSuccessResult {
  success: true;
  user: {
    id: string;
    email: string | null;
    phone: string | null;
    name: string | null;
    avatarUrl: string | null;
    emailVerifiedAt: Date | null;
    phoneVerifiedAt: Date | null;
    createdAt: Date;
  };
  token: string;
}

export interface AuthFailureResult {
  success: false;
  message: string;
}

export class AuthService {
  private otpService = new OtpService();
  private sessionService = new SessionService();

  /**
   * Registers a new user with Email + Password.
   */
  async register(
    input: RegisterInput,
    clientInfo: { userAgent?: string; ipAddress?: string }
  ): Promise<AuthSuccessResult | AuthFailureResult> {
    const email = input.email.trim().toLowerCase();

    // Check if email is already registered
    const existingByEmail = await prisma.user.findUnique({
      where: { email },
    });

    if (existingByEmail) {
      return {
        success: false,
        message: "An account with this email address already exists.",
      };
    }

    let phone: string | null = null;
    if (input.phone) {
      phone = normalizePhoneNumber(input.phone);
      const existingByPhone = await prisma.user.findUnique({
        where: { phone },
      });
      if (existingByPhone) {
        return {
          success: false,
          message: "An account with this phone number already exists.",
        };
      }
    }

    const passwordHash = await hashPassword(input.password);

    const user = await prisma.user.create({
      data: {
        email,
        phone,
        name: input.name?.trim() || null,
        passwordHash,
        lastLoginAt: new Date(),
      },
    });

    const { token } = await this.sessionService.createSession(
      user.id,
      clientInfo.userAgent,
      clientInfo.ipAddress
    );

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        name: user.name,
        avatarUrl: user.avatarUrl,
        emailVerifiedAt: user.emailVerifiedAt,
        phoneVerifiedAt: user.phoneVerifiedAt,
        createdAt: user.createdAt,
      },
      token,
    };
  }

  /**
   * Authenticates user using Email + Password.
   */
  async login(
    input: LoginInput,
    clientInfo: { userAgent?: string; ipAddress?: string }
  ): Promise<AuthSuccessResult | AuthFailureResult> {
    const email = input.email.trim().toLowerCase();

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.passwordHash) {
      return {
        success: false,
        message: "Invalid email or password.",
      };
    }

    const isValid = await verifyPassword(input.password, user.passwordHash);

    if (!isValid) {
      return {
        success: false,
        message: "Invalid email or password.",
      };
    }

    // Update lastLoginAt
    await prisma.user
      .update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      })
      .catch(() => {});

    const { token } = await this.sessionService.createSession(
      user.id,
      clientInfo.userAgent,
      clientInfo.ipAddress
    );

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        name: user.name,
        avatarUrl: user.avatarUrl,
        emailVerifiedAt: user.emailVerifiedAt,
        phoneVerifiedAt: user.phoneVerifiedAt,
        createdAt: user.createdAt,
      },
      token,
    };
  }

  /**
   * Requests an OTP code for phone login/verification.
   */
  async requestOtp(input: OtpRequestInput) {
    return this.otpService.requestPhoneOtp(input.phone, input.purpose);
  }

  /**
   * Verifies an OTP code and logs in or creates the user.
   */
  async verifyOtp(
    input: OtpVerifyInput,
    clientInfo: { userAgent?: string; ipAddress?: string }
  ): Promise<AuthSuccessResult | AuthFailureResult> {
    const verifyResult = await this.otpService.verifyPhoneOtp(
      input.phone,
      input.code,
      input.purpose
    );

    if (!verifyResult.success) {
      return {
        success: false,
        message: verifyResult.message,
      };
    }

    const phone = verifyResult.phone;

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { phone },
    });

    const now = new Date();

    if (!user) {
      user = await prisma.user.create({
        data: {
          phone,
          phoneVerifiedAt: now,
          name: input.name?.trim() || null,
          lastLoginAt: now,
        },
      });
    } else {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          phoneVerifiedAt: now,
          lastLoginAt: now,
          ...(input.name && !user.name ? { name: input.name.trim() } : {}),
        },
      });
    }

    const { token } = await this.sessionService.createSession(
      user.id,
      clientInfo.userAgent,
      clientInfo.ipAddress
    );

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        name: user.name,
        avatarUrl: user.avatarUrl,
        emailVerifiedAt: user.emailVerifiedAt,
        phoneVerifiedAt: user.phoneVerifiedAt,
        createdAt: user.createdAt,
      },
      token,
    };
  }

  /**
   * Initiates forgot-password flow with secure enumeration-resistant response.
   */
  async forgotPassword(input: ForgotPasswordInput) {
    const email = input.email.trim().toLowerCase();

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (user) {
      // Invalidate existing reset tokens for this user
      await prisma.passwordResetToken.updateMany({
        where: {
          userId: user.id,
          usedAt: null,
        },
        data: {
          usedAt: new Date(),
        },
      });

      const resetToken = generateResetToken();
      const tokenHash = hashResetToken(resetToken);
      const expiresAt = new Date(Date.now() + RESET_TOKEN_EXPIRY_MS);

      await prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          tokenHash,
          expiresAt,
        },
      });

      console.log(`\n========================================`);
      console.log(`[DEV PASSWORD RESET] User Email: ${email}`);
      console.log(`[DEV PASSWORD RESET] Reset Token: ${resetToken}`);
      console.log(`[DEV PASSWORD RESET] Reset Link: http://localhost:3000/reset-password?token=${resetToken}`);
      console.log(`========================================\n`);
    }

    return {
      success: true,
      message:
        "If an account exists with this email address, password reset instructions have been prepared.",
    };
  }

  /**
   * Completes password reset using a verified reset token.
   */
  async resetPassword(input: ResetPasswordInput) {
    const tokenHash = hashResetToken(input.token.trim());

    const record = await prisma.passwordResetToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!record || record.usedAt !== null || new Date() > record.expiresAt) {
      return {
        success: false,
        message: "Password reset link is invalid or has expired. Please request a new one.",
      };
    }

    const passwordHash = await hashPassword(input.newPassword);

    // Update password and mark token as used
    await prisma.$transaction([
      prisma.user.update({
        where: { id: record.userId },
        data: { passwordHash },
      }),
      prisma.passwordResetToken.update({
        where: { id: record.id },
        data: { usedAt: new Date() },
      }),
      // Revoke all existing sessions for security
      prisma.authSession.updateMany({
        where: {
          userId: record.userId,
          revokedAt: null,
        },
        data: {
          revokedAt: new Date(),
        },
      }),
    ]);

    return {
      success: true,
      message: "Password reset successfully. You may now log in with your new password.",
    };
  }

  /**
   * Updates user profile fields.
   */
  async updateProfile(userId: string, input: UpdateProfileInput) {
    const data: { name?: string | null; avatarUrl?: string | null } = {};
    if (input.name !== undefined) data.name = input.name.trim() || null;
    if (input.avatarUrl !== undefined) data.avatarUrl = input.avatarUrl.trim() || null;

    const user = await prisma.user.update({
      where: { id: userId },
      data,
    });

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        name: user.name,
        avatarUrl: user.avatarUrl,
        emailVerifiedAt: user.emailVerifiedAt,
        phoneVerifiedAt: user.phoneVerifiedAt,
        createdAt: user.createdAt,
      },
    };
  }

  /**
   * Changes password for an authenticated user after verifying current password.
   */
  async changePassword(userId: string, input: ChangePasswordInput) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return {
        success: false,
        message: "User not found.",
      };
    }

    if (user.passwordHash) {
      const isCurrentValid = await verifyPassword(
        input.currentPassword,
        user.passwordHash
      );
      if (!isCurrentValid) {
        return {
          success: false,
          message: "Current password is incorrect.",
        };
      }
    }

    const newPasswordHash = await hashPassword(input.newPassword);

    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newPasswordHash },
    });

    return {
      success: true,
      message: "Password changed successfully.",
    };
  }

  /**
   * Retrieves clean profile info for a user.
   */
  async getUserProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) return null;

    return {
      id: user.id,
      email: user.email,
      phone: user.phone,
      name: user.name,
      avatarUrl: user.avatarUrl,
      emailVerifiedAt: user.emailVerifiedAt,
      phoneVerifiedAt: user.phoneVerifiedAt,
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt,
    };
  }
}
