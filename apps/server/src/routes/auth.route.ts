import { Router } from "express";
import { AuthService } from "../auth/auth.service.js";
import { SessionService } from "../auth/session.service.js";
import {
  registerSchema,
  loginSchema,
  otpRequestSchema,
  otpVerifySchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  updateProfileSchema,
  changePasswordSchema,
} from "../auth/auth.validation.js";
import {
  requireAuth,
  setAuthCookie,
  clearAuthCookie,
  extractSessionToken,
  AUTH_COOKIE_NAME,
} from "../middleware/auth.middleware.js";

const router = Router();
const authService = new AuthService();
const sessionService = new SessionService();

function getClientInfo(req: import("express").Request) {
  return {
    userAgent: req.headers["user-agent"] || "",
    ipAddress:
      (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
      req.socket.remoteAddress ||
      "",
  };
}

// POST /auth/register
router.post("/register", async (req, res, next) => {
  try {
    const body = registerSchema.parse(req.body);
    const result = await authService.register(body, getClientInfo(req));

    if (!result.success) {
      return res.status(400).json(result);
    }

    setAuthCookie(res, result.token);
    return res.status(201).json({
      success: true,
      user: result.user,
      token: result.token,
    });
  } catch (error) {
    next(error);
  }
});

// POST /auth/login
router.post("/login", async (req, res, next) => {
  try {
    const body = loginSchema.parse(req.body);
    const result = await authService.login(body, getClientInfo(req));

    if (!result.success) {
      return res.status(401).json(result);
    }

    setAuthCookie(res, result.token);
    return res.json({
      success: true,
      user: result.user,
      token: result.token,
    });
  } catch (error) {
    next(error);
  }
});

// POST /auth/otp/request
router.post("/otp/request", async (req, res, next) => {
  try {
    const body = otpRequestSchema.parse(req.body);
    const result = await authService.requestOtp(body);

    if (!result.success) {
      return res.status(429).json(result);
    }

    return res.json(result);
  } catch (error) {
    next(error);
  }
});

// POST /auth/otp/resend
router.post("/otp/resend", async (req, res, next) => {
  try {
    const body = otpRequestSchema.parse(req.body);
    const result = await authService.requestOtp(body);

    if (!result.success) {
      return res.status(429).json(result);
    }

    return res.json(result);
  } catch (error) {
    next(error);
  }
});

// POST /auth/otp/verify
router.post("/otp/verify", async (req, res, next) => {
  try {
    const body = otpVerifySchema.parse(req.body);
    const result = await authService.verifyOtp(body, getClientInfo(req));

    if (!result.success) {
      return res.status(400).json(result);
    }

    setAuthCookie(res, result.token);
    return res.json({
      success: true,
      user: result.user,
      token: result.token,
    });
  } catch (error) {
    next(error);
  }
});

// POST /auth/forgot-password
router.post("/forgot-password", async (req, res, next) => {
  try {
    const body = forgotPasswordSchema.parse(req.body);
    const result = await authService.forgotPassword(body);
    return res.json(result);
  } catch (error) {
    next(error);
  }
});

// POST /auth/reset-password
router.post("/reset-password", async (req, res, next) => {
  try {
    const body = resetPasswordSchema.parse(req.body);
    const result = await authService.resetPassword(body);

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.json(result);
  } catch (error) {
    next(error);
  }
});

// GET /auth/me
router.get("/me", requireAuth, async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const profile = await authService.getUserProfile(req.user.id);
    return res.json({
      success: true,
      user: profile,
      sessionId: req.authSession?.id,
    });
  } catch (error) {
    next(error);
  }
});

// POST /auth/logout
router.post("/logout", requireAuth, async (req, res, next) => {
  try {
    const token = extractSessionToken(req);
    if (token) {
      await sessionService.revokeSessionByToken(token);
    }

    clearAuthCookie(res);
    return res.json({
      success: true,
      message: "Successfully signed out.",
    });
  } catch (error) {
    next(error);
  }
});

// GET /auth/sessions
router.get("/sessions", requireAuth, async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const sessions = await sessionService.listUserSessions(
      req.user.id,
      req.authSession?.id
    );

    return res.json({
      success: true,
      sessions,
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /auth/sessions/:id
router.delete("/sessions/:id", requireAuth, async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const sessionId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!sessionId) {
      return res.status(400).json({ success: false, message: "Session ID is required." });
    }

    const revoked = await sessionService.revokeSession(
      sessionId,
      req.user.id
    );

    if (!revoked) {
      return res.status(404).json({
        success: false,
        message: "Session not found or already revoked.",
      });
    }

    if (req.authSession?.id === sessionId) {
      clearAuthCookie(res);
    }

    return res.json({
      success: true,
      message: "Session revoked successfully.",
    });
  } catch (error) {
    next(error);
  }
});

// POST /auth/sessions/logout-others
router.post("/sessions/logout-others", requireAuth, async (req, res, next) => {
  try {
    if (!req.user || !req.authSession) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const count = await sessionService.revokeOtherSessions(
      req.user.id,
      req.authSession.id
    );

    return res.json({
      success: true,
      message: `Revoked ${count} other active session(s).`,
      count,
    });
  } catch (error) {
    next(error);
  }
});

// PATCH /auth/profile
router.patch("/profile", requireAuth, async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const body = updateProfileSchema.parse(req.body);
    const result = await authService.updateProfile(req.user.id, body);
    return res.json(result);
  } catch (error) {
    next(error);
  }
});

// POST /auth/change-password
router.post("/change-password", requireAuth, async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const body = changePasswordSchema.parse(req.body);
    const result = await authService.changePassword(req.user.id, body);

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.json(result);
  } catch (error) {
    next(error);
  }
});

// GET /auth/debug (Safe production diagnostic endpoint)
router.get("/debug", async (req, res) => {
  const hasCookie = Boolean(
    req.cookies && (req.cookies[AUTH_COOKIE_NAME] || req.cookies["session_token"])
  );
  const token = extractSessionToken(req);
  let sessionFound = false;
  let hasUser = false;

  if (token) {
    const validated = await sessionService.validateSession(token);
    if (validated) {
      sessionFound = true;
      hasUser = Boolean(validated.user);
    }
  }

  return res.json({
    hasSessionCookie: hasCookie,
    authenticated: sessionFound && hasUser,
  });
});

export default router;
