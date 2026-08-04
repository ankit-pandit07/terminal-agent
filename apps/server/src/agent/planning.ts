import { PlannerService } from "../planner/planner.service.js";
import { PlanValidator } from "../planner/plan-validator.js";
import type { Plan } from "../planner/planner.js";
import { WorkspaceService } from "../workspace/workspace.service.js";
import { buildSessionContext } from "./session.js";


const planner = new PlannerService();
const validator = new PlanValidator();
const workspaceService = new WorkspaceService();

export async function createPlan(message: string): Promise<Plan> {
  const workspace = await workspaceService.analyze();
  const history = "";
  const sessionContext = buildSessionContext();

  const plan = await planner.createPlan(
    message,
    history,
    workspace,
    sessionContext,
  );

  validator.validate(plan);
  return plan;
}