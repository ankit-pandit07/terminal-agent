export interface PlanStep {
  tool: string;
  input: Record<string, unknown>;
}

export interface Plan {
  steps: PlanStep[];
}