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

    if (!authorization?.startsWith("Bearer ")) {
      res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
      return;
    }

    const response = await fetch(`${AUTH_SERVER_URL}/auth/me`, {
      method: "GET",
      headers: {
        Authorization: authorization,
        Accept: "application/json",
      },
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