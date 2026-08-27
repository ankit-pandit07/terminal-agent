import axios from "axios";

const rawApiUrl = process.env.NEXT_PUBLIC_API_URL?.trim() || "http://localhost:5000";
const API_URL = rawApiUrl.replace(/\/+$/, "");

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});