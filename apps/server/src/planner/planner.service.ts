import { LLMFactory } from "../llm/llm.factory.js";
import type { Plan } from "./planner.js";
import { JsonParser } from "../parser/json.parser.js";
import { buildPlannerPrompt } from "../prompts/planner.prompt.js";
import { promises as fs } from "fs";
import path from "path";

export class PlannerService {
    
  private llm = LLMFactory.create();
  private parser=new JsonParser();
private async getProjectContext(): Promise<string> {
  const context: string[] = [];

  try {
    const packagePath = path.join(process.cwd(), "package.json");

    const packageJson = JSON.parse(
      await fs.readFile(packagePath, "utf8")
    );

    context.push(`Project: ${packageJson.name ?? "Unknown"}`);

    if (packageJson.type) {
      context.push(`Module: ${packageJson.type}`);
    }

    const dependencies = Object.keys(
      packageJson.dependencies ?? {}
    );

    if (dependencies.length > 0) {
      context.push(
        `Dependencies: ${dependencies.join(", ")}`
      );
    }
  } catch {}

  try {
    await fs.access("tsconfig.json");
    context.push("Language: TypeScript");
  } catch {}

  try {
    await fs.access("prisma/schema.prisma");
    context.push("Uses Prisma");
  } catch {}

  return context.join("\n");
}
async createPlan(
  message: string,
  history: string,
  observation?: string
): Promise<Plan> {

const projectContext = await this.getProjectContext();

const prompt = buildPlannerPrompt(
  history,
  message,
  observation,
  projectContext
);
    const response = await this.llm.generate({
      prompt,
    });
   
    return this.parser.parse(response.text);
  }
}
