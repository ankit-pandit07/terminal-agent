import { prisma } from "../db/prisma.js";
import { generateSessionToken, hashSessionToken } from "./crypto.js";
import type { User, AuthSession } from "@prisma/client";

const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export interface ParsedClientInfo {
  browser: string;
  os: string;
  device: string;
}

/**
 * Parses user agent string into friendly browser and OS info without heavy dependencies.
 */
export function parseUserAgent(ua?: string | null): ParsedClientInfo {
  if (!ua) {
    return { browser: "Unknown Browser", os: "Unknown OS", device: "Desktop" };
  }

  let browser = "Web Browser";
  let os = "Unknown OS";
  let device = "Desktop";

  // Check OS
  if (/windows nt 10/i.test(ua)) os = "Windows 10/11";
  else if (/windows nt/i.test(ua)) os = "Windows";
  else if (/macintosh|mac os x/i.test(ua)) os = "macOS";
  else if (/iphone|ipad|ipod/i.test(ua)) {
    os = "iOS";
    device = /ipad/i.test(ua) ? "Tablet" : "Mobile";
  } else if (/android/i.test(ua)) {
    os = "Android";
    device = "Mobile";
  } else if (/linux/i.test(ua)) os = "Linux";

  // Check Browser
  if (/edg\//i.test(ua)) browser = "Microsoft Edge";
  else if (/chrome|crios/i.test(ua) && !/opr|opera/i.test(ua)) browser = "Chrome";
  else if (/firefox|fxios/i.test(ua)) browser = "Firefox";
  else if (/safari/i.test(ua) && !/chrome/i.test(ua)) browser = "Safari";
  else if (/opr|opera/i.test(ua)) browser = "Opera";
  else if (/node-fetch|axios|curl|postman/i.test(ua)) browser = "API Client";

  return { browser, os, device };
}

export class SessionService {
  /**
   * Creates a new persistent authentication session for a user.
   */
  async createSession(
    userId: string,
    userAgent?: string,
    ipAddress?: string
  ): Promise<{ token: string; session: AuthSession }> {
    const token = generateSessionToken();
    const sessionTokenHash = hashSessionToken(token);
    const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

    const session = await prisma.authSession.create({
      data: {
        userId,
        sessionTokenHash,
        expiresAt,
        userAgent: userAgent ? userAgent.slice(0, 500) : null,
        ipAddress: ipAddress ? ipAddress.slice(0, 100) : null,
      },
    });

    return { token, session };
  }

  /**
   * Validates a raw unhashed session token and returns the session and user.
   */
  async validateSession(
    rawToken: string
  ): Promise<{ user: User; session: AuthSession } | null> {
    if (!rawToken || typeof rawToken !== "string") {
      return null;
    }

    const sessionTokenHash = hashSessionToken(rawToken);

    const session = await prisma.authSession.findUnique({
      where: {
        sessionTokenHash,
      },
      include: {
        user: true,
      },
    });

    if (!session) return null;

    // Check revocation
    if (session.revokedAt !== null) return null;

    // Check expiration
    if (new Date() > session.expiresAt) return null;

    // Update lastUsedAt if more than 1 minute since last update
    const now = new Date();
    if (now.getTime() - session.lastUsedAt.getTime() > 60 * 1000) {
      await prisma.authSession
        .update({
          where: { id: session.id },
          data: { lastUsedAt: now },
        })
        .catch(() => {});
    }

    const { user, ...sessionData } = session;
    return { user, session: sessionData };
  }

  /**
   * Revokes a session by session ID for a specific user.
   */
  async revokeSession(sessionId: string, userId: string): Promise<boolean> {
    const session = await prisma.authSession.findFirst({
      where: {
        id: sessionId,
        userId,
      },
    });

    if (!session) return false;

    await prisma.authSession.update({
      where: { id: sessionId },
      data: { revokedAt: new Date() },
    });

    return true;
  }

  /**
   * Revokes a session using the raw token.
   */
  async revokeSessionByToken(rawToken: string): Promise<boolean> {
    if (!rawToken) return false;
    const sessionTokenHash = hashSessionToken(rawToken);

    const session = await prisma.authSession.findUnique({
      where: { sessionTokenHash },
    });

    if (!session) return false;

    await prisma.authSession.update({
      where: { id: session.id },
      data: { revokedAt: new Date() },
    });

    return true;
  }

  /**
   * Revokes all active sessions for a user EXCEPT the current session.
   */
  async revokeOtherSessions(
    userId: string,
    currentSessionId: string
  ): Promise<number> {
    const result = await prisma.authSession.updateMany({
      where: {
        userId,
        id: { not: currentSessionId },
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });

    return result.count;
  }

  /**
   * Returns a list of all active sessions for a user with client info.
   */
  async listUserSessions(userId: string, currentSessionId?: string) {
    const sessions = await prisma.authSession.findMany({
      where: {
        userId,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: {
        lastUsedAt: "desc",
      },
    });

    return sessions.map((s) => {
      const client = parseUserAgent(s.userAgent);
      return {
        id: s.id,
        browser: client.browser,
        os: client.os,
        device: client.device,
        createdAt: s.createdAt,
        lastUsedAt: s.lastUsedAt,
        isCurrent: s.id === currentSessionId,
      };
    });
  }
}
