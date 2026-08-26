export interface User {
  id: string;
  email: string | null;
  phone: string | null;
  name: string | null;
  avatarUrl: string | null;
  emailVerifiedAt: string | null;
  phoneVerifiedAt: string | null;
  createdAt: string;
}

export interface AuthSessionInfo {
  id: string;
  browser: string;
  os: string;
  device: string;
  createdAt: string;
  lastUsedAt: string;
  isCurrent: boolean;
}

export interface RegisterPayload {
  email: string;
  password: string;
  name?: string;
  phone?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface OtpRequestPayload {
  phone: string;
  purpose?: "LOGIN" | "SIGNUP" | "PHONE_CHANGE";
}

export interface OtpVerifyPayload {
  phone: string;
  code: string;
  name?: string;
  purpose?: "LOGIN" | "SIGNUP" | "PHONE_CHANGE";
}

export interface UpdateProfilePayload {
  name?: string;
  avatarUrl?: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}
