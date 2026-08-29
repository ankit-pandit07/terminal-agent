import axios from "axios";

export function resolveApiBaseUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_API_URL?.trim();

  // In production browser, use same-origin proxy /api/backend to ensure 100% first-party cookie delivery across all browsers
  if (typeof window !== "undefined" && process.env.NODE_ENV === "production") {
    if (!envUrl || envUrl.startsWith("/") || envUrl === "https://terminal-agent.onrender.com") {
      return "/api/backend";
    }
  }

  if (envUrl) {
    return envUrl.replace(/\/+$/, "");
  }

  return "http://localhost:5000";
}

export function resolveFileServiceBaseUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_FILE_SERVICE_URL?.trim();

  if (envUrl) {
    return envUrl.replace(/\/+$/, "");
  }

  return "http://localhost:5001";
}

export const api = axios.create({
  baseURL: resolveApiBaseUrl(),
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});