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

  return (
    <section className="flex flex-col gap-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-accent">
            Supercérebro Hoje
          </p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Toda empresa precisa de um Supercérebro.
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
            Em menos de 5 minutos, o empresário vê o estado da empresa, os riscos,
            as oportunidades e a decisão recomendada pelo Conselho Executivo.
          </p>
        </div>
        <Button
          type="button"
          onClick={() => void handleStart()}
          disabled={isRunning}
          className="shrink-0"
        >
          {isRunning ? "Reunião em andamento…" : "Iniciar Reunião Executiva"}
        </Button>
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
