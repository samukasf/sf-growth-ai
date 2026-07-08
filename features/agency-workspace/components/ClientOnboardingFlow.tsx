"use client";

import { useCallback, useState, useTransition } from "react";

import { TimelineSteps, type TimelineStep } from "@/features/samuel-ai/components/shared/timeline-steps";
import { cn } from "@/utils/cn";

import { onboardClientAction } from "../actions/onboard-client.action";
import type { ClientOnboardingResult, NewClientFormInput } from "../types/client-onboarding.types";
import { MetricCard, Panel } from "./shared";

const EMPTY_FORM: NewClientFormInput = {
  companyName: "",
  website: "",
  instagram: "",
  facebook: "",
  googleBusiness: "",
  phone: "",
  email: "",
  city: "",
  segment: "",
  objectives: "",
};

const FLOW_STEPS = [
  { id: "register", title: "Cadastro", description: "Dados da empresa e objetivos" },
  { id: "provision", title: "Supercérebro", description: "Tenant, Company Brain, Memory, Timeline, Dashboard, Council" },
  { id: "discovery", title: "Enterprise Discovery", description: "Protocolo de descoberta empresarial" },
  { id: "assessment", title: "Enterprise Assessment", description: "Avaliação de maturidade e readiness" },
  { id: "scores", title: "Scores", description: "Business Health, Maturity, Automation, AI Readiness" },
  { id: "council", title: "Executive Council", description: "Marketing, Comercial, Operações, Tecnologia" },
  { id: "ceo", title: "Executive CEO", description: "Resumo, oportunidades, riscos, projetos, plano 90 dias" },
  { id: "workspace", title: "Workspace", description: "Agency Dashboard, Client Portfolio, Executive Workspace" },
];

type ClientOnboardingFlowProps = {
  organizationId: string;
  agencyId: string;
  onComplete: (result: ClientOnboardingResult) => void;
  onCancel: () => void;
};

function buildTimelineSteps(activeIndex: number, completed: boolean): TimelineStep[] {
  return FLOW_STEPS.map((step, index) => ({
    id: step.id,
    order: index + 1,
    title: step.title,
    description: step.description,
    status:
      completed || index < activeIndex
        ? "completed"
        : index === activeIndex
          ? "in_progress"
          : "pending",
  }));
}

export function ClientOnboardingFlow({
  organizationId,
  agencyId,
  onComplete,
  onCancel,
}: ClientOnboardingFlowProps) {
  const [form, setForm] = useState<NewClientFormInput>(EMPTY_FORM);
  const [phase, setPhase] = useState<"form" | "processing" | "done">("form");
  const [activeStep, setActiveStep] = useState(0);
  const [result, setResult] = useState<ClientOnboardingResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const updateField = useCallback(
    (field: keyof NewClientFormInput, value: string) => {
      setForm((current) => ({ ...current, [field]: value }));
    },
    [],
  );

  const runOnboarding = () => {
    setError(null);
    setPhase("processing");
    setActiveStep(1);

    startTransition(async () => {
      try {
        for (let step = 1; step < FLOW_STEPS.length; step += 1) {
          setActiveStep(step);
          await new Promise((resolve) => setTimeout(resolve, 350));
        }

        const onboardingResult = await onboardClientAction(form, {
          organizationId,
          agencyId,
        });

        setResult(onboardingResult);
        setActiveStep(FLOW_STEPS.length);
        setPhase("done");
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "Falha no onboarding do cliente.");
        setPhase("form");
        setActiveStep(0);
      }
    });
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.companyName.trim() || !form.segment.trim()) {
      setError("Nome da empresa e segmento são obrigatórios.");
      return;
    }
    runOnboarding();
  };

  if (phase === "done" && result) {
    return (
      <div className="flex flex-col gap-4">
        <Panel title="Cliente preparado" subtitle={`${result.client.name} · Supercérebro ativo`}>
          <TimelineSteps steps={buildTimelineSteps(FLOW_STEPS.length, true)} />
        </Panel>

        <Panel title="Executive CEO" subtitle="Resumo executivo">
          <p className="text-sm text-foreground">{result.executiveCeo.executiveSummary}</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard label="Business Health" value={result.scores.businessHealth} hint="/100" />
            <MetricCard label="Enterprise Maturity" value={result.scores.enterpriseMaturity} hint="/100" />
            <MetricCard label="Automation Score" value={result.scores.automation} hint="/100" />
            <MetricCard label="AI Readiness" value={result.scores.aiReadiness} hint="/100" />
          </div>
        </Panel>

        <div className="grid gap-4 lg:grid-cols-2">
          <Panel title="5 Oportunidades" subtitle="Executive CEO">
            <ul className="space-y-1 text-sm text-muted">
              {result.opportunities.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </Panel>
          <Panel title="5 Riscos" subtitle="Especialistas">
            <ul className="space-y-1 text-sm text-muted">
              {result.risks.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </Panel>
          <Panel title="5 Projetos recomendados" subtitle="Executive Projects">
            <ul className="space-y-1 text-sm text-muted">
              {result.recommendedProjects.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </Panel>
          <Panel title="Plano de 90 dias" subtitle="Strategy + Assessment">
            <ul className="space-y-1 text-sm text-muted">
              {result.plan90Days.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </Panel>
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => onComplete(result)}
            className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white"
          >
            Abrir no Workspace
          </button>
        </div>
      </div>
    );
  }

  if (phase === "processing") {
    return (
      <Panel title="Preparando empresa" subtitle={`Supercérebro SF Growth AI · ${form.companyName}`}>
        <TimelineSteps steps={buildTimelineSteps(activeStep, false)} />
        {isPending ? (
          <p className="mt-4 text-xs text-muted">Integrando módulos existentes…</p>
        ) : null}
        {error ? <p className="mt-4 text-xs text-red-400">{error}</p> : null}
      </Panel>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Panel title="Novo Cliente" subtitle="Story 001 · First Customer Experience">
        <div className="grid gap-3 sm:grid-cols-2">
          {(
            [
              ["companyName", "Nome da empresa", true],
              ["website", "Website", false],
              ["instagram", "Instagram", false],
              ["facebook", "Facebook", false],
              ["googleBusiness", "Google Business", false],
              ["phone", "Telefone", false],
              ["email", "Email", false],
              ["city", "Cidade", false],
              ["segment", "Segmento", true],
            ] as const
          ).map(([field, label, required]) => (
            <label key={field} className="flex flex-col gap-1">
              <span className="text-xs text-muted">
                {label}
                {required ? " *" : ""}
              </span>
              <input
                required={required}
                value={form[field]}
                onChange={(event) => updateField(field, event.target.value)}
                className="rounded-lg border border-white/[0.08] bg-black/30 px-3 py-2 text-sm text-foreground outline-none focus:border-accent/40"
              />
            </label>
          ))}
        </div>
        <label className="mt-3 flex flex-col gap-1">
          <span className="text-xs text-muted">Objetivos *</span>
          <textarea
            required
            rows={4}
            value={form.objectives}
            onChange={(event) => updateField("objectives", event.target.value)}
            className="rounded-lg border border-white/[0.08] bg-black/30 px-3 py-2 text-sm text-foreground outline-none focus:border-accent/40"
          />
        </label>
        {error ? <p className="mt-3 text-xs text-red-400">{error}</p> : null}
      </Panel>

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-white/[0.08] px-4 py-2 text-sm text-muted"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className={cn(
            "rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white",
            isPending && "opacity-70",
          )}
        >
          Iniciar Supercérebro
        </button>
      </div>
    </form>
  );
}
