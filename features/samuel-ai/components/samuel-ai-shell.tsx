"use client";

import { useCallback, useState } from "react";

import { buildExecutiveBrainFromSnapshot } from "../executive-brain/build-executive-brain";
import {
  DEFAULT_EXECUTIVE_BRAIN,
  getTimeGreeting,
  MOCK_EXECUTIVE_BRIEFING,
  MOCK_EXECUTIVE_COUNCIL,
  MOCK_EXECUTIVE_STATUS,
} from "../executive-brain";
import type { ExecutiveBrain, ExecutiveBrainStatus } from "../executive-brain/types";
import { MOCK_CHAT_MESSAGES } from "../mock-data";
import {
  buildOrchestratorSnapshot,
  generateOrchestratorResponse,
  snapshotToBrain,
} from "../services/executive-orchestrator.service";
import type {
  OrchestratorPhase,
  OrchestratorSnapshot,
} from "../services/executive-orchestrator.types";
import type { ExecutiveContext as CompanyExecutiveContext } from "@/services/executive-context.service";
import { ChatPanel } from "./chat-panel";
import {
  ExecutiveBriefingSection,
  ExecutiveDashboard,
} from "./executive-dashboard";
import { CommandPanel } from "./shared/command-panel";

const ORCHESTRATION_PHASES: OrchestratorPhase[] = [
  "building_context",
  "selecting_executives",
  "running_analysis",
  "building_consensus",
  "building_action_plan",
  "complete",
];

const PHASE_DELAY_MS = 450;

function delay(ms: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
}

type SamuelAiShellProps = {
  executiveContext?: CompanyExecutiveContext | null;
};

export function SamuelAiShell({ executiveContext = null }: SamuelAiShellProps) {
  const [executiveBrain, setExecutiveBrain] =
    useState<ExecutiveBrain>(DEFAULT_EXECUTIVE_BRAIN);
  const [brainStatus, setBrainStatus] = useState<ExecutiveBrainStatus>("idle");
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasActiveAnalysis, setHasActiveAnalysis] = useState(false);
  const [orchestratorSnapshot, setOrchestratorSnapshot] =
    useState<OrchestratorSnapshot | null>(null);

  const briefing = {
    ...MOCK_EXECUTIVE_BRIEFING,
    greeting: getTimeGreeting(),
  };

  const handleFirstMessage = useCallback(() => {
    setHasActiveAnalysis(true);
  }, []);

  const handleSendMessage = useCallback(
    async (content: string) => {
      setIsProcessing(true);
      setBrainStatus("building");
      setHasActiveAnalysis(true);

      for (const phase of ORCHESTRATION_PHASES) {
        const snapshot = buildOrchestratorSnapshot(
          content,
          phase,
          executiveContext,
        );
        setOrchestratorSnapshot(snapshot);
        setExecutiveBrain(
          buildExecutiveBrainFromSnapshot(content, phase, executiveContext),
        );

        if (phase !== "complete") {
          await delay(PHASE_DELAY_MS);
        }
      }

      const finalSnapshot = buildOrchestratorSnapshot(
        content,
        "complete",
        executiveContext,
      );
      const brain = snapshotToBrain(finalSnapshot);

      setOrchestratorSnapshot(finalSnapshot);
      setExecutiveBrain(brain);
      setBrainStatus("ready");
      setIsProcessing(false);

      return generateOrchestratorResponse(brain, executiveContext);
    },
    [executiveContext],
  );

  return (
    <div className="relative flex min-h-dvh flex-col xl:h-dvh xl:overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_40%_at_50%_-10%,rgba(59,130,246,0.12),transparent_55%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.02)_0%,transparent_30%)]"
      />

      <header className="relative z-10 shrink-0 border-b border-white/[0.06] bg-black/40 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1800px] items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <div className="flex items-center gap-4">
            <div className="hidden size-10 items-center justify-center rounded-lg border border-accent/30 bg-accent/10 sm:flex">
              <span className="text-xs font-bold tracking-wider text-accent">
                ECC
              </span>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-accent">
                SF Growth AI
              </p>
              <h1 className="text-lg font-semibold tracking-tight text-foreground sm:text-xl">
                Executive Command Center
              </h1>
              <p className="mt-0.5 text-xs text-muted">
                Samuel AI™ — Inteligência Executiva
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-3 py-1.5 sm:flex">
              <span
                aria-hidden="true"
                className="size-2 rounded-full bg-emerald-400"
              />
              <span className="text-[11px] text-emerald-400">Sistema operacional</span>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-border bg-white/[0.03] px-3 py-1.5">
              <span
                aria-hidden="true"
                className="size-1.5 rounded-full bg-accent"
              />
              <span className="text-[11px] text-muted">Demonstração</span>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-[1800px] flex-1 flex-col gap-5 p-5 sm:p-6 xl:min-h-0 xl:flex-row xl:overflow-hidden">
        <div className="flex min-h-0 flex-1 flex-col gap-5 xl:overflow-y-auto">
          <CommandPanel accent className="p-5 sm:p-6">
            <ExecutiveBriefingSection briefing={briefing} />
          </CommandPanel>

          <CommandPanel className="flex min-h-[min(420px,55dvh)] flex-1 flex-col overflow-hidden p-0 xl:min-h-[400px]">
            <div className="shrink-0 border-b border-border px-5 py-4 sm:px-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-accent">
                Canal Executivo
              </p>
              <h2 className="mt-0.5 text-sm font-semibold text-foreground">
                Diretrizes & Análises
              </h2>
              <p className="mt-0.5 text-xs text-muted">
                Executive Orchestrator processa cada diretriz antes de responder
              </p>
            </div>
            <div className="min-h-0 flex-1 overflow-hidden">
              <ChatPanel
                initialMessages={MOCK_CHAT_MESSAGES}
                isProcessing={isProcessing}
                onSendMessage={handleSendMessage}
                onFirstMessage={handleFirstMessage}
              />
            </div>
          </CommandPanel>
        </div>

        <aside className="flex w-full shrink-0 flex-col xl:w-[400px] xl:min-h-0 xl:overflow-y-auto 2xl:w-[420px]">
          <ExecutiveDashboard
            brain={executiveBrain}
            status={brainStatus}
            executiveStatus={MOCK_EXECUTIVE_STATUS}
            council={MOCK_EXECUTIVE_COUNCIL}
            hasActiveAnalysis={hasActiveAnalysis}
            orchestratorSnapshot={orchestratorSnapshot}
            isProcessing={isProcessing}
            executiveContext={executiveContext}
          />
        </aside>
      </main>
    </div>
  );
}
