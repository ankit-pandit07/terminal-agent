import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().trim().toLowerCase().email("Invalid email address format."),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long.")
    .max(100, "Password must not exceed 100 characters."),
  name: z.string().trim().min(1).max(100).optional(),
  phone: z.string().trim().min(5).optional(),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Invalid email address format."),
  password: z.string().min(1, "Password is required."),
});

export const otpRequestSchema = z.object({
  phone: z.string().trim().min(5, "Valid phone number is required."),
  purpose: z.enum(["LOGIN", "SIGNUP", "PHONE_CHANGE"]).optional(),
});

export const otpVerifySchema = z.object({
  phone: z.string().trim().min(5, "Valid phone number is required."),
  code: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "OTP must be a 6-digit number."),
  name: z.string().trim().min(1).max(100).optional(),
  purpose: z.enum(["LOGIN", "SIGNUP", "PHONE_CHANGE"]).optional(),
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().toLowerCase().email("Invalid email address format."),
});

export const resetPasswordSchema = z.object({
  token: z.string().trim().min(10, "Valid password reset token is required."),
  newPassword: z
    .string()
    .min(8, "New password must be at least 8 characters long.")
    .max(100, "Password must not exceed 100 characters."),
});

export const updateProfileSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  avatarUrl: z.string().trim().url().optional().or(z.literal("")),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required."),
  newPassword: z
    .string()
    .min(8, "New password must be at least 8 characters long.")
    .max(100, "Password must not exceed 100 characters."),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type OtpRequestInput = z.infer<typeof otpRequestSchema>;
export type OtpVerifyInput = z.infer<typeof otpVerifySchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
