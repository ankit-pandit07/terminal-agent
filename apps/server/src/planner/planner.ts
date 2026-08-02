import type { Observation } from "../observation/index.js";
import type { ToolInput } from "../tools/base/tool.interface.js";
import type { WorkspaceInfo } from "../workspace/index.js";

export interface GoalAnalysis {
  goal:string;
  objective: string;
  constraints: string[];
  expectedOutcome: string;
}

export interface DependencyAnalysis {
  requiredFiles: string[];
  requiredTools: string[];
  prerequisites: string[];
  risks: string[];
}

export interface RiskAnalysis {
  level: "low" | "medium" | "high";

  risks: string[];

  mitigation:string[];
}

export interface PlanStep {
  tool: string;
  input: ToolInput;
  reason?:string;
  priority?: number;
}

export interface Plan {
  steps: PlanStep[];
}

export interface PlannerRequest {
  message: string;
  history: string;
  workspace: WorkspaceInfo;
  sessionContext: string;
  observation?: Observation;
}