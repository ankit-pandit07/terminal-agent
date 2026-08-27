import type { Request, Response, NextFunction } from "express";
import { SessionService } from "../auth/session.service.js";
import { env } from "../config/env.js";
import type { User, AuthSession } from "@prisma/client";

declare global {
  namespace Express {
    interface Request {
      user?: User;
      authSession?: AuthSession;
    }
  }
}

export const AUTH_COOKIE_NAME = "nodebase_session";

const sessionService = new SessionService();

/**
 * Extracts session token from cookie or Authorization Bearer header.
 */
export function extractSessionToken(req: Request): string | null {
  // 1. Check HTTP-only cookie
  if (req.cookies && req.cookies[AUTH_COOKIE_NAME]) {
    return req.cookies[AUTH_COOKIE_NAME];
  }

  // 2. Check fallback cookie name
  if (req.cookies && req.cookies["session_token"]) {
    return req.cookies["session_token"];
  }

  // 3. Check Authorization header: Bearer <token>
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.slice(7).trim();
  }

  return null;
}

function checkIsProduction(): boolean {
  return process.env.NODE_ENV === "production" || env.NODE_ENV === "production";
}

/**
 * Sets secure HTTP-only authentication session cookie on the response.
 */
export function setAuthCookie(res: Response, token: string): void {
  const isProduction = checkIsProduction();

  res.cookie(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/",
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });
}

/**
 * Clears the authentication session cookie.
 */
export function clearAuthCookie(res: Response): void {
  const isProduction = checkIsProduction();

  res.clearCookie(AUTH_COOKIE_NAME, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/",
  });
}

/**
 * Middleware that requires a valid authenticated session.
 * Rejects with 401 Unauthorized if missing or invalid.
 */
export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const token = extractSessionToken(req);

    if (!token) {
      res.status(401).json({
        success: false,
        message: "Unauthorized. Authentication session required.",
      });
      return;
    }

    const validated = await sessionService.validateSession(token);

    if (!validated) {
      clearAuthCookie(res);
      res.status(401).json({
        success: false,
        message: "Unauthorized. Session expired or revoked. Please sign in again.",
      });
      return;
    }

    req.user = validated.user;
    req.authSession = validated.session;

    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Optional authentication middleware that attaches user if a valid session exists.
 */
export async function optionalAuth(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const token = extractSessionToken(req);

    if (token) {
      const validated = await sessionService.validateSession(token);
      if (validated) {
        req.user = validated.user;
        req.authSession = validated.session;
      }
    }

    next();
  } catch {
    next();
  }
}
