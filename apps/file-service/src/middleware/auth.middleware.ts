import type { Request, Response, NextFunction } from "express";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string | null;
        phone: string | null;
      };
    }
  }
}

const AUTH_SERVER_URL =
  process.env.AUTH_SERVER_URL || "http://localhost:5000";

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const authorization = req.headers.authorization;
    const cookie = req.headers.cookie;

    if (!authorization?.startsWith("Bearer ") && !cookie) {
      res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
      return;
    }

    const headers: Record<string, string> = {
      Accept: "application/json",
    };
    if (authorization) {
      headers["Authorization"] = authorization;
    }
    if (cookie) {
      headers["Cookie"] = cookie;
    }

    const response = await fetch(`${AUTH_SERVER_URL}/auth/me`, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      res.status(401).json({
        success: false,
        message: "Invalid or expired authentication session.",
      });
      return;
    }

    const data = (await response.json()) as {
      success?: boolean;
      user?: {
        id: string;
        email?: string | null;
        phone?: string | null;
      };
    };

    if (!data.success || !data.user?.id) {
      res.status(401).json({
        success: false,
        message: "Invalid authentication session.",
      });
      return;
    }

    req.user = {
      id: data.user.id,
      email: data.user.email ?? null,
      phone: data.user.phone ?? null,
    };

    next();
  } catch (error) {
    next(error);
  }
}