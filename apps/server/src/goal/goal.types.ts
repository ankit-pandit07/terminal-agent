export interface GoalEvaluation {
  completed: boolean;

  confidence: number;

  reason: string;

  nextAction?: string;
}