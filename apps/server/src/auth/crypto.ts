import crypto from "node:crypto";
import { promisify } from "node:util";

const scryptAsync = promisify(crypto.scrypt);

const SCRYPT_KEY_LEN = 64;

/**
 * Hashes a plaintext password using crypto.scrypt with a unique random 16-byte salt.
 * Formatted as "saltHex:derivedKeyHex".
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(16).toString("hex");
  const derivedKey = (await scryptAsync(password, salt, SCRYPT_KEY_LEN)) as Buffer;
  return `${salt}:${derivedKey.toString("hex")}`;
}

/**
 * Securely verifies a plaintext password against a stored "salt:hash" string using constant-time comparison.
 */
export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  try {
    const [salt, key] = storedHash.split(":");
    if (!salt || !key) return false;

    const keyBuffer = Buffer.from(key, "hex");
    const derivedKey = (await scryptAsync(password, salt, keyBuffer.length)) as Buffer;

    return crypto.timingSafeEqual(keyBuffer, derivedKey);
  } catch {
    return false;
  }
}

/**
 * Generates an unhashed cryptographic session token (64 hex chars).
 */
export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Computes SHA-256 hash of a session token for safe database storage.
 */
export function hashSessionToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

/**
 * Generates a cryptographically random 6-digit OTP.
 */
export function generateOtpCode(): string {
  const num = crypto.randomInt(100000, 1000000);
  return num.toString();
}

/**
 * Hashes an OTP code with an identifier salt for secure storage.
 */
export function hashOtpCode(code: string, identifier: string): string {
  return crypto
    .createHash("sha256")
    .update(`${identifier.trim().toLowerCase()}:${code.trim()}`)
    .digest("hex");
}

/**
 * Verifies an OTP code against a stored hash using constant-time comparison.
 */
export function verifyOtpCode(code: string, identifier: string, expectedHash: string): boolean {
  try {
    const computedHash = hashOtpCode(code, identifier);
    const a = Buffer.from(computedHash, "hex");
    const b = Buffer.from(expectedHash, "hex");
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

/**
 * Generates a random password reset token.
 */
export function generateResetToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Computes SHA-256 hash of a password reset token.
 */
export function hashResetToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}
