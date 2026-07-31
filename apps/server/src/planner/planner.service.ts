import { LLMFactory } from "../llm/llm.factory.js";
import type { Plan } from "./planner.js";
import { JsonParser } from "../parser/json.parser.js";
import { buildPlannerPrompt } from "../prompts/planner.prompt.js";

import type { WorkspaceInfo } from "../workspace/workspace.types.js";

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
    observation?: string,
  ): Promise<Plan> {
    const projectContext = this.buildProjectContext(workspace);

    const prompt = buildPlannerPrompt(
      history,
      message,
      observation,
      projectContext,
    );

    const response = await this.llm.generate({
      prompt,
    });

    return this.parser.parse(response.text);
  }
}