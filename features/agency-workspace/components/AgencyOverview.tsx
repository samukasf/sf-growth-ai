import { Panel, MetricCard } from "./shared";
import type { AgencyWorkspaceData } from "../types/agency-workspace.types";
import type { ClientOnboardingResult } from "../types/client-onboarding.types";

type AgencyOverviewProps = {
  data: AgencyWorkspaceData;
  latestOnboarding?: ClientOnboardingResult | null;
};

export function AgencyOverview({ data, latestOnboarding }: AgencyOverviewProps) {
  const clientSection = data.agencyDashboard?.sections.find((s) => s.key === "clients");
  const projectSection = data.agencyDashboard?.sections.find((s) => s.key === "projects");

  return (
    <div className="flex flex-col gap-4">
      <Panel title="Influence Publicidade" subtitle="Agency Overview · Lighthouse ALPHA 01">
        <p className="text-sm leading-relaxed text-muted">
          Workspace integrado do SF Growth AI para operação multi-cliente. Dados agregados via
          Agency Core, Business Operating Runtime e Company Brain.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Clientes ativos" value={clientSection?.metrics.active ?? 0} />
          <MetricCard label="Total clientes" value={clientSection?.metrics.total ?? 0} />
          <MetricCard label="Projetos ativos" value={projectSection?.metrics.active ?? 0} />
          <MetricCard
            label="Health Score"
            value={data.agencyHealth?.scores.overall ?? 0}
            hint="/100"
          />
        </div>
      </Panel>

      {latestOnboarding ? (
        <Panel
          title="Último onboarding"
          subtitle={`${latestOnboarding.client.name} · Tenant ${latestOnboarding.tenantId}`}
        >
          <p className="text-sm text-muted">{latestOnboarding.discoverySummary}</p>
        </Panel>
      ) : null}

      {data.agencyBrain ? (
        <Panel title="Agency Brain" subtitle="Contexto operacional da agência">
          <dl className="grid gap-2 sm:grid-cols-2">
            {Object.entries(data.agencyBrain.operationalContext).map(([key, value]) => (
              <div key={key} className="rounded-lg bg-black/20 px-3 py-2">
                <dt className="text-[10px] uppercase tracking-wider text-muted">{key}</dt>
                <dd className="mt-1 text-sm text-foreground">{value}</dd>
              </div>
            ))}
          </dl>
        </Panel>
      ) : null}
    </div>
  );
}
