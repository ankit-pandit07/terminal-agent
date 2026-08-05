import { LLMFactory } from "../llm/llm.factory.js";

import { GoalParser } from "./goal.parser.js";

import { buildGoalEvaluationPrompt } from "./goal.prompt.js";

import type { Observation } from "../observation/observation.js";

import type { GoalEvaluation } from "./goal.types.js";

export class GoalService {
  private llm = LLMFactory.create();

  private parser = new GoalParser();

  async evaluate(
    request: string,

    output: string,

    observation: Observation,
  ): Promise<GoalEvaluation> {
    const prompt = buildGoalEvaluationPrompt(
      request,

      output,

      JSON.stringify(observation, null, 2),
    );

    const response = await this.llm.generate({
      prompt,
    });

    try {
      return this.parser.parse(response.text);
    } catch {
      return {
        completed: observation.success,
        confidence: observation.success ? 1 : 0,
        reason: observation.summary,
      };
    }
  }
}
