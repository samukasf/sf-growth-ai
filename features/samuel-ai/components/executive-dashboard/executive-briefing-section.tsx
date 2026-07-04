"use client";

import { useEffect, useState } from "react";

import { formatExecutiveDateTime } from "../../executive-brain/briefing-utils";
import type { ExecutiveBriefing } from "../../executive-brain/types";
import { MetricTile } from "../shared/metric-tile";

type ExecutiveBriefingSectionProps = {
  briefing: ExecutiveBriefing;
};

export function ExecutiveBriefingSection({
  briefing,
}: ExecutiveBriefingSectionProps) {
  const [dateTime, setDateTime] = useState(formatExecutiveDateTime);

  useEffect(() => {
    const interval = setInterval(() => {
      setDateTime(formatExecutiveDateTime());
    }, 60_000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="flex flex-col gap-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-accent">
            Executive Briefing
          </p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            {briefing.greeting},{" "}
            <span className="text-white">{briefing.companyName}</span>
          </h2>
          <p className="mt-1 text-xs capitalize text-muted">{dateTime}</p>
        </div>
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-3 sm:max-w-xs">
          <p className="text-[10px] font-medium uppercase tracking-wider text-amber-400">
            Prioridade do dia
          </p>
          <p className="mt-1 text-sm font-medium text-foreground">
            {briefing.dayPriority}
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-white/[0.02] px-4 py-3">
        <p className="text-[10px] font-medium uppercase tracking-wider text-muted">
          Resumo — últimas 24 horas
        </p>
        <p className="mt-1.5 text-sm leading-relaxed text-foreground/90">
          {briefing.last24hSummary}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricTile metric={briefing.metrics.revenue} />
        <MetricTile metric={briefing.metrics.growth} />
        <MetricTile metric={briefing.metrics.leads} />
        <MetricTile metric={briefing.metrics.conversions} />
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <BriefingIntel label="Campanhas" value={briefing.campaigns} />
        <BriefingIntel label="Concorrentes" value={briefing.competitors} />
        <BriefingIntel label="Mercado" value={briefing.market} />
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <div className="rounded-lg border border-red-500/15 bg-red-500/5 px-4 py-3">
          <p className="text-[10px] font-medium uppercase tracking-wider text-red-400">
            Risco atual
          </p>
          <p className="mt-1 text-sm text-foreground">{briefing.currentRisk}</p>
        </div>
        <div className="rounded-lg border border-emerald-500/15 bg-emerald-500/5 px-4 py-3">
          <p className="text-[10px] font-medium uppercase tracking-wider text-emerald-400">
            Próxima recomendação
          </p>
          <p className="mt-1 text-sm text-foreground">
            {briefing.nextRecommendation}
          </p>
        </div>
      </div>

      {briefing.opportunities.length > 0 && (
        <div>
          <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-muted">
            Oportunidades detectadas
          </p>
          <ul className="grid gap-2 sm:grid-cols-3">
            {briefing.opportunities.map((opportunity) => (
              <li
                key={opportunity}
                className="rounded-lg border border-emerald-500/10 bg-emerald-500/[0.03] px-3 py-2.5 text-xs leading-relaxed text-emerald-300/90"
              >
                {opportunity}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

function BriefingIntel({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-white/[0.02] px-3 py-3">
      <p className="text-[10px] font-medium uppercase tracking-wider text-muted">
        {label}
      </p>
      <p className="mt-1 text-xs leading-relaxed text-foreground">{value}</p>
    </div>
  );
}
