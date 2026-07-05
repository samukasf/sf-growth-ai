"use client";

import type { ReactNode } from "react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";

import type { ExecutiveBrain, ExecutiveBrainStatus } from "../../executive-brain/types";
import type { ExecutiveConversation } from "../../services/executive-conversation-orchestrator.service";
import type { ExecutiveCEO } from "../../services/executive-ceo.service";
import type { OrchestratorSnapshot } from "../../services/executive-orchestrator.types";
import { ExecutiveLiveBoard } from "../executive-live-board";
import { SectionHeader } from "../section-header";
import { StatusBadge } from "../shared/status-badge";
import { TimelineSteps, type TimelineStep } from "../shared/timeline-steps";
import { buildSamuelCeoResponse } from "../../utils/build-samuel-ceo-response";
import {
  EXPERIENCE_STATE_LABELS,
  EXPERIENCE_STATE_ORDER,
  formatDetectedIntents,
  isExperienceStateAtLeast,
  mapPhaseToExperienceState,
  type ExecutiveExperienceState,
} from "./executive-experience-states";

export type ExecutiveExperienceProps = {
  brain: ExecutiveBrain;
  brainStatus: ExecutiveBrainStatus;
  isProcessing?: boolean;
  orchestratorSnapshot?: OrchestratorSnapshot | null;
  executiveConversation?: ExecutiveConversation | null;
  pendingQuestion?: string | null;
  executiveCeo?: ExecutiveCEO | null;
  companyName?: string;
  analysisStartedAt?: number | null;
  analysisCompletedAt?: number | null;
  moduleAvailability?: Partial<
    Record<
      | "marketing"
      | "finance"
      | "sales"
      | "operations"
      | "hr"
      | "legal"
      | "google-business"
      | "google-analytics"
      | "search-console"
      | "meta"
      | "linkedin",
      boolean
    >
  >;
};

function ExperienceBlock({
  title,
  step,
  visible,
  accent = false,
  children,
}: {
  title: string;
  step: number;
  visible: boolean;
  accent?: boolean;
  children: ReactNode;
}) {
  if (!visible) return null;

  return (
    <div
      className={cn(
        "rounded-lg border p-4 transition-all duration-300",
        accent
          ? "border-accent/25 bg-accent/5"
          : "border-border bg-white/[0.02]",
      )}
    >
      <div className="mb-2 flex items-center gap-2">
        <span className="flex size-5 items-center justify-center rounded-full border border-border bg-black/20 text-[10px] font-semibold text-muted">
          {step}
        </span>
        <p
          className={cn(
            "text-[10px] font-semibold uppercase tracking-wider",
            accent ? "text-accent" : "text-muted",
          )}
        >
          {title}
        </p>
      </div>
      {children}
    </div>
  );
}

function ExperienceStateBar({ currentState }: { currentState: ExecutiveExperienceState }) {
  if (currentState === "idle") return null;

  return (
    <div className="flex flex-wrap gap-1.5">
      {EXPERIENCE_STATE_ORDER.map((state) => {
        const isActive = state === currentState;
        const isPast =
          EXPERIENCE_STATE_ORDER.indexOf(state) <
          EXPERIENCE_STATE_ORDER.indexOf(currentState);

        return (
          <StatusBadge
            key={state}
            label={EXPERIENCE_STATE_LABELS[state]}
            variant={isActive ? "accent" : isPast ? "success" : "muted"}
          />
        );
      })}
    </div>
  );
}

export function ExecutiveExperience({
  brain,
  brainStatus,
  isProcessing = false,
  orchestratorSnapshot = null,
  executiveConversation = null,
  pendingQuestion = null,
  executiveCeo = null,
  companyName,
  analysisStartedAt = null,
  analysisCompletedAt = null,
  moduleAvailability = {},
}: ExecutiveExperienceProps) {
  const [executionRequested, setExecutionRequested] = useState(false);

  const question =
    executiveConversation?.request.question ?? pendingQuestion ?? "";
  const hasQuestion = Boolean(question);
  const experienceState = mapPhaseToExperienceState(
    isProcessing,
    brainStatus,
    orchestratorSnapshot?.phase,
    hasQuestion,
  );

  if (experienceState === "idle") {
    return null;
  }

  const samuelResponse = executiveConversation
    ? buildSamuelCeoResponse(executiveConversation, companyName)
    : null;

  type DisplayExecutive = {
    id: string;
    name: string;
    role: string;
    consulted?: boolean;
  };

  const convenedFromSnapshot: DisplayExecutive[] = (
    orchestratorSnapshot?.consultedExecutives ?? []
  ).map((executive) => ({
    id: executive.id,
    name: executive.name,
    role: executive.role,
    consulted: executive.status === "consulted",
  }));

  const consultedExecutives: DisplayExecutive[] = (
    executiveConversation?.participatingExecutives.filter(
      (participant) => participant.consulted,
    ) ?? []
  ).map((participant) => ({
    id: participant.id,
    name: participant.name,
    role: participant.role,
    consulted: participant.consulted,
  }));

  const displayExecutives: DisplayExecutive[] =
    consultedExecutives.length > 0
      ? consultedExecutives
      : convenedFromSnapshot.length > 0
        ? convenedFromSnapshot
        : (executiveConversation?.participatingExecutives ?? []).map(
            (participant) => ({
              id: participant.id,
              name: participant.name,
              role: participant.role,
              consulted: participant.consulted,
            }),
          );

  const actionPlan = orchestratorSnapshot?.actionPlan ?? brain.actionPlan;
  const priorities =
    executiveCeo?.topPriorities ??
    executiveConversation?.executiveReasoning?.conclusions[0]?.positiveImpacts ??
    [];

  const confidenceScore =
    executiveConversation?.confidenceScore ??
    orchestratorSnapshot?.confidence?.score ??
    null;

  const timelineSteps: TimelineStep[] = [
    {
      id: "question",
      order: 1,
      title: "Pergunta recebida",
      description: question,
      status: isExperienceStateAtLeast(experienceState, "receiving")
        ? "completed"
        : "pending",
    },
    {
      id: "intent",
      order: 2,
      title: "Intenção detectada",
      description: executiveConversation
        ? formatDetectedIntents(question)
        : formatDetectedIntents(question),
      status: isExperienceStateAtLeast(experienceState, "analyzing")
        ? experienceState === "analyzing" && isProcessing
          ? "in_progress"
          : "completed"
        : "pending",
    },
    {
      id: "executives",
      order: 3,
      title: "Executivos convocados",
      description: `${displayExecutives.length} executivo(s) mobilizado(s)`,
      status: isExperienceStateAtLeast(experienceState, "consulting-executives")
        ? experienceState === "consulting-executives" && isProcessing
          ? "in_progress"
          : "completed"
        : "pending",
    },
    {
      id: "modules",
      order: 4,
      title: "Módulos analisando",
      description: "Consulta cruzada entre áreas executivas",
      status: isExperienceStateAtLeast(experienceState, "consulting-executives")
        ? experienceState === "consulting-executives" && isProcessing
          ? "in_progress"
          : "completed"
        : "pending",
    },
    {
      id: "reasoning",
      order: 5,
      title: "Raciocínio executivo",
      description:
        executiveConversation?.executiveReasoning?.reasoningSummary ??
        "Construindo hipóteses e evidências",
      status: isExperienceStateAtLeast(experienceState, "building-consensus")
        ? experienceState === "building-consensus" && isProcessing
          ? "in_progress"
          : "completed"
        : "pending",
    },
    {
      id: "consensus",
      order: 6,
      title: "Consenso executivo",
      description:
        executiveConversation?.executiveConsensus.narrative ??
        orchestratorSnapshot?.consensus ??
        "Sintetizando posicionamento do conselho",
      status: isExperienceStateAtLeast(experienceState, "building-consensus")
        ? experienceState === "building-consensus" && isProcessing
          ? "in_progress"
          : "completed"
        : "pending",
    },
    {
      id: "action-plan",
      order: 7,
      title: "Plano de ação",
      description: actionPlan?.summary ?? "Montando sequência de execução",
      status: isExperienceStateAtLeast(experienceState, "preparing-action-plan")
        ? experienceState === "preparing-action-plan" && isProcessing
          ? "in_progress"
          : "completed"
        : "pending",
    },
    {
      id: "priorities",
      order: 8,
      title: "Prioridades",
      description: priorities.slice(0, 2).join(" · ") || "Definindo prioridades",
      status: isExperienceStateAtLeast(experienceState, "preparing-action-plan")
        ? experienceState === "preparing-action-plan" && isProcessing
          ? "in_progress"
          : "completed"
        : "pending",
    },
    {
      id: "confidence",
      order: 9,
      title: "Confiança da análise",
      description:
        confidenceScore !== null
          ? `Confiança consolidada: ${confidenceScore}/100`
          : "Calculando confiança executiva",
      status: isExperienceStateAtLeast(experienceState, "ready")
        ? "completed"
        : isExperienceStateAtLeast(experienceState, "building-consensus")
          ? "in_progress"
          : "pending",
    },
    {
      id: "response",
      order: 10,
      title: "Resposta final do Samuel AI",
      description: samuelResponse?.split("\n")[0] ?? "Preparando diretriz do CEO Digital",
      status: isExperienceStateAtLeast(experienceState, "ready")
        ? "completed"
        : "pending",
    },
  ];

  return (
    <section className="flex flex-col gap-5">
      <div className="flex flex-col gap-3">
        <SectionHeader
          title="Samuel AI v1 — Executive Experience"
          description="CEO Digital · fluxo executivo em tempo real"
        />
        <ExperienceStateBar currentState={experienceState} />
      </div>

      <ExecutiveLiveBoard
        brainStatus={brainStatus}
        isProcessing={isProcessing}
        orchestratorPhase={orchestratorSnapshot?.phase ?? null}
        executiveCeo={executiveCeo}
        executiveConversation={executiveConversation}
        analysisStartedAt={analysisStartedAt}
        analysisCompletedAt={analysisCompletedAt}
        moduleAvailability={moduleAvailability}
      />

      <ExperienceBlock
        step={1}
        title="Pergunta Recebida"
        visible={isExperienceStateAtLeast(experienceState, "receiving")}
        accent
      >
        <p className="text-sm leading-relaxed text-foreground/90">{question}</p>
      </ExperienceBlock>

      <ExperienceBlock
        step={2}
        title="Intenção Detectada"
        visible={isExperienceStateAtLeast(experienceState, "analyzing")}
      >
        <StatusBadge label={formatDetectedIntents(question)} variant="accent" />
      </ExperienceBlock>

      <ExperienceBlock
        step={3}
        title="Executivos Convocados"
        visible={isExperienceStateAtLeast(experienceState, "consulting-executives")}
        accent={experienceState === "consulting-executives"}
      >
        <ul className="flex flex-col gap-1.5">
          {displayExecutives.map((executive) => (
            <li
              key={executive.id}
              className="flex items-center justify-between gap-2 rounded-lg border border-border/60 bg-black/10 px-3 py-2"
            >
              <div>
                <p className="text-xs font-medium text-foreground">{executive.name}</p>
                <p className="text-[10px] text-muted">{executive.role}</p>
              </div>
              <StatusBadge
                label={
                  experienceState === "ready" ||
                  (executive.consulted && !isProcessing)
                    ? "READY"
                    : "ANALYZING"
                }
                variant={
                  experienceState === "ready" ||
                  (executive.consulted && !isProcessing)
                    ? "success"
                    : "accent"
                }
              />
            </li>
          ))}
        </ul>
      </ExperienceBlock>

      <ExperienceBlock
        step={4}
        title="Módulos Analisando"
        visible={isExperienceStateAtLeast(experienceState, "consulting-executives")}
      >
        <div className="flex flex-wrap gap-1.5">
          {(
            [
              "marketing",
              "finance",
              "sales",
              "operations",
              "hr",
              "legal",
              "google-business",
              "google-analytics",
              "search-console",
              "meta",
              "linkedin",
            ] as const
          ).map((moduleId) => {
            const labels: Record<typeof moduleId, string> = {
              marketing: "Marketing",
              finance: "Finance",
              sales: "Sales",
              operations: "Operations",
              hr: "HR",
              legal: "Legal",
              "google-business": "Google Business",
              "google-analytics": "Google Analytics",
              "search-console": "Search Console",
              meta: "Meta",
              linkedin: "LinkedIn",
            };
            const isReady =
              experienceState === "ready" ||
              (!isProcessing &&
                executiveConversation?.participatingExecutives.some(
                  (participant) =>
                    participant.id === moduleId && participant.consulted,
                ));
            const isAnalyzing =
              isProcessing &&
              isExperienceStateAtLeast(experienceState, "consulting-executives") &&
              !isReady;

            return (
              <StatusBadge
                key={moduleId}
                label={`${labels[moduleId]} · ${isReady ? "READY" : isAnalyzing ? "ANALYZING" : "ONLINE"}`}
                variant={isReady ? "success" : isAnalyzing ? "accent" : "muted"}
              />
            );
          })}
        </div>
      </ExperienceBlock>

      <ExperienceBlock
        step={5}
        title="Raciocínio Executivo"
        visible={isExperienceStateAtLeast(experienceState, "building-consensus")}
        accent={experienceState === "building-consensus"}
      >
        {executiveConversation?.executiveReasoning ? (
          <div className="space-y-2">
            <p className="text-sm leading-relaxed text-foreground/90">
              {executiveConversation.executiveReasoning.reasoningSummary}
            </p>
            {executiveConversation.executiveReasoning.conclusions[0] && (
              <div className="rounded-lg border border-border/60 bg-black/10 px-3 py-2.5">
                <p className="text-xs font-medium text-foreground">
                  {executiveConversation.executiveReasoning.conclusions[0].title}
                </p>
                <p className="mt-1 text-[11px] text-muted">
                  {executiveConversation.executiveReasoning.conclusions[0].justification}
                </p>
              </div>
            )}
          </div>
        ) : (
          <p className="text-xs text-muted">
            Consolidando hipóteses, evidências e trade-offs…
          </p>
        )}
      </ExperienceBlock>

      <ExperienceBlock
        step={6}
        title="Consenso Executivo"
        visible={isExperienceStateAtLeast(experienceState, "building-consensus")}
      >
        <p className="text-sm leading-relaxed text-foreground/90">
          {executiveConversation?.executiveConsensus.narrative ??
            orchestratorSnapshot?.consensus ??
            "Formando alinhamento entre executivos consultados…"}
        </p>
        {(executiveConversation?.executiveConsensus.primaryRecommendation ||
          actionPlan?.actions[0]?.title) && (
          <p className="mt-2 text-xs font-medium text-accent">
            {executiveConversation?.executiveConsensus.primaryRecommendation ??
              actionPlan?.actions[0]?.title}
          </p>
        )}
      </ExperienceBlock>

      <ExperienceBlock
        step={7}
        title="Plano de Ação"
        visible={isExperienceStateAtLeast(experienceState, "preparing-action-plan")}
        accent={experienceState === "preparing-action-plan"}
      >
        {actionPlan ? (
          <div className="space-y-2">
            <p className="text-sm text-foreground/90">{actionPlan.summary}</p>
            <ul className="flex flex-col gap-1.5">
              {actionPlan.actions.slice(0, 3).map((action, index) => (
                <li
                  key={action.id}
                  className="rounded-lg border border-border/60 bg-black/10 px-3 py-2 text-[11px]"
                >
                  <span className="font-medium text-foreground">
                    {index + 1}. {action.title}
                  </span>
                  <p className="mt-0.5 text-muted">{action.timeframe}</p>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-xs text-muted">Estruturando plano de execução…</p>
        )}
      </ExperienceBlock>

      <ExperienceBlock
        step={8}
        title="Prioridades"
        visible={isExperienceStateAtLeast(experienceState, "preparing-action-plan")}
      >
        <ul className="flex flex-col gap-1.5">
          {priorities.slice(0, 4).map((priority, index) => (
            <li
              key={`${priority}-${index}`}
              className="rounded-lg border border-border/60 bg-black/10 px-3 py-2 text-xs text-foreground/90"
            >
              {index + 1}. {priority}
            </li>
          ))}
        </ul>
      </ExperienceBlock>

      <ExperienceBlock
        step={9}
        title="Confiança da Análise"
        visible={isExperienceStateAtLeast(experienceState, "building-consensus")}
      >
        <p className="text-2xl font-semibold text-foreground">
          {confidenceScore !== null ? confidenceScore : "—"}
          <span className="text-sm text-muted">/100</span>
        </p>
      </ExperienceBlock>

      <ExperienceBlock
        step={10}
        title="Resposta Final do Samuel AI"
        visible={isExperienceStateAtLeast(experienceState, "ready")}
        accent
      >
        {samuelResponse ? (
          <div className="space-y-2 text-sm leading-relaxed text-foreground/90">
            {samuelResponse.split("\n").map((line, index) => (
              <p
                key={`response-${index}`}
                className={cn(
                  line.startsWith("Diretriz") && "text-base font-semibold text-foreground",
                  line.startsWith("Ação imediata") && "font-medium text-accent",
                  line.startsWith("Impacto") && "text-emerald-400/90",
                  line.length === 0 && "h-1",
                )}
              >
                {line}
              </p>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted">Finalizando diretriz executiva…</p>
        )}

        {isExperienceStateAtLeast(experienceState, "ready") && (
          <div className="mt-4 border-t border-border/50 pt-4">
            <Button
              type="button"
              onClick={() => setExecutionRequested(true)}
              className="w-full sm:w-auto"
            >
              Executar Plano
            </Button>
            {executionRequested && (
              <p className="mt-2 text-xs font-medium text-amber-400">
                Execução aguardando autorização
              </p>
            )}
          </div>
        )}
      </ExperienceBlock>

      <div className="rounded-lg border border-border bg-white/[0.02] p-4">
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-muted">
          Fluxo Executivo
        </p>
        <TimelineSteps steps={timelineSteps} />
      </div>
    </section>
  );
}
