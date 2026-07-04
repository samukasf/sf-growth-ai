import type { ExecutiveContext } from "@/services/executive-context.service";
import type { ExecutiveDecision } from "../services/executive-decision.service";
import type { ExecutionPlan } from "../services/executive-execution-planner.service";
import type { ExecutiveIntelligence } from "../services/executive-intelligence.service";
import type { ExecutiveMonitoring } from "../services/executive-monitoring.service";

import { SamuelAiShell } from "./samuel-ai-shell";

type SamuelAiPageProps = {
  executiveContext?: ExecutiveContext | null;
  executiveIntelligence?: ExecutiveIntelligence | null;
  executiveDecisions?: ExecutiveDecision[];
  executionPlans?: ExecutionPlan[];
  executiveMonitoring?: ExecutiveMonitoring | null;
};

export function SamuelAiPage({
  executiveContext = null,
  executiveIntelligence = null,
  executiveDecisions = [],
  executionPlans = [],
  executiveMonitoring = null,
}: SamuelAiPageProps) {
  return (
    <SamuelAiShell
      executiveContext={executiveContext}
      executiveIntelligence={executiveIntelligence}
      executiveDecisions={executiveDecisions}
      executionPlans={executionPlans}
      executiveMonitoring={executiveMonitoring}
    />
  );
}
