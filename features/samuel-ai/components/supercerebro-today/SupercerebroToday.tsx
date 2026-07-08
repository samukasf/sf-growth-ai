"use client";

import { useCallback, useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";

import type { ExecutiveBriefing } from "../../executive-brain/types";
import { runSupercerebroDemo } from "../../services/supercerebro-demo.service";
import type {
  SupercerebroDemoPhase,
  SupercerebroDemoResult,
} from "../../services/supercerebro-demo.types";
import { StatusBadge } from "../shared/status-badge";

const FLOW_STEPS: { phase: SupercerebroDemoPhase; label: string }[] = [
  { phase: "analyzing_brain", label: "Enterprise Brain analisando" },
  { phase: "convening_council", label: "Conselho Executivo convocado" },
  { phase: "consulting_specialists", label: "Especialistas consultados" },
  { phase: "forming_consensus", label: "Consenso formado" },
  { phase: "recommending_plan", label: "Plano recomendado" },
];

type SupercerebroTodayProps = {
  briefing: ExecutiveBriefing;
  companyId?: string;
  organizationId?: string;
  onQuickAction?: (prompt: string) => void;
};

function DemoList({
  title,
  items,
  variant,
}: {
  title: string;
  items: string[];
  variant: "risk" | "opportunity";
}) {
  return (
    <div
      className={cn(
        "rounded-lg border px-4 py-3",
        variant === "risk"
          ? "border-red-500/15 bg-red-500/5"
          : "border-emerald-500/15 bg-emerald-500/5",
      )}
    >
      <p
        className={cn(
          "text-[10px] font-semibold uppercase tracking-wider",
          variant === "risk" ? "text-red-400" : "text-emerald-400",
        )}
      >
        {title}
      </p>
      <ul className="mt-2 flex flex-col gap-1.5">
        {items.map((item, index) => (
          <li key={`${title}-${index}`} className="text-sm leading-snug text-foreground/90">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function ResultSection({
  index,
  title,
  children,
  accent = false,
}: {
  index: number;
  title: string;
  children: ReactNode;
  accent?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border p-4",
        accent ? "border-accent/25 bg-accent/5" : "border-border bg-white/[0.02]",
      )}
    >
      <div className="mb-2 flex items-center gap-2">
        <span className="flex size-6 items-center justify-center rounded-full border border-border bg-black/30 text-[11px] font-semibold text-muted">
          {index}
        </span>
        <p className="text-xs font-semibold uppercase tracking-wider text-foreground">
          {title}
        </p>
      </div>
      {children}
    </div>
  );
}

export function SupercerebroToday({
  briefing,
  companyId = "default-company",
  organizationId = "default-org",
  onQuickAction,
}: SupercerebroTodayProps) {
  const [phase, setPhase] = useState<SupercerebroDemoPhase>("idle");
  const [result, setResult] = useState<SupercerebroDemoResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const handleStart = useCallback(async () => {
    if (isRunning) return;

    setIsRunning(true);
    setResult(null);
    setPhase("analyzing_brain");

    try {
      const demoResult = await runSupercerebroDemo({
        organizationId,
        companyId,
        companyName: briefing.companyName,
        greeting: `${briefing.greeting}, ${briefing.companyName}`,
        onPhase: setPhase,
      });
      setResult(demoResult);
      setPhase("complete");
    } finally {
      setIsRunning(false);
    }
  }, [briefing.companyName, briefing.greeting, companyId, isRunning, organizationId]);

  const activeStepIndex = FLOW_STEPS.findIndex((step) => step.phase === phase);

  const companyLabel = briefing.companyName || "Empresa";
  const healthLabel =
    briefing.metrics.growth.trend === "up"
      ? "Empresa saudável"
      : briefing.metrics.growth.trend === "stable"
        ? "Empresa estável"
        : "Empresa em atenção";

  const scoreEmpresarial =
    briefing.metrics.growth.trend === "up" ? 82 : briefing.metrics.growth.trend === "stable" ? 66 : 48;
  const enterpriseMaturity =
    briefing.metrics.revenue.trend === "up" ? 76 : briefing.metrics.revenue.trend === "stable" ? 62 : 44;

  const priorityMission = briefing.dayPriority;
  const biggestOpportunity = briefing.opportunities?.[0] ?? "Nenhuma oportunidade disponível.";
  const biggestRisk = briefing.currentRisk;
  const recommendedProject = result?.recommendedProject ?? briefing.nextRecommendation;
  const pendingDecision =
    result?.nextAction ?? "Definir próxima decisão com base nas recomendações executivas.";

  const overnightChecklist = [
    "analisou a empresa",
    "encontrou oportunidades",
    "detectou riscos",
    "revisou indicadores",
    "monitorou clientes",
    "monitorou fornecedores",
    "preparou recomendações",
  ];

  const handleQuickAction = (prompt: string) => {
    if (!onQuickAction) return;
    onQuickAction(prompt);
  };

  return (
    <section className="flex flex-col gap-5">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-accent">
            SUPERBRAIN TODAY
          </p>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            {briefing.greeting}, Samuel.
          </h2>
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
            <span className="rounded-full border border-border bg-white/[0.03] px-3 py-1">
              {companyLabel}
            </span>
            <span className="rounded-full border border-emerald-500/20 bg-emerald-500/5 px-3 py-1 text-emerald-400">
              {healthLabel}
            </span>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border border-border bg-white/[0.02] px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">
              Score Empresarial
            </p>
            <p className="mt-1 text-2xl font-semibold text-foreground">{scoreEmpresarial}</p>
          </div>
          <div className="rounded-lg border border-border bg-white/[0.02] px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">
              Enterprise Maturity
            </p>
            <p className="mt-1 text-2xl font-semibold text-foreground">{enterpriseMaturity}</p>
          </div>
          <div className="rounded-lg border border-border bg-white/[0.02] px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">
              Receita (24h)
            </p>
            <p className="mt-1 text-sm font-semibold text-foreground">{briefing.metrics.revenue.value}</p>
            <p className="mt-1 text-[10px] text-muted">{briefing.metrics.revenue.change}</p>
          </div>
          <div className="rounded-lg border border-border bg-white/[0.02] px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">
              Crescimento (24h)
            </p>
            <p className="mt-1 text-sm font-semibold text-foreground">{briefing.metrics.growth.value}</p>
            <p className="mt-1 text-[10px] text-muted">{briefing.metrics.growth.change}</p>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-black/10 px-4 py-4">
          <p className="text-xs font-semibold text-foreground">
            Durante a madrugada o Supercérebro:
          </p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {overnightChecklist.map((item) => (
              <div
                key={item}
                className="flex items-center gap-2 rounded-lg border border-border/60 bg-white/[0.02] px-3 py-2 text-xs text-foreground/90"
              >
                <span className="text-emerald-400">✓</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-3 lg:grid-cols-5">
          <div className="rounded-xl border border-accent/20 bg-accent/5 px-4 py-4">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-accent">
              Missão Prioritária
            </p>
            <p className="mt-2 text-sm font-medium text-foreground">{priorityMission}</p>
          </div>
          <div className="rounded-xl border border-emerald-500/15 bg-emerald-500/5 px-4 py-4">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
              Maior Oportunidade
            </p>
            <p className="mt-2 text-sm font-medium text-foreground">{biggestOpportunity}</p>
          </div>
          <div className="rounded-xl border border-red-500/15 bg-red-500/5 px-4 py-4">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-red-400">
              Maior Risco
            </p>
            <p className="mt-2 text-sm font-medium text-foreground">{biggestRisk}</p>
          </div>
          <div className="rounded-xl border border-border bg-white/[0.02] px-4 py-4">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">
              Projeto Recomendado
            </p>
            <p className="mt-2 text-sm font-medium text-foreground">{recommendedProject}</p>
          </div>
          <div className="rounded-xl border border-border bg-white/[0.02] px-4 py-4">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">
              Decisão Pendente
            </p>
            <p className="mt-2 text-sm font-medium text-foreground">{pendingDecision}</p>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <Button
            type="button"
            onClick={() => void handleStart()}
            disabled={isRunning}
            className="shrink-0"
          >
            {isRunning ? "Reunião em andamento…" : "▶ Iniciar Reunião Executiva"}
          </Button>

          <div className="grid w-full gap-2 sm:w-auto sm:grid-cols-2 lg:grid-cols-5">
            <Button
              type="button"
              variant="secondary"
              onClick={() => handleQuickAction("Gerar relatório executivo completo para hoje.")}
              disabled={!onQuickAction}
            >
              Ver Relatório Executivo
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => handleQuickAction("Mostrar missões do Supercérebro e seu status atual.")}
              disabled={!onQuickAction}
            >
              Ver Missões do Supercérebro
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => handleQuickAction("Listar projetos recomendados para a empresa hoje.")}
              disabled={!onQuickAction}
            >
              Projetos Recomendados
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => handleQuickAction("Abrir/resumir Company Brain (contexto e memória) da empresa.")}
              disabled={!onQuickAction}
            >
              Abrir Company Brain
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => handleQuickAction("Qual a próxima decisão executiva mais importante agora?")}
              disabled={!onQuickAction}
            >
              Próximas Decisões
            </Button>
          </div>
        </div>
      </div>

      {isRunning && phase !== "complete" && (
        <div className="rounded-xl border border-accent/20 bg-accent/5 px-4 py-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-accent">
            Fluxo executivo
          </p>
          <div className="mt-3 flex flex-col gap-2">
            {FLOW_STEPS.map((step, index) => {
              const isActive = step.phase === phase;
              const isDone = activeStepIndex > index;

              return (
                <div key={step.phase} className="flex items-center gap-2">
                  <StatusBadge
                    label={step.label}
                    variant={isActive ? "accent" : isDone ? "success" : "muted"}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {result && phase === "complete" && (
        <div className="flex flex-col gap-3">
          <ResultSection index={1} title="Bom dia executivo" accent>
            <p className="text-sm text-foreground">{result.greeting}</p>
          </ResultSection>

          <ResultSection index={2} title="Estado geral da empresa">
            <p className="text-sm leading-relaxed text-foreground/90">{result.companyState}</p>
          </ResultSection>

          <div className="grid gap-3 lg:grid-cols-2">
            <ResultSection index={3} title="3 oportunidades detectadas">
              <DemoList title="Oportunidades" items={result.opportunities} variant="opportunity" />
            </ResultSection>
            <ResultSection index={4} title="3 riscos detectados">
              <DemoList title="Riscos" items={result.risks} variant="risk" />
            </ResultSection>
          </div>

          <ResultSection index={5} title="Conselho Executivo convocado">
            <p className="text-sm text-foreground/90">{result.councilConvened}</p>
          </ResultSection>

          <ResultSection index={6} title="Especialistas participantes">
            <div className="flex flex-wrap gap-2">
              {result.specialists.map((specialist) => (
                <StatusBadge
                  key={`${specialist.role}-${specialist.name}`}
                  label={`${specialist.role} · ${specialist.confidence}%`}
                  variant="accent"
                />
              ))}
            </div>
          </ResultSection>

          <ResultSection index={7} title="Consenso executivo" accent>
            <p className="text-sm leading-relaxed text-foreground/90">{result.consensus}</p>
          </ResultSection>

          <div className="grid gap-3 lg:grid-cols-2">
            <ResultSection index={8} title="Projeto recomendado">
              <p className="text-sm font-medium text-foreground">{result.recommendedProject}</p>
            </ResultSection>
            <ResultSection index={9} title="ROI estimado">
              <p className="text-lg font-semibold text-emerald-400">{result.estimatedRoi}</p>
            </ResultSection>
          </div>

          <ResultSection index={10} title="Próxima ação sugerida" accent>
            <p className="text-sm text-foreground/90">{result.nextAction}</p>
            <p className="mt-3 rounded-lg border border-accent/15 bg-black/20 px-3 py-2 text-sm leading-relaxed text-foreground/90">
              {result.ceoResponse}
            </p>
          </ResultSection>
        </div>
      )}
    </section>
  );
}
