import type { AutomationCondition } from "../entities";

export type ConditionEvaluation = {
  condition: AutomationCondition;
  passed: boolean;
};

export interface ConditionEngine {
  evaluate(
    conditions: AutomationCondition[],
    context: Record<string, string>,
  ): { passed: boolean; evaluations: ConditionEvaluation[] };
}
