import type { AutomationCondition, ConditionEngine } from "../../domain";

export class DefaultConditionEngine implements ConditionEngine {
  evaluate(conditions: AutomationCondition[], context: Record<string, string>) {
    if (conditions.length === 0) {
      return { passed: true, evaluations: [] };
    }

    const evaluations = conditions.map((condition) => ({
      condition,
      passed: condition.evaluate(context),
    }));

    const passed = evaluations.every((e) => e.passed);
    return { passed, evaluations };
  }
}
