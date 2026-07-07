import type { AutomationTrigger, TriggerType, TriggerEngine } from "../../domain";

export class DefaultTriggerEngine implements TriggerEngine {
  private readonly registry: AutomationTrigger[] = [];

  register(trigger: AutomationTrigger): void {
    this.registry.push(trigger);
  }

  match(
    triggers: AutomationTrigger[],
    eventType: TriggerType,
    context: Record<string, string>,
  ) {
    const all = [...this.registry, ...triggers];
    const unique = all.filter(
      (t, i, arr) => arr.findIndex((x) => x.id === t.id) === i,
    );

    return unique.map((trigger) => {
      if (!trigger.active) {
        return { trigger, matched: false, reason: "Trigger inactive" };
      }

      if (trigger.type !== eventType) {
        return { trigger, matched: false, reason: "Type mismatch" };
      }

      const requiredKey = trigger.config.requiredKey;
      if (requiredKey && !context[requiredKey]) {
        return { trigger, matched: false, reason: `Missing context key: ${requiredKey}` };
      }

      return { trigger, matched: true, reason: "Trigger matched" };
    });
  }
}
