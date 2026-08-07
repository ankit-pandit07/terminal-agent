import type { PlanningRule } from "../rule.interface.js";
import type { RuleContext, RuleResult } from "../rule.types.js";

export class DockerRule implements PlanningRule {
  name = "docker";

  match(context: RuleContext): boolean {
    const text = context.message.toLowerCase();

    return (
      text.startsWith("docker ") ||
      text.startsWith("docker compose") ||
      text.includes("docker ps") ||
      text.includes("docker images") ||
      text.includes("docker logs") ||
      text.includes("docker exec") ||
      text.includes("docker run") ||
      text.includes("docker build") ||
      text.includes("docker stop") ||
      text.includes("docker start") ||
      text.includes("docker restart") ||
      text.includes("docker compose up") ||
      text.includes("docker compose down")
    );
  }

  execute(context: RuleContext): RuleResult {
    return {
      matched: true,
      confidence: 1,
      plan: {
        source:"rule",
        steps: [
          {
            tool: "terminal",

            input: {
              command: context.message,
            },
          },
        ],
      },
    };
  }
}
