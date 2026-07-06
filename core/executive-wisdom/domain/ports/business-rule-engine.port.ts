import type { ExecutiveBusinessRule, ExecutiveWisdom } from "../entities";

export type BusinessRuleEvaluation = {
  rule: ReturnType<ExecutiveBusinessRule["toJSON"]>;
  matched: boolean;
  reason: string;
};

export interface BusinessRuleEngine {
  deriveRules(wisdom: ExecutiveWisdom): ExecutiveBusinessRule[];
  evaluateRules(
    rules: ExecutiveBusinessRule[],
    context: Record<string, string | number>,
  ): BusinessRuleEvaluation[];
}
