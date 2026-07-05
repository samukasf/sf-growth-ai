import type { ExecutiveContext } from "@/services/executive-context.service";
import type { ExecutiveDecision } from "../services/executive-decision.service";
import type { ExecutionPlan } from "../services/executive-execution-planner.service";
import type { ExecutiveForecast } from "../services/executive-forecast.service";
import type { ExecutiveIntelligence } from "../services/executive-intelligence.service";
import type { ExecutiveLearning } from "../services/executive-learning.service";
import type { ExecutiveMonitoring } from "../services/executive-monitoring.service";
import type { ExecutiveCompetitor } from "../services/executive-competitor.service";
import type { ExecutiveStrategy } from "../services/executive-strategy.service";

import { buildExecutiveCompetitor } from "../services/executive-competitor.service";

import { SamuelAiShell } from "./samuel-ai-shell";

type SamuelAiPageProps = {
  executiveContext?: ExecutiveContext | null;
  executiveIntelligence?: ExecutiveIntelligence | null;
  executiveDecisions?: ExecutiveDecision[];
  executionPlans?: ExecutionPlan[];
  executiveMonitoring?: ExecutiveMonitoring | null;
  executiveLearning?: ExecutiveLearning | null;
  executiveForecast?: ExecutiveForecast | null;
  executiveStrategy?: ExecutiveStrategy | null;
  executiveCompetitor?: ExecutiveCompetitor | null;
};

export function SamuelAiPage({
  executiveContext = null,
  executiveIntelligence = null,
  executiveDecisions = [],
  executionPlans = [],
  executiveMonitoring = null,
  executiveLearning = null,
  executiveForecast = null,
  executiveStrategy = null,
  executiveCompetitor = null,
}: SamuelAiPageProps) {
  const competitorIntelligence = executiveCompetitor ?? buildExecutiveCompetitor();

  return (
    <SamuelAiShell
      executiveContext={executiveContext}
      executiveIntelligence={executiveIntelligence}
      executiveDecisions={executiveDecisions}
      executionPlans={executionPlans}
      executiveMonitoring={executiveMonitoring}
      executiveLearning={executiveLearning}
      executiveForecast={executiveForecast}
      executiveStrategy={executiveStrategy}
      executiveCompetitor={competitorIntelligence}
    />
  );
}
