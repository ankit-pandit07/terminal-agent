import type { AgentEventEmitter } from "../events/agent-event-emitter.js";
import type { Observation } from "../observation/observation.js";
import type { VerificationResult } from "../verification/verification.types.js";

export function emit(
  emitter: AgentEventEmitter | undefined,
  event: Parameters<AgentEventEmitter["emit"]>[1],
) {
  emitter?.emit("event", event);
}

export function appendObservation(history: string, observation: Observation): string {
  return (
    history +
    `
Tool:
${observation.tool}

Category:
${observation.category}

Summary:
${observation.summary}

Facts:
${observation.facts.join("\n")}

Errors:
${observation.errors.join("\n")}

-----------------------------------
`
  );
}

export function shouldRetry(
  verification: VerificationResult,
  observation: Observation,
  retryCount: number,
  maxIterations: number,
): boolean {
  if (retryCount >= maxIterations - 1) {
    return false;
  }

  switch (verification.status) {
    case "completed":
      return false;

    case "continue":
      return true;

    case "failed":
      return observation.recoverable;

    default:
      return false;
  }
}