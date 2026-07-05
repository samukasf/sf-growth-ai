import { cn } from "@/utils/cn";

import type { SalesExecutive } from "../services/sales-executive.service";
import { StatusBadge } from "@/features/samuel-ai/components/shared/status-badge";
import { SectionHeader } from "@/features/samuel-ai/components/section-header";

type SalesExecutiveSummarySectionProps = {
  sales: SalesExecutive | null;
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(value);
}

function ScoreTile({ label, score }: { label: string; score: number }) {
  return (
    <div className="rounded-lg border border-border/60 bg-black/10 px-3 py-2.5">
      <p className="text-[10px] font-medium uppercase tracking-wider text-muted">{label}</p>
      <p className="mt-1 text-lg font-semibold text-foreground">
        {score}
        <span className="text-xs text-muted">/100</span>
      </p>
      <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-black/20">
        <div className="h-full rounded-full bg-accent" style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}

function DealList({
  title,
  items,
  accent,
}: {
  title: string;
  items: Array<{ id: string; title: string; value: number; reason: string }>;
  accent: string;
}) {
  return (
    <div>
      <p className={cn("mb-2 text-[10px] font-medium uppercase tracking-wider", accent)}>
        {title}
      </p>
      <ul className="flex flex-col gap-1.5">
        {items.length > 0 ? (
          items.map((item) => (
            <li
              key={item.id}
              className="rounded-lg border border-border/60 bg-black/10 px-3 py-2 text-[11px]"
            >
              <span className="font-medium text-foreground">{item.title}: </span>
              <span className="text-muted">
                {formatCurrency(item.value)} · {item.reason}
              </span>
            </li>
          ))
        ) : (
          <li className="text-[11px] text-muted">Nenhum item detectado</li>
        )}
      </ul>
    </div>
  );
}

export function SalesExecutiveSummarySection({ sales }: SalesExecutiveSummarySectionProps) {
  if (!sales) {
    return (
      <section className="flex flex-col gap-4">
        <SectionHeader
          title="Sales Executive Summary"
          description="Inteligência de vendas integrada ao Samuel AI™"
        />
        <p className="text-sm text-muted">Dados de vendas indisponíveis.</p>
      </section>
    );
  }

  const healthLabel =
    sales.salesHealthScore >= 75 ? "Saudável" : sales.salesHealthScore >= 50 ? "Atenção" : "Crítico";

  return (
    <section className="flex flex-col gap-4">
      <SectionHeader
        title="Sales Executive Summary"
        description="Inteligência de vendas integrada ao Samuel AI™"
      />

      <div className="rounded-xl border border-accent/20 bg-accent/5 px-4 py-3">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[10px] font-medium uppercase tracking-wider text-accent">
            Saúde de Vendas
          </p>
          <StatusBadge
            label={healthLabel}
            variant={
              sales.salesHealthScore >= 75
                ? "success"
                : sales.salesHealthScore >= 50
                  ? "accent"
                  : "warning"
            }
          />
        </div>
        <p className="mt-2 text-3xl font-semibold text-foreground">
          {sales.salesHealthScore}
          <span className="text-base text-muted">/100</span>
        </p>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-black/20">
          <div
            className="h-full rounded-full bg-accent"
            style={{ width: `${sales.salesHealthScore}%` }}
          />
        </div>
        <p className="mt-2 text-xs leading-relaxed text-muted">{sales.salesExecutiveSummary}</p>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <ScoreTile label="Pipeline" score={sales.salesPipelineScore} />
        <ScoreTile label="Conversão" score={sales.conversionScore} />
        <div className="rounded-lg border border-border/60 bg-black/10 px-3 py-2.5">
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted">Ticket Médio</p>
          <p className="mt-1 text-lg font-semibold text-foreground">
            {formatCurrency(sales.averageDealSize)}
          </p>
        </div>
        <div className="rounded-lg border border-border/60 bg-black/10 px-3 py-2.5">
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted">
            Ciclo de Vendas
          </p>
          <p className="mt-1 text-lg font-semibold text-foreground">{sales.salesCycleLength}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        <div className="rounded-lg border border-emerald-500/15 bg-emerald-500/[0.03] px-3 py-2.5">
          <p className="text-[10px] font-medium uppercase tracking-wider text-emerald-400">
            Win Rate
          </p>
          <p className="mt-1 text-lg font-semibold text-foreground">{sales.winRate}%</p>
          <p className="mt-0.5 text-[10px] text-muted">{sales.closedWon} ganho(s)</p>
        </div>
        <div className="rounded-lg border border-rose-500/15 bg-rose-500/[0.03] px-3 py-2.5">
          <p className="text-[10px] font-medium uppercase tracking-wider text-rose-400">
            Lost Rate
          </p>
          <p className="mt-1 text-lg font-semibold text-foreground">{sales.lostRate}%</p>
          <p className="mt-0.5 text-[10px] text-muted">{sales.closedLost} perdido(s)</p>
        </div>
        <div className="rounded-lg border border-accent/15 bg-accent/[0.03] px-3 py-2.5">
          <p className="text-[10px] font-medium uppercase tracking-wider text-accent">
            Forecast
          </p>
          <p className="mt-1 text-sm font-semibold text-foreground">{sales.revenueForecast}</p>
        </div>
      </div>

      <DealList
        title="Oportunidades em Aberto"
        items={sales.openOpportunities}
        accent="text-emerald-400"
      />

      <DealList
        title="Negócios Parados"
        items={sales.stalledDeals}
        accent="text-amber-400"
      />

      <div>
        <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-rose-400">
          Riscos
        </p>
        <ul className="flex flex-col gap-1.5">
          {sales.salesRisks.map((risk) => (
            <li
              key={risk.id}
              className="rounded-lg border border-rose-500/15 bg-rose-500/[0.03] px-3 py-2 text-[11px]"
            >
              <span className="font-medium text-foreground">{risk.title}: </span>
              <span className="text-muted">{risk.description}</span>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-accent">
          Recomendações
        </p>
        <ul className="flex flex-col gap-1.5">
          {sales.salesRecommendations.map((rec) => (
            <li
              key={rec.id}
              className="rounded-lg border border-accent/15 bg-accent/[0.03] px-3 py-2.5"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-semibold text-foreground">{rec.title}</p>
                <StatusBadge label={rec.priority} variant="muted" />
              </div>
              <p className="mt-1 text-[11px] text-muted">{rec.description}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
