import type { ExecutiveDecisionHistory, ExecutiveWisdom } from "../entities";
import type { Score } from "../../shared";

export type DecisionEvaluation = {
  wisdomId: string;
  decisionTitle: string;
  readinessScore: Score;
  riskLevel: string;
  expectedRoi: number;
  notes: string[];
};

export interface DecisionEvaluator {
  evaluate(wisdom: ExecutiveWisdom): DecisionEvaluation;
  evaluateHistory(history: ExecutiveDecisionHistory[]): DecisionEvaluation[];
}
