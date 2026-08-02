import type { Observation } from "../observation/index.js";
import type { WorkspaceInfo } from "../workspace/index.js";

export interface PlanStep {
  tool: string;
  input: Record<string, unknown>;
}

export interface Plan {
  steps: PlanStep[];
}

export interface PlannerRequest {
  message: string;
  history: string;
  workspace: WorkspaceInfo;
  observation?: Observation;
}