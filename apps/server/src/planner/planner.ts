import type { Observation, Reflection } from "../observation/index.js";
import type { ToolInput } from "../tools/base/tool.interface.js";
import type { WorkspaceInfo } from "../workspace/index.js";

export interface GoalAnalysis {
  goal: string;
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

  mitigation: string[];
}

export interface PriorityAnalysis {
  executionOrder: string[];
  criticalSteps: string[];
  optionalSteps: string[];
}
export interface ExecutionStrategy {
  mode: "sequential" | "parallel";

  reason: string;

  verifyAfterEachStep: boolean;

  allowRetry: boolean;
}
export interface PlanStep {
  tool: string;
  input: ToolInput;
  reason?: string;
  priority?: number;
}

export interface Plan {
  source:"rule" | "ai";
  steps: PlanStep[];
}

export interface PlannerRequest {
  message: string;
  history: string;
  workspace: WorkspaceInfo;
  sessionContext: string;
  observation?: Observation;
  reflection?: Reflection;
}

export const PLANNER_JSON_SCHEMA = {
  type: "object",
  properties: {
    steps: {
      type: "array",
      items: {
        type: "object",
        properties: {
          tool: {
            type: "string",
            enum: ["terminal", "file", "directory", "search", "echo"],
          },
          input: {
            type: "object",
          },
          reason: {
            type: "string",
          },
          priority: {
            type: "number",
          },
        },
        required: ["tool", "input"],
      },
    },
  },
  required: ["steps"],
};
