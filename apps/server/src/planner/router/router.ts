import { DecisionEngine } from "../decision/decision.engine.js";
import type { RouteResult } from "./router.types.js";

export class PlannerRouter {
  private engine = new DecisionEngine();

  route(message: string): RouteResult {
    const decision = this.engine.analyze(message);

    return {
      decision,
      directExecution: !decision.useLLM,
    };
  }
}