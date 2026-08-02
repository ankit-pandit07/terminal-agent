import { LLMFactory } from "../llm/llm.factory.js";
import type { DependencyAnalysis, GoalAnalysis, Plan, RiskAnalysis } from "./planner.js";
import { JsonParser } from "../parser/json.parser.js";
import { buildPlannerPrompt } from "../prompts/planner.prompt.js";

import type { WorkspaceInfo } from "../workspace/workspace.types.js";
import type { Observation } from "../observation/observation.js";

export class PlannerService {
  private llm = LLMFactory.create();
  private parser = new JsonParser();
  private analyzeGoal(message: string): GoalAnalysis {
   return {
  goal: message,
  objective: message,
  constraints: [
    "Preserve the existing project structure.",
    "Do not overwrite user code unless explicitly requested.",
    "Prefer the smallest number of steps.",
  ],
  expectedOutcome: `Successfully complete the user's request: "${message}"`,
};
  }

  private buildProjectContext(workspace: WorkspaceInfo): string {
    return `
Project: ${workspace.projectName ?? "Unknown"}

Language: ${workspace.language}

Framework: ${workspace.framework ?? "Unknown"}

Package Manager: ${workspace.packageManager}

ORM: ${workspace.orm ?? "None"}

Has Git: ${workspace.hasGit}

Has Prisma: ${workspace.hasPrisma}

Dependencies:
${workspace.dependencies.join(", ")}

Scripts:
${Object.entries(workspace.scripts)
  .map(([name, command]) => `- ${name}: ${command}`)
  .join("\n")}
`;
  }
  
   private analyzeDependencies(
    message: string,
): DependencyAnalysis {

    const text = message.toLowerCase();

    const dependencies: DependencyAnalysis = {
        requiredFiles: [],
        requiredTools: [],
        prerequisites: [],
        risks: [],
    };

    if (
        text.includes("npm") ||
        text.includes("express")
    ) {
        dependencies.requiredFiles.push(
            "package.json",
        );

        dependencies.requiredTools.push(
            "terminal",
        );

        dependencies.prerequisites.push(
            "Project root directory",
        );

        dependencies.risks.push(
            "Running npm outside the project root.",
        );
    }

    if (
        text.includes("prisma")
    ) {
        dependencies.requiredFiles.push(
            "schema.prisma",
        );

        dependencies.prerequisites.push(
            "Prisma installed",
        );
    }

    return dependencies;
}

private analyzeRisk(message: string): RiskAnalysis {
  const text = message.toLowerCase();

  const risks: RiskAnalysis = {
    level: "low",
    risks: [],
    mitigation: [],
  };

  if (
    text.includes("delete") ||
    text.includes("remove") ||
    text.includes("rm ")
  ) {
    risks.level = "high";

    risks.risks.push(
      "This request may permanently delete files."
    );

    risks.mitigation.push(
      "Verify the target before deletion."
    );
  }

  if (
    text.includes("edit") ||
    text.includes("overwrite")
  ) {
    risks.level = "medium";

    risks.risks.push(
      "Existing files may be modified."
    );

    risks.mitigation.push(
      "Read the file before editing."
    );
  }

  return risks;
}

  async createPlan(
    message: string,
    history: string,
    workspace: WorkspaceInfo,
    sessionContext: string,
    observation?: Observation,
  ): Promise<Plan> {
    const projectContext = this.buildProjectContext(workspace);
const goal = this.analyzeGoal(message);
const dependencyAnalysis = this.analyzeDependencies(message);
const risk = this.analyzeRisk(message);
    const prompt = buildPlannerPrompt(
      history,
      message,
      observation,
      projectContext,
      sessionContext,
      goal,
      dependencyAnalysis
    );

    const response = await this.llm.generate({
      prompt,
    });

    return this.parser.parse(response.text);
  }
 
}