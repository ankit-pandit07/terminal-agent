import { IntentAnalyzer } from "../analyzers/intent.analyzer.js";
import { TaskClassifier } from "../analyzers/task.classifier.js";
import { DecisionRules } from "./decision.rules.js";

export class DecisionEngine {
  private intentAnalyzer = new IntentAnalyzer();
  private taskClassifier = new TaskClassifier();
  private rules = new DecisionRules();

  analyze(message: string) {
    const intent = this.intentAnalyzer.analyze(message);
    const task = this.taskClassifier.classify(message);
    return this.rules.decide(intent, task);
  }
}
