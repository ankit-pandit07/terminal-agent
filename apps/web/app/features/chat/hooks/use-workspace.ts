"use client";

import { useCallback, useEffect, useState } from "react";
import { getWorkspace, WorkspaceInfo } from "../api/workspace.api";

export function useWorkspace() {
  const [workspace, setWorkspace] = useState<WorkspaceInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getWorkspace();
      setWorkspace(data);
    } catch (error) {
      console.error("Failed to load workspace:", error);
      setError("Failed to load workspace.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    workspace,
    loading,
    error,
    refresh,
  };
}