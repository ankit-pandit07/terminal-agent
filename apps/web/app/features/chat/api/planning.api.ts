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

export interface PlanExecutionResult {
  success: boolean;
  output: string;
  observation: unknown;
  requiresConfirmation?: boolean;
  confirmationId?: string;
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

export async function executePlan(
  plan: Plan,
): Promise<PlanExecutionResult> {
  const { data } = await api.post<{
    success: boolean;
    result: PlanExecutionResult;
  }>("/chat/execute", {
    plan,
  });

  return data.result;
}

export async function confirmationExecution(confirmationId:string){
  const {data}= await api.post<{
    success:boolean;
    response:string;
  }>(`/chat/confirm/${confirmationId}`);

  return data;
}

export async function cancelConfirmation(confirmationId:string){
  const {data}=await api.post<{
    success:boolean;
    response:string;
  }>(`/chat/cancel/${confirmationId}`);
  
  return data;
}