import type { ReactNode } from "react";

import { cn } from "@/utils/cn";

import type { ExecutiveConversation } from "../../services/executive-conversation-orchestrator.service";
import {
  buildSamuelCeoResponse,
  formatConversationIntent,
} from "../../utils/build-samuel-ceo-response";
import { SectionHeader } from "../section-header";
import { StatusBadge } from "../shared/status-badge";

type ExecutiveConversationSectionProps = {
  conversation: ExecutiveConversation | null;
  isProcessing?: boolean;
  pendingQuestion?: string | null;
  companyName?: string;
};

function ConfidenceBar({ score }: { score: number }) {
  const level =
    score >= 75 ? "high" : score >= 50 ? "medium" : ("low" as const);

  const levelColors = {
    high: "text-emerald-400",
    medium: "text-amber-400",
    low: "text-red-400",
  };

  const barColors = {
    high: "bg-emerald-400",
    medium: "bg-amber-400",
    low: "bg-red-400",
  };

  const levelLabels = {
    high: "Alta",
    medium: "Média",
    low: "Baixa",
  };

  return (
    <div className="rounded-lg border border-border/60 bg-black/10 px-3 py-3">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className={cn("text-2xl font-semibold tabular-nums", levelColors[level])}>
            {score}
            <span className="text-sm text-muted">/100</span>
          </p>
          <p className="mt-0.5 text-[10px] uppercase tracking-wider text-muted">
            Confiança {levelLabels[level]}
          </p>
        </div>
        <div className="flex-1">
          <div className="h-2 overflow-hidden rounded-full bg-white/10">
            <div
              className={cn("h-full rounded-full transition-all", barColors[level])}
              style={{ width: `${score}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function ConversationBlock({
  title,
  accent = false,
  children,
}: {
  title: string;
  accent?: boolean;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border p-3",
        accent
          ? "border-accent/25 bg-accent/5"
          : "border-border bg-white/[0.02]",
      )}
    >
      <p
        className={cn(
          "mb-2 text-[10px] font-semibold uppercase tracking-wider",
          accent ? "text-accent" : "text-muted",
        )}
      >
        {title}
      </p>
      {children}
    </div>
  );
}

export function ExecutiveConversationSection({
  conversation,
  isProcessing = false,
  pendingQuestion = null,
  companyName,
}: ExecutiveConversationSectionProps) {
  if (!conversation && !isProcessing && !pendingQuestion) {
    return null;
  }

  const question =
    conversation?.request.question ?? pendingQuestion ?? "";
  const samuelResponse = conversation
    ? buildSamuelCeoResponse(conversation, companyName)
    : null;

  const consultedAreas = conversation
    ? [
        ...new Set(
          conversation.participatingExecutives
            .filter((participant) => participant.consulted)
            .map((participant) => participant.domain),
        ),
      ]
    : [];

  const alignmentLabels = {
    strong: "Forte",
    moderate: "Moderado",
    divergent: "Divergente",
  };

  return (
    <section className="flex flex-col gap-4">
      <SectionHeader
        title="Executive Conversation"
        description="Orquestração de módulos executivos por intenção"
      />

      <ConversationBlock title="Pergunta Recebida" accent>
        <p className="text-sm leading-relaxed text-foreground/90">
          {question || "—"}
        </p>
      </ConversationBlock>

      {isProcessing && !conversation && (
        <ConversationBlock title="Processamento" accent>
          <div className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className="size-2 animate-pulse rounded-full bg-accent"
            />
            <p className="text-xs text-muted">
              Identificando intenção e consultando módulos executivos…
            </p>
          </div>
        </ConversationBlock>
      )}

      {conversation && (
        <>
          <ConversationBlock title="Intenção Detectada">
            <div className="flex flex-wrap gap-2">
              <StatusBadge
                label={formatConversationIntent(conversation.primaryIntent)}
                variant="accent"
              />
              {conversation.detectedIntents.slice(1).map((intent) => (
                <StatusBadge
                  key={intent}
                  label={formatConversationIntent(intent)}
                  variant="muted"
                />
              ))}
            </div>
          </ConversationBlock>

          {consultedAreas.length > 0 && (
            <ConversationBlock title="Áreas Consultadas">
              <div className="flex flex-wrap gap-1.5">
                {consultedAreas.map((area) => (
                  <StatusBadge key={area} label={area} variant="muted" />
                ))}
              </div>
            </ConversationBlock>
          )}

          <ConversationBlock title="Executivos Consultados" accent>
            <ul className="flex flex-col gap-2">
              {conversation.participatingExecutives.map((participant) => {
                const statusVariant = participant.consulted
                  ? "success"
                  : "default";
                const statusLabel = participant.consulted
                  ? "Consultado"
                  : "Indisponível";

                return (
                  <li
                    key={participant.id}
                    className={cn(
                      "rounded-lg border px-3 py-2.5",
                      participant.consulted
                        ? "border-emerald-500/15 bg-emerald-500/5"
                        : "border-border bg-white/[0.02]",
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-xs font-medium text-foreground">
                          {participant.name}{" "}
                          <span className="font-normal text-muted">
                            ({participant.role})
                          </span>
                        </p>
                        <p className="mt-0.5 text-[10px] text-muted">
                          {participant.domain} · {participant.reason}
                        </p>
                        {participant.healthScore !== null && (
                          <p className="mt-1 text-[10px] text-foreground/70">
                            Saúde: {participant.healthScore}/100
                          </p>
                        )}
                      </div>
                      <StatusBadge label={statusLabel} variant={statusVariant} />
                    </div>
                  </li>
                );
              })}
            </ul>
          </ConversationBlock>

          {conversation.executiveReasoning && (
            <ConversationBlock title="Executive Reasoning" accent>
              <p className="mb-2 text-xs leading-relaxed text-foreground/90">
                {conversation.executiveReasoning.reasoningSummary}
              </p>
              <p className="mb-2 text-[11px] text-muted">
                {conversation.executiveReasoning.confidenceRationale}
              </p>
              <div className="flex flex-wrap gap-2">
                <StatusBadge
                  label={`${conversation.executiveReasoning.hypotheses.length} hipótese(s)`}
                  variant="muted"
                />
                <StatusBadge
                  label={`${conversation.executiveReasoning.evidence.length} evidência(s)`}
                  variant="muted"
                />
                <StatusBadge
                  label={`${conversation.executiveReasoning.conclusions.length} conclusão(ões)`}
                  variant="accent"
                />
              </div>
              {conversation.executiveReasoning.conclusions[0] && (
                <div className="mt-3 rounded-lg border border-border/60 bg-black/10 px-3 py-2.5">
                  <p className="text-xs font-medium text-foreground">
                    {conversation.executiveReasoning.conclusions[0].title}
                  </p>
                  <p className="mt-1 text-[11px] text-muted">
                    {conversation.executiveReasoning.conclusions[0].reason}
                  </p>
                </div>
              )}
            </ConversationBlock>
          )}

          <ConversationBlock title="Consenso Executivo" accent>
            <div className="mb-2 flex items-center gap-2">
              <StatusBadge
                label={`Alinhamento ${alignmentLabels[conversation.executiveConsensus.alignment]}`}
                variant={
                  conversation.executiveConsensus.alignment === "strong"
                    ? "success"
                    : conversation.executiveConsensus.alignment === "moderate"
                      ? "accent"
                      : "default"
                }
              />
            </div>
            <p className="text-sm leading-relaxed text-foreground/90">
              {conversation.executiveConsensus.narrative}
            </p>
            {conversation.executiveConsensus.sharedThemes.length > 0 && (
              <p className="mt-2 text-[11px] text-muted">
                Temas: {conversation.executiveConsensus.sharedThemes.join(", ")}
              </p>
            )}
            <p className="mt-2 text-xs font-medium text-accent">
              {conversation.executiveConsensus.primaryRecommendation}
            </p>
          </ConversationBlock>

          <ConversationBlock title="Confiança da Análise">
            <ConfidenceBar score={conversation.confidenceScore} />
          </ConversationBlock>

          <ConversationBlock title="Resumo Executivo">
            <p className="text-xs leading-relaxed text-foreground/80">
              {conversation.executiveSummary}
            </p>
          </ConversationBlock>

          {samuelResponse && (
            <ConversationBlock title="Resposta Final do Samuel" accent>
              <div className="mb-2 flex items-center gap-2 border-b border-border/50 pb-2">
                <div className="flex size-6 items-center justify-center rounded-md border border-accent/30 bg-accent/10">
                  <span className="text-[9px] font-bold text-accent">CEO</span>
                </div>
                <p className="text-xs font-semibold text-foreground">
                  Samuel AI™ — Tom Executivo
                </p>
              </div>
              <div className="space-y-1 text-sm leading-relaxed text-foreground/90">
                {samuelResponse.split("\n").map((line, index) => (
                  <p
                    key={`ceo-line-${index}`}
                    className={cn(
                      line.startsWith("Ação imediata") && "font-medium text-accent",
                      line.startsWith("Impacto esperado") && "text-emerald-400/90",
                    )}
                  >
                    {line}
                  </p>
                ))}
              </div>
            </ConversationBlock>
          )}
        </>
      )}
    </section>
  );
}
