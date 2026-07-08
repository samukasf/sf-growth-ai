import { Panel, MetricCard } from "./shared";
import type { AgencyWorkspaceData } from "../types/agency-workspace.types";

type AgencyExecutivePanelProps = {
  data: AgencyWorkspaceData;
  variant: "dashboard" | "council" | "ceo" | "company-brain";
};

export function AgencyExecutivePanel({ data, variant }: AgencyExecutivePanelProps) {
  if (variant === "company-brain") {
    return (
      <div className="grid gap-4 lg:grid-cols-2">
        {data.companyBrains.map((brain) => (
          <Panel key={brain.companyId} title={brain.companyName} subtitle="Company Brain">
            <p className="text-sm text-foreground">{brain.summary}</p>
            <p className="mt-3 text-xs text-muted">Health Score: {brain.healthScore}/100</p>
            {brain.signals.length > 0 ? (
              <ul className="mt-3 space-y-1 text-xs text-amber-400">
                {brain.signals.map((signal) => (
                  <li key={signal}>• {signal}</li>
                ))}
              </ul>
            ) : null}
          </Panel>
        ))}
      </div>
    );
  }

  if (variant === "dashboard") {
    return (
      <div className="flex flex-col gap-4">
        <Panel title="Executive Dashboard" subtitle="Métricas consolidadas da agência">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {data.agencyDashboard?.sections.map((section) => (
              <MetricCard
                key={section.key}
                label={section.label}
                value={Object.values(section.metrics)[0] ?? 0}
              />
            ))}
          </div>
        </Panel>
        <Panel title="Prioridades do dia" subtitle="Business Operating Runtime">
          <ul className="space-y-2">
            {data.priorities.map((priority) => (
              <li
                key={priority.id}
                className="flex items-center justify-between rounded-lg bg-black/20 px-3 py-2 text-sm"
              >
                <span className="text-foreground">{priority.title}</span>
                <span className="text-xs text-muted">#{priority.rank}</span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    );
  }

  if (variant === "council" && data.council) {
    return (
      <Panel title="Executive Council" subtitle="Síntese do Conselho Executivo">
        <p className="text-sm leading-relaxed text-foreground">{data.council.response}</p>
        <ul className="mt-4 space-y-2">
          {data.council.recommendations.slice(0, 5).map((rec) => (
            <li key={rec.id} className="rounded-lg bg-black/20 px-3 py-2 text-xs text-muted">
              <span className="font-medium text-foreground">{rec.title}</span>
              <p className="mt-1">{rec.description}</p>
            </li>
          ))}
        </ul>
      </Panel>
    );
  }

  return (
    <Panel title="Executive CEO" subtitle="Síntese executiva do dia">
      <p className="text-sm font-medium text-foreground">{data.executiveCeoSummary.headline}</p>
      <p className="mt-2 text-3xl font-semibold text-accent">
        {data.executiveCeoSummary.healthScore}
        <span className="text-base text-muted"> /100</span>
      </p>
      <div className="mt-4">
        <p className="text-[10px] uppercase tracking-wider text-muted">Prioridades</p>
        <ul className="mt-2 space-y-1 text-sm text-foreground">
          {data.executiveCeoSummary.topPriorities.map((item) => (
            <li key={item}>• {item}</li>
          ))}
        </ul>
      </div>
      <div className="mt-4">
        <p className="text-[10px] uppercase tracking-wider text-muted">Recomendações</p>
        <ul className="mt-2 space-y-1 text-sm text-muted">
          {data.executiveCeoSummary.recommendations.map((item) => (
            <li key={item}>• {item}</li>
          ))}
        </ul>
      </div>
    </Panel>
  );
}
