import { Panel, MetricCard } from "./shared";
import type { AgencyWorkspaceData } from "../types/agency-workspace.types";
import type { ClientOnboardingResult } from "../types/client-onboarding.types";

type BusinessHealthPanelProps = {
  data: AgencyWorkspaceData;
  onboarding?: ClientOnboardingResult | null;
};

export function BusinessHealthPanel({ data, onboarding }: BusinessHealthPanelProps) {
  const health = data.businessHealth;
  const assessment = data.assessments[0];

  return (
    <div className="flex flex-col gap-4">
      <Panel title="Business Health" subtitle="Business Operating Runtime + Enterprise Assessment">
        {health ? (
          <>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
              <MetricCard label="Overall" value={health.overallScore} hint="/100" />
              <MetricCard label="Operations" value={health.operationsScore} />
              <MetricCard label="Objectives" value={health.objectivesScore} />
              <MetricCard label="Alerts" value={health.alertsScore} />
              <MetricCard label="Indicators" value={health.indicatorsScore} />
            </div>
            {health.signals.length > 0 ? (
              <ul className="mt-4 space-y-1 text-xs text-amber-400">
                {health.signals.map((signal) => (
                  <li key={signal}>• {signal}</li>
                ))}
              </ul>
            ) : null}
          </>
        ) : (
          <p className="text-sm text-muted">Health data unavailable.</p>
        )}
      </Panel>

      {onboarding ? (
        <Panel title="Scores de Onboarding" subtitle="Enterprise Assessment">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard label="Business Health" value={onboarding.scores.businessHealth} hint="/100" />
            <MetricCard label="Enterprise Maturity" value={onboarding.scores.enterpriseMaturity} hint="/100" />
            <MetricCard label="Automation Score" value={onboarding.scores.automation} hint="/100" />
            <MetricCard label="AI Readiness" value={onboarding.scores.aiReadiness} hint="/100" />
          </div>
        </Panel>
      ) : null}

      {data.agencyHealth ? (
        <Panel title="Agency Health" subtitle="Agency Core">
          <MetricCard label="Score geral" value={data.agencyHealth.scores.overall} hint="/100" />
          <ul className="mt-3 space-y-1 text-xs text-muted">
            {data.agencyHealth.signals.map((signal) => (
              <li key={signal}>• {signal}</li>
            ))}
          </ul>
        </Panel>
      ) : null}

      {assessment ? (
        <Panel title="Enterprise Assessment" subtitle={assessment.summary}>
          <p className="text-sm text-foreground">
            Score: {assessment.score.overallScore}/100 · Indústria: {assessment.benchmark.industry} ·
            Gap: {assessment.benchmark.overallGap}
          </p>
          <ul className="mt-3 space-y-2">
            {assessment.recommendations.slice(0, 3).map((rec) => (
              <li key={rec.id} className="text-xs text-muted">
                • {rec.title}
              </li>
            ))}
          </ul>
        </Panel>
      ) : null}
    </div>
  );
}
