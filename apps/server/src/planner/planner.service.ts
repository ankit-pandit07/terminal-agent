import { LLMFactory } from "../llm/llm.factory.js";
import type { Plan } from "./planner.js";
import { JsonParser } from "../parser/json.parser.js";
import { buildPlannerPrompt } from "../prompts/planner.prompt.js";

import type { WorkspaceInfo } from "../workspace/workspace.types.js";
import type { Observation } from "../observation/observation.js";

export class PlannerService {
  private llm = LLMFactory.create();
  private parser = new JsonParser();

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

  async createPlan(
    message: string,
    history: string,
    workspace: WorkspaceInfo,
    sessionContext: string,
    observation?: Observation,
  ): Promise<Plan> {
    const projectContext = this.buildProjectContext(workspace);

    const prompt = buildPlannerPrompt(
      history,
      message,
      observation,
      projectContext,
      sessionContext,
    );

    const response = await this.llm.generate({
      prompt,
    });

    return this.parser.parse(response.text);
  }
}