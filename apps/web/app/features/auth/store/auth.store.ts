import { create } from "zustand";
import { authApi } from "../api/auth.api";
import { useConversationStore } from "@/app/features/chat/store/conversation.store";
import { useChatStore } from "@/app/features/chat/store/chat.store";
import type {
  User,
  LoginPayload,
  RegisterPayload,
  OtpVerifyPayload,
  UpdateProfilePayload,
} from "../types";

interface AuthState {
  user: User | null;
  loading: boolean;
  authenticated: boolean;
  error: string | null;

  checkAuth: () => Promise<boolean>;
  login: (data: LoginPayload) => Promise<boolean>;
  register: (data: RegisterPayload) => Promise<boolean>;
  verifyOtp: (data: OtpVerifyPayload) => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (data: UpdateProfilePayload) => Promise<boolean>;
  clearError: () => void;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: true,
  authenticated: false,
  error: null,

  checkAuth: async () => {
    const isCurrentlyAuth = get().authenticated;
    if (!isCurrentlyAuth) {
      set({ loading: true });
    }
    try {
      const data = await authApi.getMe();
      if (data.success && data.user) {
        set({
          user: data.user,
          authenticated: true,
          loading: false,
          error: null,
        });
        return true;
      }
      set({
        user: null,
        authenticated: false,
        loading: false,
      });
      useConversationStore.getState().reset();
      useChatStore.getState().clear();
      return false;
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 401 || status === 403 || !isCurrentlyAuth) {
        set({
          user: null,
          authenticated: false,
          loading: false,
        });
        useConversationStore.getState().reset();
        useChatStore.getState().clear();
        return false;
      }
      set({ loading: false });
      return isCurrentlyAuth;
    }
  },

  login: async (data: LoginPayload) => {
    set({ loading: true, error: null });
    try {
      const res = await authApi.login(data);
      if (res.success && res.user) {
        useConversationStore.getState().reset();
        useChatStore.getState().clear();
        set({
          user: res.user,
          authenticated: true,
          loading: false,
          error: null,
        });
        return true;
      }
      set({
        loading: false,
        error: "Failed to sign in. Please check your credentials.",
      });
      return false;
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Invalid email or password. Please try again.";
      set({
        loading: false,
        error: msg,
      });
      return false;
    }
  },

  register: async (data: RegisterPayload) => {
    set({ loading: true, error: null });
    try {
      const res = await authApi.register(data);
      if (res.success && res.user) {
        useConversationStore.getState().reset();
        useChatStore.getState().clear();
        set({
          user: res.user,
          authenticated: true,
          loading: false,
          error: null,
        });
        return true;
      }
      set({
        loading: false,
        error: "Failed to create account. Please try again.",
      });
      return false;
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Failed to register account. Please check your details.";
      set({
        loading: false,
        error: msg,
      });
      return false;
    }
  },

  verifyOtp: async (data: OtpVerifyPayload) => {
    set({ loading: true, error: null });
    try {
      const res = await authApi.verifyOtp(data);
      if (res.success && res.user) {
        useConversationStore.getState().reset();
        useChatStore.getState().clear();
        set({
          user: res.user,
          authenticated: true,
          loading: false,
          error: null,
        });
        return true;
      }
      set({
        loading: false,
        error: "Invalid or expired OTP. Please try again.",
      });
      return false;
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Failed to verify OTP code. Please try again.";
      set({
        loading: false,
        error: msg,
      });
      return false;
    }
  },

  logout: async () => {
    set({ loading: true });
    try {
      await authApi.logout();
    } catch {
      // ignore logout failure on network error
    } finally {
      useConversationStore.getState().reset();
      useChatStore.getState().clear();
      set({
        user: null,
        authenticated: false,
        loading: false,
        error: null,
      });
    }
  },

  updateProfile: async (data: UpdateProfilePayload) => {
    try {
      const res = await authApi.updateProfile(data);
      if (res.success && res.user) {
        set({ user: res.user });
        return true;
      }
      return false;
    } catch {
      return false;
    }
  },

  clearError: () => set({ error: null }),
  setUser: (user) => set({ user, authenticated: Boolean(user) }),
}));
