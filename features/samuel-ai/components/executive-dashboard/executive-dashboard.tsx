import { cn } from "@/utils/cn";

import type {
  ExecutiveBrain,
  ExecutiveBrainStatus,
  ExecutiveCouncil,
  ExecutiveStatus,
} from "../../executive-brain/types";
import type { OrchestratorSnapshot } from "../../services/executive-orchestrator.types";
import type { ExecutiveContext as CompanyExecutiveContext } from "@/services/executive-context.service";
import { GoogleBusinessExecutiveSummarySection } from "@/features/google-business/components/google-business-executive-summary-section";
import type { GoogleBusinessExecutive } from "@/features/google-business/services/google-business-executive.service";
import { LegalExecutiveSummarySection } from "@/features/legal/components/legal-executive-summary-section";
import type { LegalExecutive } from "@/features/legal/services/legal-executive.service";
import { HrExecutiveSummarySection } from "@/features/hr/components/hr-executive-summary-section";
import type { HrExecutive } from "@/features/hr/services/hr-executive.service";
import { OperationsExecutiveSummarySection } from "@/features/operations/components/operations-executive-summary-section";
import type { OperationsExecutive } from "@/features/operations/services/operations-executive.service";
import { FinanceExecutiveSummarySection } from "@/features/finance/components/finance-executive-summary-section";
import type { FinanceExecutive } from "@/features/finance/services/finance-executive.service";
import { SalesExecutiveSummarySection } from "@/features/sales/components/sales-executive-summary-section";
import type { SalesExecutive } from "@/features/sales/services/sales-executive.service";
import { MarketingExecutiveSummarySection } from "@/features/marketing/components/marketing-executive-summary-section";
import type { MarketingExecutive } from "@/features/marketing/services/marketing-executive.service";
import { CrmExecutiveSummarySection } from "@/features/crm/components/crm-executive-summary-section";
import type { CrmExecutive } from "@/features/crm/services/crm-executive.service";
import type { ExecutiveCEO } from "../../services/executive-ceo.service";
import type { ExecutiveStrategy } from "../../services/executive-strategy.service";
import type { ExecutiveForecast } from "../../services/executive-forecast.service";
import type { ExecutiveLearning } from "../../services/executive-learning.service";
import type { ExecutiveMonitoring } from "../../services/executive-monitoring.service";
import type { ExecutionPlan } from "../../services/executive-execution-planner.service";
import type { ExecutiveDecision } from "../../services/executive-decision.service";
import type { ExecutiveIntelligence } from "../../services/executive-intelligence.service";
import { CommandPanel } from "../shared/command-panel";
import { SectionHeader } from "../section-header";
import { ExecutiveActionPlanSection } from "./executive-action-plan-section";
import { ExecutiveContextSection } from "./executive-context-section";
import { ExecutiveCeoSection } from "./executive-ceo-section";
import { ExecutiveDecisionsSection } from "./executive-decisions-section";
import { ExecutiveExecutionPlanSection } from "./executive-execution-plan-section";
import { ExecutiveStrategySection } from "./executive-strategy-section";
import { ExecutiveForecastSection } from "./executive-forecast-section";
import { ExecutiveLearningSection } from "./executive-learning-section";
import { ExecutiveIntelligenceSection } from "./executive-intelligence-section";
import { ExecutiveMonitoringSection } from "./executive-monitoring-section";
import { ExecutiveMemorySection } from "./executive-memory-section";
import { ExecutiveOrchestratorSection } from "./executive-orchestrator-section";
import { ExecutiveReasoningSection } from "./executive-reasoning-section";
import { ExecutiveCouncilSection } from "./executive-council-section";
import { ExecutiveStatusSection } from "./executive-status-section";

type ExecutiveDashboardProps = {
  brain: ExecutiveBrain;
  status: ExecutiveBrainStatus;
  executiveStatus: ExecutiveStatus;
  council: ExecutiveCouncil;
  hasActiveAnalysis: boolean;
  orchestratorSnapshot?: OrchestratorSnapshot | null;
  isProcessing?: boolean;
  executiveContext?: CompanyExecutiveContext | null;
  executiveIntelligence?: ExecutiveIntelligence | null;
  executiveDecisions?: ExecutiveDecision[];
  executionPlans?: ExecutionPlan[];
  executiveMonitoring?: ExecutiveMonitoring | null;
  executiveLearning?: ExecutiveLearning | null;
  executiveForecast?: ExecutiveForecast | null;
  executiveStrategy?: ExecutiveStrategy | null;
  executiveCeo?: ExecutiveCEO | null;
  crmExecutive?: CrmExecutive | null;
  marketingExecutive?: MarketingExecutive | null;
  salesExecutive?: SalesExecutive | null;
  financeExecutive?: FinanceExecutive | null;
  operationsExecutive?: OperationsExecutive | null;
  hrExecutive?: HrExecutive | null;
  legalExecutive?: LegalExecutive | null;
  googleBusinessExecutive?: GoogleBusinessExecutive | null;
};

const STATUS_LABELS: Record<ExecutiveBrainStatus, string> = {
  idle: "Aguardando diretriz",
  building: "Análise em curso",
  ready: "Análise concluída",
};

export function ExecutiveDashboard({
  brain,
  status,
  executiveStatus,
  council,
  hasActiveAnalysis,
  orchestratorSnapshot = null,
  isProcessing = false,
  executiveContext = null,
  executiveIntelligence = null,
  executiveDecisions = [],
  executionPlans = [],
  executiveMonitoring = null,
  executiveLearning = null,
  executiveForecast = null,
  executiveStrategy = null,
  executiveCeo = null,
  crmExecutive = null,
  marketingExecutive = null,
  salesExecutive = null,
  financeExecutive = null,
  operationsExecutive = null,
  hrExecutive = null,
  legalExecutive = null,
  googleBusinessExecutive = null,
}: ExecutiveDashboardProps) {
  const statusWithTimestamp: ExecutiveStatus = {
    ...executiveStatus,
    lastAnalysis:
      status === "ready" ? brain.builtAt : executiveStatus.lastAnalysis,
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <SectionHeader
          headingLevel="h2"
          title="Command Center"
          description="Painéis operacionais do Executive Brain™"
        />
        <BrainStatusBadge status={status} />
      </div>

      <CommandPanel className="p-4 sm:p-5">
        <ExecutiveStatusSection
          status={statusWithTimestamp}
          brainStatusLabel={STATUS_LABELS[status]}
        />
      </CommandPanel>

      <CommandPanel className="p-4 sm:p-5">
        <ExecutiveCouncilSection council={council} />
      </CommandPanel>

      {(hasActiveAnalysis || isProcessing) && (
        <CommandPanel className="p-4 sm:p-5" accent={status === "building"}>
          <ExecutiveOrchestratorSection
            snapshot={orchestratorSnapshot}
            isProcessing={isProcessing}
          />
        </CommandPanel>
      )}

      {hasActiveAnalysis && !isProcessing && status === "ready" && (
        <CommandPanel className="p-4 sm:p-5">
          <ExecutiveReasoningSection
            reasoning={brain.reasoning}
            showFullAnalysis
          />
        </CommandPanel>
      )}

      <CommandPanel className="p-4 sm:p-5" accent>
        <ExecutiveCeoSection ceo={executiveCeo} />
      </CommandPanel>

      <CommandPanel className="p-4 sm:p-5" accent>
        <CrmExecutiveSummarySection crm={crmExecutive} />
      </CommandPanel>

      <CommandPanel className="p-4 sm:p-5" accent>
        <MarketingExecutiveSummarySection marketing={marketingExecutive} />
      </CommandPanel>

      <CommandPanel className="p-4 sm:p-5" accent>
        <SalesExecutiveSummarySection sales={salesExecutive} />
      </CommandPanel>

      <CommandPanel className="p-4 sm:p-5" accent>
        <FinanceExecutiveSummarySection finance={financeExecutive} />
      </CommandPanel>

      <CommandPanel className="p-4 sm:p-5" accent>
        <OperationsExecutiveSummarySection operations={operationsExecutive} />
      </CommandPanel>

      <CommandPanel className="p-4 sm:p-5" accent>
        <HrExecutiveSummarySection hr={hrExecutive} />
      </CommandPanel>

      <CommandPanel className="p-4 sm:p-5" accent>
        <LegalExecutiveSummarySection legal={legalExecutive} />
      </CommandPanel>

      <CommandPanel className="p-4 sm:p-5" accent>
        <GoogleBusinessExecutiveSummarySection googleBusiness={googleBusinessExecutive} />
      </CommandPanel>

      <CommandPanel className="p-4 sm:p-5" accent>
        <ExecutiveDecisionsSection decisions={executiveDecisions} />
      </CommandPanel>

      <CommandPanel className="p-4 sm:p-5" accent>
        <ExecutiveExecutionPlanSection plans={executionPlans} />
      </CommandPanel>

      <CommandPanel className="p-4 sm:p-5" accent>
        <ExecutiveMonitoringSection monitoring={executiveMonitoring} />
      </CommandPanel>

      <CommandPanel className="p-4 sm:p-5" accent>
        <ExecutiveLearningSection learning={executiveLearning} />
      </CommandPanel>

      <CommandPanel className="p-4 sm:p-5" accent>
        <ExecutiveForecastSection forecast={executiveForecast} />
      </CommandPanel>

      <CommandPanel className="p-4 sm:p-5" accent>
        <ExecutiveStrategySection strategy={executiveStrategy} />
      </CommandPanel>

      <CommandPanel className="p-4 sm:p-5">
        <ExecutiveIntelligenceSection intelligence={executiveIntelligence} />
      </CommandPanel>

      <CommandPanel className="p-4 sm:p-5">
        <ExecutiveMemorySection memories={executiveContext?.memories ?? []} />
      </CommandPanel>

      <CommandPanel className="p-4 sm:p-5">
        <ExecutiveContextSection
          context={brain.context}
          executiveContext={executiveContext}
        />
      </CommandPanel>

      {hasActiveAnalysis && status === "ready" && (
        <CommandPanel className="p-4 sm:p-5" accent>
          <ExecutiveActionPlanSection actionPlan={brain.actionPlan} />
        </CommandPanel>
      )}
    </div>
  );
}

function BrainStatusBadge({ status }: { status: ExecutiveBrainStatus }) {
  const styles: Record<ExecutiveBrainStatus, string> = {
    idle: "bg-zinc-500/10 text-muted ring-zinc-500/20",
    building: "bg-accent/10 text-accent ring-accent/20",
    ready: "bg-emerald-500/10 text-emerald-400 ring-emerald-500/20",
  };

  const dots: Record<ExecutiveBrainStatus, string> = {
    idle: "bg-zinc-500",
    building: "bg-accent animate-pulse",
    ready: "bg-emerald-400",
  };

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider ring-1 ring-inset",
        styles[status],
      )}
    >
      <span aria-hidden="true" className={cn("size-1.5 rounded-full", dots[status])} />
      {STATUS_LABELS[status]}
    </span>
  );
}
