import type { ReactNode } from "react";

import { StatusBadge } from "@/features/samuel-ai/components/shared/status-badge";
import type { RuntimeResponse } from "@/features/samuel-runtime";

import { ExecutionTimeline } from "./execution-timeline";
import { InspectorSection } from "./inspector-section";
import { PipelineStepTracker } from "./pipeline-step-tracker";

type PipelineInspectorPanelProps = {
  runtime: RuntimeResponse;
  /** Tempo total medido no navegador (envio → resposta). Ver nota em `formatClientLatency`. */
  clientLatencyMs: number;
};

type BadgeVariant = "default" | "success" | "warning" | "accent" | "muted";

const INTENT_BADGE_VARIANT: Record<RuntimeResponse["intent"]["category"], BadgeVariant> = {
  BUSINESS: "accent",
  GENERAL_KNOWLEDGE: "muted",
  HYBRID: "warning",
  AUTOMATION: "success",
  ANALYSIS: "accent",
  CREATION: "success",
};

function formatMs(ms?: number): string {
  if (ms == null) return "—";
  return ms < 1000 ? `${Math.round(ms)} ms` : `${(ms / 1000).toFixed(2)} s`;
}

function formatUsd(value?: number): string {
  if (value == null) return "—";
  return `US$ ${value.toFixed(6)}`;
}

function formatTokens(value?: number): string {
  return value == null ? "—" : value.toLocaleString("pt-BR");
}

/** Score já expresso em 0–100 (companyBrain.confidence, decision.confidence, response.confidence.score). */
function formatScore(value: number): string {
  return `${Math.round(value)}%`;
}

/** Confiança do Intent Router — única em escala 0–1 no RuntimeResponse. */
function formatFraction(value: number): string {
  return `${Math.round(value * 100)}%`;
}

function KeyValue({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border/60 py-2 text-sm last:border-b-0">
      <span className="text-muted">{label}</span>
      <span className="text-right font-medium text-foreground">{value}</span>
    </div>
  );
}

/**
 * Detalhamento completo de uma execução do Samuel Runtime — só leitura dos
 * campos já devolvidos por `/api/samuel/runtime` (nenhum dado inventado ou
 * calculado no backend). O único valor calculado no cliente é
 * `clientLatencyMs` (round-trip da requisição), explicitado como tal.
 */
export function PipelineInspectorPanel({ runtime, clientLatencyMs }: PipelineInspectorPanelProps) {
  const councilConsulted = runtime.executiveCouncil.memberCount > 0;

  return (
    <div className="space-y-3">
      <InspectorSection
        title="Status"
        badge={<StatusBadge label="Sucesso" variant="success" />}
      >
        <KeyValue label="Executado em" value={new Date(runtime.generatedAt).toLocaleString("pt-BR")} />
        <KeyValue label="Erros" value="Nenhum" />
        <KeyValue label="Tempo total (round-trip no navegador)" value={formatMs(clientLatencyMs)} />
      </InspectorSection>

      <InspectorSection
        title="Execution Timeline"
        badge={<StatusBadge label="8 etapas oficiais" variant="muted" />}
      >
        <ExecutionTimeline runtime={runtime} />
      </InspectorSection>

      <InspectorSection
        title="Pipeline (fases internas do Samuel Runtime)"
        badge={<StatusBadge label={`${runtime.pipeline.length} etapas`} variant="muted" />}
        defaultOpen={false}
      >
        <PipelineStepTracker steps={runtime.pipeline} />
      </InspectorSection>

      <InspectorSection
        title="Intent identificado"
        badge={
          <StatusBadge
            label={runtime.intent.category}
            variant={INTENT_BADGE_VARIANT[runtime.intent.category] ?? "default"}
          />
        }
      >
        <KeyValue label="Confiança" value={formatFraction(runtime.intent.confidence)} />
        <p className="mt-2 text-sm text-foreground/80">{runtime.intent.justification}</p>
      </InspectorSection>

      <InspectorSection title="Contexto utilizado">
        <KeyValue label="Objetivo detectado" value={runtime.context.objective} />
        {runtime.context.fields.length > 0 && (
          <ul className="mt-2 space-y-1.5">
            {runtime.context.fields.map((field) => (
              <li key={field.label} className="text-sm">
                <span className="text-muted">{field.label}: </span>
                <span className="text-foreground/90">{field.value}</span>
              </li>
            ))}
          </ul>
        )}
      </InspectorSection>

      <InspectorSection
        title="Memórias recuperadas"
        badge={<StatusBadge label={`${runtime.memory.insights.length} insights`} variant="muted" />}
      >
        <p className="text-sm text-foreground/80">{runtime.memory.summary}</p>
        {runtime.memory.insights.length > 0 && (
          <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-foreground/70">
            {runtime.memory.insights.map((insight) => (
              <li key={insight}>{insight}</li>
            ))}
          </ul>
        )}
      </InspectorSection>

      <InspectorSection
        title="Company Brain consultado"
        badge={
          <StatusBadge
            label={runtime.companyBrain.status === "active" ? "Ativo" : "Inativo"}
            variant={runtime.companyBrain.status === "active" ? "success" : "warning"}
          />
        }
      >
        <KeyValue label="Confiança" value={formatScore(runtime.companyBrain.confidence)} />
        <p className="mt-2 text-sm text-foreground/80">{runtime.companyBrain.headline}</p>
        {runtime.companyBrain.facts.length > 0 && (
          <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-foreground/70">
            {runtime.companyBrain.facts.map((fact) => (
              <li key={fact}>{fact}</li>
            ))}
          </ul>
        )}
      </InspectorSection>

      <InspectorSection
        title="Executive Council"
        badge={
          <StatusBadge
            label={councilConsulted ? `${runtime.executiveCouncil.memberCount} membros` : "Não consultado"}
            variant={councilConsulted ? "success" : "muted"}
          />
        }
      >
        {councilConsulted ? (
          <>
            <p className="text-sm text-foreground/80">{runtime.executiveCouncil.consensus}</p>
            {runtime.executiveCouncil.specialists.length > 0 && (
              <ul className="mt-2 space-y-1.5">
                {runtime.executiveCouncil.specialists.map((specialist) => (
                  <li key={`${specialist.role}-${specialist.name}`} className="text-sm">
                    <span className="font-medium text-foreground">{specialist.name}</span>
                    <span className="text-muted"> ({specialist.role}): </span>
                    <span className="text-foreground/80">{specialist.summary}</span>
                  </li>
                ))}
              </ul>
            )}
          </>
        ) : (
          <p className="text-sm text-muted">O Executive Council não foi consultado nesta execução.</p>
        )}
      </InspectorSection>

      <InspectorSection
        title="Provider · Modelo · Custo"
        badge={
          <StatusBadge
            label={runtime.aiGateway.used ? "IA real" : "Fallback heurístico"}
            variant={runtime.aiGateway.used ? "success" : "warning"}
          />
        }
      >
        <KeyValue label="Provider" value={runtime.aiGateway.providerId ?? "—"} />
        <KeyValue label="Tipo de provider" value={runtime.aiGateway.providerType ?? "—"} />
        <KeyValue label="Modelo" value={runtime.aiGateway.model ?? "—"} />
        <KeyValue label="Operação" value={runtime.aiGateway.operation ?? "—"} />
        <KeyValue label="Tokens de entrada" value={formatTokens(runtime.aiGateway.promptTokens)} />
        <KeyValue label="Tokens de saída" value={formatTokens(runtime.aiGateway.completionTokens)} />
        <KeyValue label="Custo estimado" value={formatUsd(runtime.aiGateway.estimatedCostUsd)} />
        <KeyValue label="Latência do AI Gateway" value={formatMs(runtime.aiGateway.latencyMs)} />
        <KeyValue
          label="Tempo total (round-trip no navegador)"
          value={formatMs(clientLatencyMs)}
        />
        {runtime.aiGateway.fallbackUsed && (
          <p className="mt-2 text-xs text-amber-400">
            Fallback heurístico foi usado nesta chamada (Gateway indisponível).
          </p>
        )}
      </InspectorSection>

      <InspectorSection
        title="Conversation Memory"
        badge={
          <StatusBadge
            label={`${runtime.conversationMemory.turnCount} turno(s)`}
            variant={runtime.conversationMemory.turnCount > 0 ? "success" : "muted"}
          />
        }
      >
        <KeyValue label="Conversation ID" value={runtime.conversationMemory.conversationId} />
        <KeyValue label="Contexto ativo" value={runtime.conversationMemory.activeContext ?? "—"} />
        <KeyValue label="Última intenção" value={runtime.conversationMemory.lastIntent ?? "—"} />
        <KeyValue label="Última ferramenta" value={runtime.conversationMemory.lastTool ?? "—"} />
        <KeyValue label="Último resultado" value={runtime.conversationMemory.lastResult ?? "—"} />
        {runtime.conversationMemory.entities.length > 0 && (
          <>
            <p className="mt-2 text-xs text-muted">Entidades mencionadas:</p>
            <p className="mt-1 text-sm text-foreground/80">
              {runtime.conversationMemory.entities.join(", ")}
            </p>
          </>
        )}
        {runtime.conversationMemory.autoSummary && (
          <>
            <p className="mt-2 text-xs text-muted">Resumo automático:</p>
            <p className="mt-1 text-sm text-foreground/80">{runtime.conversationMemory.autoSummary}</p>
          </>
        )}
      </InspectorSection>

      <InspectorSection title="Decisão">
        <KeyValue label="Título" value={runtime.decision.title} />
        <KeyValue label="Prioridade" value={runtime.decision.priority} />
        <KeyValue label="Confiança" value={formatScore(runtime.decision.confidence)} />
        <p className="mt-2 text-sm text-foreground/80">{runtime.decision.rationale}</p>
        <p className="mt-1 text-sm text-foreground/70">Próxima ação: {runtime.decision.nextAction}</p>
      </InspectorSection>

      <InspectorSection
        title="Tool Execution"
        badge={
          <StatusBadge
            label={
              !runtime.tooling.attempted
                ? "Nenhuma ferramenta necessária"
                : runtime.tooling.status === "success"
                  ? "Sucesso"
                  : "Falhou"
            }
            variant={
              !runtime.tooling.attempted
                ? "muted"
                : runtime.tooling.status === "success"
                  ? "success"
                  : "warning"
            }
          />
        }
      >
        {runtime.tooling.attempted ? (
          <>
            <KeyValue label="Ferramenta selecionada" value={runtime.tooling.toolName ?? "—"} />
            <KeyValue label="Duração" value={formatMs(runtime.tooling.durationMs)} />
            <KeyValue label="Status" value={runtime.tooling.status === "success" ? "Sucesso" : "Erro"} />
            <p className="mt-2 text-sm text-foreground/80">
              <span className="text-muted">Motivo da seleção: </span>
              {runtime.tooling.reason}
            </p>
            <p className="mt-2 text-xs text-muted">Input:</p>
            <pre className="mt-1 overflow-x-auto rounded-md border border-border/60 bg-white/[0.02] p-2 text-xs text-foreground/80">
              {JSON.stringify(runtime.tooling.input, null, 2)}
            </pre>
            {runtime.tooling.status === "success" ? (
              <>
                <p className="mt-2 text-xs text-muted">Resultado:</p>
                <pre className="mt-1 overflow-x-auto rounded-md border border-border/60 bg-white/[0.02] p-2 text-xs text-foreground/80">
                  {JSON.stringify(runtime.tooling.output, null, 2)}
                </pre>
              </>
            ) : (
              <p className="mt-2 text-sm text-amber-400">{runtime.tooling.error}</p>
            )}
          </>
        ) : (
          <p className="text-sm text-muted">
            Nenhuma ferramenta do Tool Orchestrator foi necessária para responder esta pergunta.
          </p>
        )}
      </InspectorSection>

      <InspectorSection title="Resposta final">
        <p className="text-sm font-medium text-foreground">{runtime.response.headline}</p>
        <p className="mt-2 whitespace-pre-wrap text-sm text-foreground/85">{runtime.response.narrative}</p>
        <KeyValue label="Confiança da resposta" value={formatScore(runtime.response.confidence.score)} />
        {runtime.response.actions.length > 0 && (
          <ul className="mt-3 space-y-2">
            {runtime.response.actions.map((action) => (
              <li
                key={action.title}
                className="rounded-md border border-border/60 bg-white/[0.02] p-2.5 text-sm"
              >
                <p className="font-medium text-foreground">{action.title}</p>
                <p className="mt-0.5 text-foreground/70">{action.description}</p>
                <p className="mt-1 text-xs text-muted">
                  {action.priority} · {action.timeframe}
                </p>
              </li>
            ))}
          </ul>
        )}
      </InspectorSection>
    </div>
  );
}
