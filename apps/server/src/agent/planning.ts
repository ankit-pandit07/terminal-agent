import { PlannerService } from "../planner/planner.service.js";
import { PlanValidator } from "../planner/plan-validator.js";
import type { Plan } from "../planner/planner.js";
import { WorkspaceService } from "../workspace/workspace.service.js";
import { ContextRetriever } from "../context/retriever/context.retriever.js";
import { buildSessionContext } from "./session.js";
import { buildMemoryContext } from "../memory/memory-context.js";

const planner = new PlannerService();
const validator = new PlanValidator();
const workspaceService = new WorkspaceService();
const contextRetriever = new ContextRetriever();

export async function createPlan(
  message: string,
): Promise<Plan> {
  const workspace = await workspaceService.analyze();
  const history = "";
  const sessionContext = buildSessionContext();
  const memoryContext=await buildMemoryContext(message);
  const retrievedContext = await contextRetriever.retrieve(
    message,
  );

  const plan = await planner.createPlan(
    message,
    history,
    memoryContext,
    workspace,
    retrievedContext,
    sessionContext,
  );

  validator.validate(plan);

  return plan;
}