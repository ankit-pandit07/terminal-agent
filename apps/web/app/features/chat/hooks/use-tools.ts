"use client";

import { useCallback, useEffect, useState } from "react";
import { getTools, enableTool, disableTool, type Tool } from "../api/tools.api";

export function useTools() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getTools();
      setTools(data);
    } catch (error) {
      console.error("Failed to load tools:", error);
      setError("Failed to load tools.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const toggleTool = useCallback(
    async (name: string, enabled: boolean) => {
      try {
        if (enabled) {
          await disableTool(name);
        } else {
          await enableTool(name);
        }

        await refresh();
      } catch (error) {
        console.error(
          `Failed to ${enabled ? "disable" : "enable"} tool:`,
          error,
        );

        setError(`Failed to ${enabled ? "disable" : "enable"} tool.`);
      }
    },
    [refresh],
  );

  return {
    tools,
    loading,
    error,
    refresh,
    toggleTool,
  };
}
