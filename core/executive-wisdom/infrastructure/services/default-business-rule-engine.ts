import {
  ExecutiveBusinessRule,
  type BusinessRuleEngine,
  type BusinessRuleEvaluation,
  type ExecutiveWisdom,
} from "../../domain";

export class DefaultBusinessRuleEngine implements BusinessRuleEngine {
  deriveRules(wisdom: ExecutiveWisdom): ExecutiveBusinessRule[] {
    return [
      ExecutiveBusinessRule.create({
        companyId: wisdom.companyId,
        wisdomId: wisdom.id,
        name: `Rule: ${wisdom.recommendation.slice(0, 40)}`,
        description: `Business rule derived from wisdom ${wisdom.id}`,
        conditions: [
          {
            field: "confidence",
            operator: "greater_than",
            value: 50,
          },
        ],
        action: wisdom.recommendation,
        priority: wisdom.importance,
      }),
    ];
  }

  evaluateRules(
    rules: ExecutiveBusinessRule[],
    context: Record<string, string | number>,
  ): BusinessRuleEvaluation[] {
    return rules.map((rule) => {
      const matched = rule.conditions.every((condition) => {
        const actual = context[condition.field];
        if (actual === undefined) return false;

        switch (condition.operator) {
          case "equals":
            return actual === condition.value;
          case "greater_than":
            return Number(actual) > Number(condition.value);
          case "less_than":
            return Number(actual) < Number(condition.value);
          case "contains":
            return String(actual).includes(String(condition.value));
          default:
            return false;
        }
      });

      return {
        rule: rule.toJSON(),
        matched,
        reason: matched ? "All conditions satisfied" : "Conditions not met",
      };
    });
  }
}
