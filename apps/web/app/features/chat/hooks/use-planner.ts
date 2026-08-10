"use client";

import { useState } from "react";
import { createPlan, executePlan, type Plan } from "../api/planning.api";

export function usePlanner() {
  const [plan, setPlan] = useState<Plan | null>(null);

  const [result, setResult] = useState<{
    success: boolean;
    output: string;
    observation: unknown;
  } | null>(null);

  const [loading, setLoading] = useState(false);

  const [executing, setExecuting] = useState(false);

  const [error, setError] = useState<string | null>(null);

  async function generatePlan(message: string) {
    if (!message.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const generatedPlan = await createPlan(message);

      setPlan(generatedPlan);
    } catch (error) {
      console.error("Failed to create plan:", error);

      setError("Failed to create plan.");
    } finally {
      setLoading(false);
    }
  }

  async function runPlan() {
    if (!plan) return;

    setExecuting(true);
    setError(null);

    try {
      const executionResult = await executePlan(plan);

      setResult(executionResult);
    } catch (error) {
      console.error("Failed to execute plan:", error);

      setError("Failed to execute plan.");
    } finally {
      setExecuting(false);
    }
  }

  function clear() {
    setPlan(null);
    setResult(null);
    setError(null);
  }

  return {
    plan,
    result,
    loading,
    executing,
    error,
    generatePlan,
    runPlan,
    clear,
  };
}
