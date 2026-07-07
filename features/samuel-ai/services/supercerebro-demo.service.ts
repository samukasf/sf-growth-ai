import { createEnterpriseBrainRuntime } from "@/core/enterprise-brain-runtime";
import { createExecutiveCouncil } from "@/core/executive-council";
import { createExecutiveOrchestrator } from "@/core/executive-orchestrator";

import type {
  RunSupercerebroDemoInput,
  SupercerebroDemoPhase,
  SupercerebroDemoResult,
  SupercerebroSpecialistView,
} from "./supercerebro-demo.types";

const PHASE_DELAYS: Record<Exclude<SupercerebroDemoPhase, "idle" | "complete">, number> = {
  analyzing_brain: 900,
  convening_council: 700,
  consulting_specialists: 900,
  forming_consensus: 700,
  recommending_plan: 600,
};

const ROLE_LABELS: Record<string, string> = {
  ceo: "CEO",
  finance: "Financeiro",
  marketing: "Marketing",
  sales: "Vendas",
  operations: "Operações",
  hr: "RH",
  legal: "Jurídico",
  crm: "CRM",
  communication: "Comunicação",
  commerce: "Comércio",
  scheduling: "Agendamento",
  innovation: "Inovação",
  projects: "Projetos",
};

function delay(ms: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function runPhase(
  phase: Exclude<SupercerebroDemoPhase, "idle" | "complete">,
  onPhase?: (phase: SupercerebroDemoPhase) => void,
) {
  onPhase?.(phase);
  await delay(PHASE_DELAYS[phase]);
}

function padList(items: string[], fallback: string[], count = 3): string[] {
  const merged = [...items, ...fallback];
  return merged.slice(0, count);
}

function formatCompanyState(confidence: number, headline: string): string {
  const status =
    confidence >= 80 ? "saudável" : confidence >= 60 ? "estável com atenção" : "requer decisão";
  return `${headline} · Confiança do Supercérebro: ${confidence}% · Estado geral: ${status}.`;
}

function estimateRoi(confidence: number, opportunityCount: number): string {
  const low = Math.max(12, Math.round(confidence * 0.15 + opportunityCount * 2));
  const high = low + 8;
  return `${low}–${high}% em 90 dias`;
}

export async function runSupercerebroDemo(
  input: RunSupercerebroDemoInput,
): Promise<SupercerebroDemoResult> {
  const organizationId = input.organizationId ?? "default-org";
  const companyId = input.companyId ?? "default-company";
  const query =
    input.query ??
    "Qual é a prioridade estratégica da empresa para acelerar crescimento com segurança?";

  const brainRuntime = createEnterpriseBrainRuntime();
  const orchestrator = createExecutiveOrchestrator({ companyId, organizationId });
  const councilRuntime = createExecutiveCouncil();

  await runPhase("analyzing_brain", input.onPhase);
  const snapshot = await brainRuntime.buildSnapshot(organizationId, companyId);

  await runPhase("convening_council", input.onPhase);
  await orchestrator.processRequest({
    organizationId,
    companyId,
    query,
    metadata: { source: "supercerebro-demo", brainSnapshotId: snapshot.id },
  });

  await runPhase("consulting_specialists", input.onPhase);
  const councilResult = await councilRuntime.process({
    organizationId,
    companyId,
    requestId: `demo-${Date.now()}`,
    query,
    brainSnapshotId: snapshot.id,
    risks: snapshot.risks,
    opportunities: snapshot.opportunities,
    priorities: snapshot.priorities,
    context: { companyName: input.companyName, demo: "true" },
  });

  await runPhase("forming_consensus", input.onPhase);
  await runPhase("recommending_plan", input.onPhase);

  const specialists: SupercerebroSpecialistView[] = councilResult.opinions.map((opinion) => ({
    role: ROLE_LABELS[opinion.role] ?? opinion.role,
    name: councilResult.members.find((m) => m.id === opinion.memberId)?.name ?? opinion.role,
    summary: opinion.summary,
    recommendation: opinion.recommendation,
    priority: opinion.priority,
    confidence: opinion.confidence,
    risks: opinion.risks,
    opportunities: opinion.opportunities,
  }));

  const opportunities = padList(snapshot.opportunities, [
    "Reativar aquisição digital com campanhas segmentadas",
    "Converter base inativa do CRM em receita recorrente",
    "Acelerar presença local com avaliações e Google Business",
  ]);

  const risks = padList(snapshot.risks, [
    "Queda de tráfego orgânico impactando novas vendas",
    "Concentração de receita em poucos clientes",
    "Atraso na execução de iniciativas de crescimento",
  ]);

  const recommendedProject =
    councilResult.recommendations[0]?.title ??
    "Plano de Crescimento Executivo — 90 dias";

  const result: SupercerebroDemoResult = {
    greeting: input.greeting ?? `Bom dia, ${input.companyName}`,
    companyState: formatCompanyState(
      snapshot.confidence,
      snapshot.organizationSummary.headline,
    ),
    opportunities,
    risks,
    councilConvened: `Conselho Executivo convocado com ${councilResult.members.length} especialistas.`,
    specialists,
    consensus: councilResult.consensus.consolidatedSummary,
    recommendedProject,
    estimatedRoi: estimateRoi(snapshot.confidence, opportunities.length),
    nextAction:
      councilResult.recommendations[0]?.actionItems[0] ??
      councilResult.decision.decision,
    ceoResponse: councilResult.response,
    brainConfidence: snapshot.confidence,
  };

  input.onPhase?.("complete");
  return result;
}
