import { api } from "@/lib/api";
import type {
  User,
  AuthSessionInfo,
  RegisterPayload,
  LoginPayload,
  OtpRequestPayload,
  OtpVerifyPayload,
  UpdateProfilePayload,
  ChangePasswordPayload,
} from "../types";

export const authApi = {
  async register(data: RegisterPayload): Promise<{ success: boolean; user: User; token: string }> {
    const res = await api.post("/auth/register", data);
    return res.data;
  },

  async login(data: LoginPayload): Promise<{ success: boolean; user: User; token: string }> {
    const res = await api.post("/auth/login", data);
    return res.data;
  },

  async requestOtp(data: OtpRequestPayload): Promise<{ success: boolean; message: string; cooldownSeconds: number }> {
    const res = await api.post("/auth/otp/request", data);
    return res.data;
  },

  async resendOtp(data: OtpRequestPayload): Promise<{ success: boolean; message: string; cooldownSeconds: number }> {
    const res = await api.post("/auth/otp/resend", data);
    return res.data;
  },

  async verifyOtp(data: OtpVerifyPayload): Promise<{ success: boolean; user: User; token: string }> {
    const res = await api.post("/auth/otp/verify", data);
    return res.data;
  },

  async forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
    const res = await api.post("/auth/forgot-password", { email });
    return res.data;
  },

  async resetPassword(token: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    const res = await api.post("/auth/reset-password", { token, newPassword });
    return res.data;
  },

  async getMe(): Promise<{ success: boolean; user: User | null; sessionId?: string }> {
    const res = await api.get("/auth/me");
    return res.data;
  },

  async logout(): Promise<{ success: boolean; message: string }> {
    const res = await api.post("/auth/logout");
    return res.data;
  },

  async getSessions(): Promise<{ success: boolean; sessions: AuthSessionInfo[] }> {
    const res = await api.get("/auth/sessions");
    return res.data;
  },

  async revokeSession(sessionId: string): Promise<{ success: boolean; message: string }> {
    const res = await api.delete(`/auth/sessions/${sessionId}`);
    return res.data;
  },

  async logoutOtherSessions(): Promise<{ success: boolean; message: string; count: number }> {
    const res = await api.post("/auth/sessions/logout-others");
    return res.data;
  },

  async updateProfile(data: UpdateProfilePayload): Promise<{ success: boolean; user: User }> {
    const res = await api.patch("/auth/profile", data);
    return res.data;
  },

  async changePassword(data: ChangePasswordPayload): Promise<{ success: boolean; message: string }> {
    const res = await api.post("/auth/change-password", data);
    return res.data;
  },
};
