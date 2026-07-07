import type { AutomationAction } from "../entities";

export type ActionPlan = {
  action: AutomationAction;
  status: "planned" | "skipped" | "executed" | "failed";
  message: string;
};

export interface ActionEngine {
  plan(actions: AutomationAction[]): ActionPlan[];
  execute(
    actions: AutomationAction[],
    context: Record<string, string>,
  ): Promise<ActionPlan[]>;
}
