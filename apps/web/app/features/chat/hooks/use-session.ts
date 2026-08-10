"use client";

import { useCallback, useEffect, useState } from "react";
import { getSession, type SessionSnapshot } from "../api/session.api";

export function useSession() {
  const [session, setSession] = useState<SessionSnapshot | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getSession();

      setSession(data);
    } catch (error) {
      console.error("Failed to load session:", error);

      setError("Failed to load session.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    session,
    loading,
    error,
    refresh,
  };
}
