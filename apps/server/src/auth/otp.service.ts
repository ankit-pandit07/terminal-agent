import { prisma } from "../db/prisma.js";
import { env } from "../config/env.js";
import { generateOtpCode, hashOtpCode, verifyOtpCode } from "./crypto.js";

const RESEND_COOLDOWN_MS = 60 * 1000; // 60 seconds
const OTP_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes
const MAX_ATTEMPTS = 5;

/**
 * Normalizes phone numbers to standard E.164 format.
 * E.g. "+91 98765-43210" -> "+919876543210"
 */
export function normalizePhoneNumber(rawPhone: string): string {
  let cleaned = rawPhone.trim().replace(/[\s\-()]/g, "");
  if (!cleaned.startsWith("+")) {
    // If no leading +, ensure clean numbers only
    cleaned = `+${cleaned}`;
  }
  return cleaned;
}

export class OtpService {
  private hasTwilioConfig(): boolean {
    return Boolean(
      env.TWILIO_ACCOUNT_SID &&
      env.TWILIO_AUTH_TOKEN &&
      env.TWILIO_VERIFY_SERVICE_SID
    );
  }

  /**
   * Sends an OTP to the given phone number via Twilio Verify or dev provider.
   */
  async requestPhoneOtp(
    rawPhone: string,
    purpose: "LOGIN" | "SIGNUP" | "PHONE_CHANGE" = "LOGIN"
  ): Promise<{ success: boolean; message: string; cooldownSeconds: number }> {
    const phone = normalizePhoneNumber(rawPhone);

    // 1. Check for recent pending OTP request for cooldown
    const latestOtp = await prisma.otpVerification.findFirst({
      where: {
        identifier: phone,
        purpose,
        consumedAt: null,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (latestOtp) {
      const elapsed = Date.now() - latestOtp.createdAt.getTime();
      if (elapsed < RESEND_COOLDOWN_MS) {
        const remainingSeconds = Math.ceil((RESEND_COOLDOWN_MS - elapsed) / 1000);
        return {
          success: false,
          message: `Please wait ${remainingSeconds}s before requesting a new OTP.`,
          cooldownSeconds: remainingSeconds,
        };
      }
    }

    // 2. Invalidate any existing active OTP records for this phone/purpose
    await prisma.otpVerification.updateMany({
      where: {
        identifier: phone,
        purpose,
        consumedAt: null,
      },
      data: {
        consumedAt: new Date(), // mark as superseded
      },
    });

    const isTwilioConfigured = this.hasTwilioConfig();

    if (isTwilioConfigured) {
      try {
        const authHeader = Buffer.from(
          `${env.TWILIO_ACCOUNT_SID}:${env.TWILIO_AUTH_TOKEN}`
        ).toString("base64");

        const url = `https://verify.twilio.com/v2/Services/${env.TWILIO_VERIFY_SERVICE_SID}/Verifications`;
        const bodyParams = new URLSearchParams({
          To: phone,
          Channel: "sms",
        });

        const res = await fetch(url, {
          method: "POST",
          headers: {
            Authorization: `Basic ${authHeader}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: bodyParams.toString(),
        });

        if (!res.ok) {
          const errorData = (await res.json().catch(() => ({}))) as { message?: string };
          throw new Error(errorData.message || `Twilio Verify error: HTTP ${res.status}`);
        }

        // Store verification audit record
        await prisma.otpVerification.create({
          data: {
            identifier: phone,
            channel: "PHONE",
            purpose,
            codeHash: "TWILIO_VERIFY_MANAGED",
            expiresAt: new Date(Date.now() + OTP_EXPIRY_MS),
          },
        });

        return {
          success: true,
          message: "Verification code sent successfully via SMS.",
          cooldownSeconds: 60,
        };
      } catch (error) {
        const msg = error instanceof Error ? error.message : "Failed to send SMS via Twilio.";
        if (env.NODE_ENV === "production") {
          throw new Error(`SMS delivery failure: ${msg}`);
        }
        console.warn(`[Twilio Warning] ${msg}. Falling back to dev OTP mode.`);
      }
    }

    // If production and Twilio is not configured, warn or fail
    if (env.NODE_ENV === "production" && !isTwilioConfigured) {
      throw new Error(
        "Twilio Verify credentials are not configured on this server. Please set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_VERIFY_SERVICE_SID."
      );
    }

    // Dev Fallback Mode: Generate 6-digit secure OTP and store hash
    const otpCode = generateOtpCode();
    const codeHash = hashOtpCode(otpCode, phone);

    await prisma.otpVerification.create({
      data: {
        identifier: phone,
        channel: "PHONE",
        purpose,
        codeHash,
        expiresAt: new Date(Date.now() + OTP_EXPIRY_MS),
      },
    });

    // Output strictly to server console in dev mode
    console.log(`\n========================================`);
    console.log(`[DEV OTP PROVIDER] Phone: ${phone}`);
    console.log(`[DEV OTP PROVIDER] Code:  ${otpCode}`);
    console.log(`[DEV OTP PROVIDER] Valid for 10 minutes`);
    console.log(`========================================\n`);

    return {
      success: true,
      message: "Verification code sent (check server console in development mode).",
      cooldownSeconds: 60,
    };
  }

  /**
   * Verifies the 6-digit OTP code for a phone number.
   */
  async verifyPhoneOtp(
    rawPhone: string,
    code: string,
    purpose: "LOGIN" | "SIGNUP" | "PHONE_CHANGE" = "LOGIN"
  ): Promise<{ success: boolean; message: string; phone: string }> {
    const phone = normalizePhoneNumber(rawPhone);
    const cleanCode = code.trim();

    if (!/^\d{6}$/.test(cleanCode)) {
      return {
        success: false,
        message: "Invalid OTP format. Must be a 6-digit number.",
        phone,
      };
    }

    const isTwilioConfigured = this.hasTwilioConfig();

    if (isTwilioConfigured) {
      try {
        const authHeader = Buffer.from(
          `${env.TWILIO_ACCOUNT_SID}:${env.TWILIO_AUTH_TOKEN}`
        ).toString("base64");

        const url = `https://verify.twilio.com/v2/Services/${env.TWILIO_VERIFY_SERVICE_SID}/VerificationCheck`;
        const bodyParams = new URLSearchParams({
          To: phone,
          Code: cleanCode,
        });

        const res = await fetch(url, {
          method: "POST",
          headers: {
            Authorization: `Basic ${authHeader}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: bodyParams.toString(),
        });

        if (res.ok) {
          const data = (await res.json()) as { status?: string };
          if (data.status === "approved") {
            // Mark any local audit record as consumed
            await prisma.otpVerification.updateMany({
              where: {
                identifier: phone,
                purpose,
                consumedAt: null,
              },
              data: {
                consumedAt: new Date(),
              },
            });

            return {
              success: true,
              message: "Phone number verified successfully.",
              phone,
            };
          }
        }
      } catch (err) {
        if (env.NODE_ENV === "production") {
          return {
            success: false,
            message: "Failed to verify OTP with provider.",
            phone,
          };
        }
      }
    }

    // Local Verification Lookup (for Dev or non-Twilio records)
    const record = await prisma.otpVerification.findFirst({
      where: {
        identifier: phone,
        purpose,
        consumedAt: null,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!record) {
      return {
        success: false,
        message: "No active OTP verification found for this phone number. Please request a new one.",
        phone,
      };
    }

    // Check expiration
    if (new Date() > record.expiresAt) {
      return {
        success: false,
        message: "OTP has expired. Please request a new code.",
        phone,
      };
    }

    // Check max attempts
    if (record.attempts >= MAX_ATTEMPTS) {
      await prisma.otpVerification.update({
        where: { id: record.id },
        data: { consumedAt: new Date() }, // Invalidate locked record
      });
      return {
        success: false,
        message: "Maximum verification attempts exceeded. Please request a new OTP.",
        phone,
      };
    }

    // Verify hash
    const isValid = verifyOtpCode(cleanCode, phone, record.codeHash);

    if (!isValid) {
      const updatedAttempts = record.attempts + 1;
      await prisma.otpVerification.update({
        where: { id: record.id },
        data: { attempts: updatedAttempts },
      });

      const remainingAttempts = MAX_ATTEMPTS - updatedAttempts;
      return {
        success: false,
        message: `Incorrect verification code. ${remainingAttempts} attempt(s) remaining.`,
        phone,
      };
    }

    // Mark as consumed
    await prisma.otpVerification.update({
      where: { id: record.id },
      data: { consumedAt: new Date() },
    });

    return {
      success: true,
      message: "Phone number verified successfully.",
      phone,
    };
  }
}
