import type { MarketingExecutive } from "@/features/marketing/services/marketing-executive.service";
import type { CrmExecutive } from "@/features/crm/services/crm-executive.service";
import type { ExecutiveContext } from "@/services/executive-context.service";
import type { ExecutiveDecision } from "../services/executive-decision.service";
import type { ExecutionPlan } from "../services/executive-execution-planner.service";
import type { ExecutiveForecast } from "../services/executive-forecast.service";
import type { ExecutiveIntelligence } from "../services/executive-intelligence.service";
import type { ExecutiveLearning } from "../services/executive-learning.service";
import type { ExecutiveMonitoring } from "../services/executive-monitoring.service";
import type { ExecutiveAction } from "../services/executive-action.service";
import type { ExecutiveCEO } from "../services/executive-ceo.service";
import type { ExecutiveCompetitor } from "../services/executive-competitor.service";
import type { ExecutivePriority } from "../services/executive-priority.service";
import type { ExecutiveRecommendation } from "../services/executive-recommendation.service";
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
  executiveAction?: ExecutiveAction | null;
  executivePriority?: ExecutivePriority | null;
  executiveRecommendation?: ExecutiveRecommendation | null;
  executiveCeo?: ExecutiveCEO | null;
  crmExecutive?: CrmExecutive | null;
  marketingExecutive?: MarketingExecutive | null;
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
  executiveAction = null,
  executivePriority = null,
  executiveRecommendation = null,
  executiveCeo = null,
  crmExecutive = null,
  marketingExecutive = null,
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
      executiveCeo={executiveCeo}
      crmExecutive={crmExecutive}
      marketingExecutive={marketingExecutive}
    />
  );
}
