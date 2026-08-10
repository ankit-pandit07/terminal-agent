import { api } from "../../../../lib/api";

export interface PlanStep {
  tool: string;
  input: Record<string, unknown>;
  reason?: string;
  priority?: number;
}

export interface Plan {
  source: "rule" | "ai";
  steps: PlanStep[];
}

export async function createPlan(message: string) {
  const { data } = await api.post<{
    success: boolean;
    plan: Plan;
  }>("/chat/plan", {
    message,
  });

  return data.plan;
}

export async function executePlan(plan: Plan) {
  const { data } = await api.post<{
    success: boolean;
    result: {
      success: boolean;
      output: string;
      observation: unknown;
    };
  }>("/chat/execute", {
    plan,
  });

  return data.result;
}
