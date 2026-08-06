import { IntentAnalyzer } from "../analyzers/intent.analyzer.js";
import { TaskClassifier } from "../analyzers/task.classifier.js";
import { DecisionRules } from "./decision.rules.js";

export class DecisionEngine {
  private intent = new IntentAnalyzer();
  private task = new TaskClassifier();
  private rules = new DecisionRules();

  analyze(message: string) {
    const intent = this.intent.analyze(message);

    const task = this.task.classify(message);

    return this.rules.decide(
      intent,
      task,
    );
  }
}