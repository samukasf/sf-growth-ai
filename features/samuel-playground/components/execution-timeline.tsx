import { StatusBadge } from "@/features/samuel-ai/components/shared/status-badge";
import type { RuntimePhase, RuntimeResponse } from "@/features/samuel-runtime";

type TimelineRowStatus = "complete" | "running" | "pending" | "partial" | "not_instrumented";

type ExecutionTimelineRow = {
  label: string;
  startedAt?: string;
  completedAt?: string;
  durationMs?: number;
  status: TimelineRowStatus;
  note?: string;
};

/**
 * Mapeamento das 6 etapas oficiais da Execution Timeline que já correspondem
 * a uma fase real e instrumentada do `runtime.pipeline` (Sprint 76, Decisão
 * 3). Apenas leitura — nenhum cálculo de negócio acontece aqui.
 */
const PIPELINE_PHASE_BY_LABEL: Array<{ label: string; phaseId: RuntimePhase }> = [
  { label: "Intent Router", phaseId: "intent" },
  { label: "Context Builder", phaseId: "context" },
  { label: "Memory", phaseId: "memory" },
  { label: "Company Brain", phaseId: "company_brain" },
  { label: "Executive Council", phaseId: "executive_council" },
  { label: "Response", phaseId: "response" },
];

const STATUS_BADGE: Record<TimelineRowStatus, { label: string; variant: "default" | "success" | "warning" | "accent" | "muted" }> = {
  complete: { label: "Concluída", variant: "success" },
  running: { label: "Em execução", variant: "warning" },
  pending: { label: "Pendente", variant: "muted" },
  partial: { label: "Parcial", variant: "warning" },
  not_instrumented: { label: "Não instrumentada", variant: "muted" },
};

function formatTimestamp(iso?: string): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    fractionalSecondDigits: 3,
  });
}

function formatDuration(ms?: number): string {
  if (ms == null) return "—";
  return ms < 1000 ? `${Math.round(ms)} ms` : `${(ms / 1000).toFixed(2)} s`;
}

/**
 * Monta as 8 etapas oficiais da Execution Timeline solicitadas nesta Sprint:
 * Intent Router, Context Builder, Memory, Company Brain, Executive Council,
 * AI Gateway, Execution Memory, Response.
 *
 * Nem todas ainda são fases próprias e independentes do `runSamuelRuntime`
 * hoje:
 * - As 6 primeiras + Response usam dados REAIS de `runtime.pipeline`
 *   (`startedAt`/`completedAt`/`durationMs`, Sprint 76 — Decisão 3).
 * - "AI Gateway" ainda ocorre dentro da fase "Response" (não é uma fase
 *   isolada) — por isso mostramos apenas a duração real conhecida
 *   (`runtime.aiGateway.latencyMs`), sem início/fim próprios.
 * - "Execution Memory" ocorre fora do `runSamuelRuntime` (é a camada que o
 *   envolve) e a regra obrigatória desta Sprint proíbe alterar
 *   `features/samuel-execution-memory` — por isso permanece como estrutura
 *   preparada, sem dados, até uma Sprint futura instrumentá-la.
 *
 * Nenhum valor aqui é inventado: o que não é medido aparece como "—" e com
 * status "não instrumentada"/"parcial".
 */
function buildExecutionTimeline(runtime: RuntimeResponse): ExecutionTimelineRow[] {
  const byId = new Map(runtime.pipeline.map((step) => [step.id, step]));
  const rows = new Map<string, ExecutionTimelineRow>();

  for (const { label, phaseId } of PIPELINE_PHASE_BY_LABEL) {
    const step = byId.get(phaseId);
    rows.set(label, {
      label,
      startedAt: step?.startedAt,
      completedAt: step?.completedAt,
      durationMs: step?.durationMs,
      status: (step?.status ?? "pending") as TimelineRowStatus,
    });
  }

  rows.set("AI Gateway", {
    label: "AI Gateway",
    durationMs: runtime.aiGateway.latencyMs,
    status: runtime.aiGateway.used ? "partial" : "not_instrumented",
    note: runtime.aiGateway.used
      ? "Duração real da chamada ao provider (aiGateway.latencyMs). Ainda ocorre dentro da fase \"Response\" — início/fim próprios exigiriam torná-la uma fase independente em uma Sprint futura."
      : "Fallback heurístico foi usado nesta execução — o Gateway não chegou a ser chamado com sucesso.",
  });

  rows.set("Execution Memory", {
    label: "Execution Memory",
    status: "not_instrumented",
    note: "Estrutura preparada conforme solicitado. Regra obrigatória desta Sprint proíbe alterar features/samuel-execution-memory; a persistência ocorre fora do Samuel Runtime e ainda não expõe tempo próprio.",
  });

  return [
    rows.get("Intent Router")!,
    rows.get("Context Builder")!,
    rows.get("Memory")!,
    rows.get("Company Brain")!,
    rows.get("Executive Council")!,
    rows.get("AI Gateway")!,
    rows.get("Execution Memory")!,
    rows.get("Response")!,
  ];
}

type ExecutionTimelineProps = {
  runtime: RuntimeResponse;
};

export function ExecutionTimeline({ runtime }: ExecutionTimelineProps) {
  const rows = buildExecutionTimeline(runtime);
  const notes = rows.filter((row) => row.note);

  return (
    <div className="space-y-2">
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full min-w-[560px] text-sm">
          <thead>
            <tr className="border-b border-border bg-white/[0.03] text-left text-[10px] uppercase tracking-wider text-muted">
              <th className="px-3 py-2 font-medium">#</th>
              <th className="px-3 py-2 font-medium">Etapa</th>
              <th className="px-3 py-2 font-medium">Início</th>
              <th className="px-3 py-2 font-medium">Fim</th>
              <th className="px-3 py-2 font-medium">Duração</th>
              <th className="px-3 py-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={row.label} className="border-b border-border/60 last:border-b-0">
                <td className="px-3 py-2 text-muted">{index + 1}</td>
                <td className="px-3 py-2 font-medium text-foreground">{row.label}</td>
                <td className="px-3 py-2 text-foreground/80">{formatTimestamp(row.startedAt)}</td>
                <td className="px-3 py-2 text-foreground/80">{formatTimestamp(row.completedAt)}</td>
                <td className="px-3 py-2 text-foreground/80">{formatDuration(row.durationMs)}</td>
                <td className="px-3 py-2">
                  <StatusBadge
                    label={STATUS_BADGE[row.status].label}
                    variant={STATUS_BADGE[row.status].variant}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {notes.length > 0 && (
        <div className="space-y-1 rounded-lg border border-border bg-white/[0.02] px-3 py-2">
          {notes.map((row) => (
            <p key={row.label} className="text-xs text-muted">
              <span className="font-medium text-foreground/80">{row.label}: </span>
              {row.note}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
