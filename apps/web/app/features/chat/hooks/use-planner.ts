"use client";

import { useState } from "react";

import {
  createPlan,
  executePlan,
  type Plan,
  type PlanExecutionResult,
} from "../api/planning.api";

import { confirmAction, cancelAction } from "../api/chat.api";

export function usePlanner() {
  const [plan, setPlan] = useState<Plan | null>(null);
  const [result, setResult] = useState<PlanExecutionResult | null>(null);
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

      setError("Failed to execute plan.");
    } finally {
      setExecuting(false);
    }
  }

  async function confirmPlan() {
    if (!result?.confirmationId || !result.requiresConfirmation) {
      return;
    }

    setExecuting(true);
    setError(null);

    try {
      const response = await confirmAction(result.confirmationId);

      setResult({
        success: Boolean(response.success),
        output: String(response.response ?? "Action completed."),
        observation: response.observation ?? null,
      });
    } catch (error) {
      console.error("Failed to confirm plan:", error);

      setError("Failed to confirm the action.");
    } finally {
      setExecuting(false);
    }
  }

  async function cancelPlan() {
    if (!result?.confirmationId || !result.requiresConfirmation) {
      return;
    }

    setExecuting(true);
    setError(null);

    try {
      const response = await cancelAction(result.confirmationId);

      setResult({
        success: false,
        output: String(response.response ?? "Action cancelled."),
        observation: response.observation ?? null,
      });
    } catch (error) {
      console.error("Failed to cancel plan:", error);

      setError("Failed to cancel the action.");
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

    confirmPlan,
    cancelPlan,

    clear,
  };
}
