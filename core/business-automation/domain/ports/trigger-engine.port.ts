import type { AutomationTrigger, TriggerType } from "../entities";

export type TriggerMatch = {
  trigger: AutomationTrigger;
  matched: boolean;
  reason: string;
};

export interface TriggerEngine {
  match(
    triggers: AutomationTrigger[],
    eventType: TriggerType,
    context: Record<string, string>,
  ): TriggerMatch[];
  register(trigger: AutomationTrigger): void;
}
