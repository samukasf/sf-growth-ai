import { cn } from "@/utils/cn";

import type { ExecutiveForecast } from "../../services/executive-forecast.service";
import { StatusBadge } from "../shared/status-badge";
import { SectionHeader } from "../section-header";

type ExecutiveForecastSectionProps = {
  forecast: ExecutiveForecast | null;
};

const SCENARIO_STYLES = {
  conservative: "border-zinc-500/20 bg-zinc-500/[0.04]",
  expected: "border-accent/20 bg-accent/[0.04]",
  aggressive: "border-emerald-500/20 bg-emerald-500/[0.04]",
} as const;

const TREND_STYLES = {
  up: "text-emerald-400",
  down: "text-rose-400",
  stable: "text-muted",
} as const;

export function ExecutiveForecastSection({
  forecast,
}: ExecutiveForecastSectionProps) {
  if (!forecast) {
    return (
      <section className="flex flex-col gap-4">
        <SectionHeader
          title="Executive Forecast"
          description="Previsões estratégicas do futuro do negócio"
        />
        <p className="text-sm text-muted">
          Previsões indisponíveis — dados executivos insuficientes.
        </p>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-4">
      <SectionHeader
        title="Executive Forecast"
        description="Previsões estratégicas do futuro do negócio"
      />

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <div className="rounded-lg border border-accent/20 bg-accent/5 px-3 py-2.5">
          <p className="text-[10px] text-muted">Crescimento esperado</p>
          <p className="mt-1 text-sm font-semibold text-accent">
            {forecast.expectedGrowth}
          </p>
        </div>
        <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-3 py-2.5">
          <p className="text-[10px] text-muted">Prob. de sucesso</p>
          <p className="mt-1 text-sm font-semibold text-emerald-400">
            {forecast.successProbability}%
          </p>
        </div>
        <div className="rounded-lg border border-border/60 bg-black/10 px-3 py-2.5">
          <p className="text-[10px] text-muted">Confiança geral</p>
          <p className="mt-1 text-sm font-semibold text-foreground">
            {forecast.confidence.overall}%
          </p>
        </div>
        <div className="rounded-lg border border-border/60 bg-black/10 px-3 py-2.5">
          <p className="text-[10px] text-muted">Receita prevista</p>
          <p className="mt-1 text-sm font-semibold text-foreground">
            {forecast.predictions.revenue}
          </p>
        </div>
      </div>

      <div>
        <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-muted">
          Cenários
        </p>
        <div className="flex flex-col gap-3">
          {forecast.scenarios.map((scenario) => (
            <div
              key={scenario.id}
              className={cn(
                "rounded-xl border px-4 py-3",
                SCENARIO_STYLES[scenario.type],
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold text-foreground">
                  {scenario.label}
                </h3>
                <StatusBadge
                  label={`${scenario.probability}% prob.`}
                  variant={
                    scenario.type === "conservative"
                      ? "muted"
                      : scenario.type === "expected"
                        ? "accent"
                        : "success"
                  }
                />
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] sm:grid-cols-4">
                <div>
                  <p className="text-muted">Receita</p>
                  <p className="font-medium text-foreground">
                    {scenario.projectedRevenue}
                  </p>
                </div>
                <div>
                  <p className="text-muted">Lucro</p>
                  <p className="font-medium text-emerald-400">
                    {scenario.projectedProfit}
                  </p>
                </div>
                <div>
                  <p className="text-muted">Custos</p>
                  <p className="font-medium text-foreground">{scenario.costs}</p>
                </div>
                <div>
                  <p className="text-muted">ROI</p>
                  <p className="font-medium text-accent">{scenario.roi}</p>
                </div>
              </div>
              {scenario.risks[0] ? (
                <p className="mt-2 text-[11px] text-rose-300/90">
                  Risco: {scenario.risks[0].description}
                </p>
              ) : null}
              {scenario.opportunities[0] ? (
                <p className="mt-1 text-[11px] text-emerald-300/90">
                  Oportunidade: {scenario.opportunities[0].description}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-muted">
          Tendências
        </p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {forecast.trends.map((trend) => (
            <div
              key={trend.metric}
              className="rounded-lg border border-border/60 bg-black/10 px-3 py-2"
            >
              <p className="text-[10px] text-muted">{trend.metric}</p>
              <p className={cn("mt-0.5 text-xs font-medium", TREND_STYLES[trend.direction])}>
                {trend.value}
              </p>
              <p className="text-[10px] text-muted">{trend.change}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-rose-400">
          Alertas Futuros
        </p>
        <ul className="flex flex-col gap-1.5">
          {forecast.futureAlerts.map((alert) => (
            <li
              key={alert}
              className="rounded-lg border border-rose-500/15 bg-rose-500/[0.03] px-3 py-2 text-xs text-rose-300/90"
            >
              {alert}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-muted">
          Timeline
        </p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {forecast.timelines.map((item) => (
            <div
              key={item.horizon}
              className="rounded-lg border border-border/60 bg-white/[0.02] px-3 py-2.5"
            >
              <p className="text-xs font-semibold text-foreground">{item.label}</p>
              <div className="mt-2 grid grid-cols-2 gap-1 text-[11px]">
                <p>
                  <span className="text-muted">Receita: </span>
                  <span className="text-foreground">{item.revenue}</span>
                </p>
                <p>
                  <span className="text-muted">Crescimento: </span>
                  <span className="text-accent">{item.growth}</span>
                </p>
                <p>
                  <span className="text-muted">Leads: </span>
                  <span className="text-foreground">{item.leads}</span>
                </p>
                <p>
                  <span className="text-muted">Conversões: </span>
                  <span className="text-foreground">{item.conversions}</span>
                </p>
                <p className="col-span-2">
                  <span className="text-muted">Fluxo de caixa: </span>
                  <span className="text-emerald-400">{item.cashFlow}</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-border/60 bg-black/10 px-3 py-2.5">
        <p className="text-[10px] font-medium uppercase tracking-wider text-muted">
          Indicadores Previstos
        </p>
        <div className="mt-2 grid grid-cols-1 gap-1 text-[11px] sm:grid-cols-2">
          <p>
            <span className="text-muted">Fluxo de caixa: </span>
            {forecast.predictions.cashFlow}
          </p>
          <p>
            <span className="text-muted">Leads: </span>
            {forecast.predictions.leads}
          </p>
          <p>
            <span className="text-muted">Conversões: </span>
            {forecast.predictions.conversions}
          </p>
          <p>
            <span className="text-muted">Marketing: </span>
            {forecast.predictions.marketing}
          </p>
          <p>
            <span className="text-muted">Operação: </span>
            {forecast.predictions.operationalPerformance}
          </p>
          <p>
            <span className="text-muted">Churn: </span>
            {forecast.predictions.customerChurn}
          </p>
          <p className="sm:col-span-2">
            <span className="text-muted">Risco financeiro: </span>
            {forecast.predictions.financialRisk}
          </p>
        </div>
      </div>
    </section>
  );
}
