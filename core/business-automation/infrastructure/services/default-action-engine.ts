import type { AutomationAction, ActionEngine } from "../../domain";

export class DefaultActionEngine implements ActionEngine {
  plan(actions: AutomationAction[]) {
    return actions.map((action) => ({
      action,
      status: "planned" as const,
      message: `Planned action: ${action.type}`,
    }));
  }

  async execute(actions: AutomationAction[], context: Record<string, string>) {
    const contextKeys = Object.keys(context).length;
    return actions.map((action) => ({
      action,
      status: "executed" as const,
      message: `Simulated execution of ${action.type} with ${contextKeys} context keys (no real side effects)`,
    }));
  }
}
