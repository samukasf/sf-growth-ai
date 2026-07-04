import { cn } from "@/utils/cn";

import type {
  ExecutiveBrain,
  ExecutiveBrainStatus,
  ExecutiveCouncil,
  ExecutiveStatus,
} from "../../executive-brain/types";
import type { OrchestratorSnapshot } from "../../services/executive-orchestrator.types";
import { CommandPanel } from "../shared/command-panel";
import { SectionHeader } from "../section-header";
import { ExecutiveActionPlanSection } from "./executive-action-plan-section";
import { ExecutiveContextSection } from "./executive-context-section";
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

      <CommandPanel className="p-4 sm:p-5">
        <ExecutiveMemorySection memory={brain.memory} />
      </CommandPanel>

      <CommandPanel className="p-4 sm:p-5">
        <ExecutiveContextSection context={brain.context} />
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
