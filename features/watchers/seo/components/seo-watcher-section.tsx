import { cn } from "@/utils/cn";

import { StatusBadge } from "@/features/samuel-ai/components/shared/status-badge";
import { SectionHeader } from "@/features/samuel-ai/components/section-header";

import type {
  GrowingKeyword,
  SeoAlert,
  SeoOpportunity,
  SeoRecommendation,
  SeoRisk,
  SeoSeverity,
  SeoWatcherResult,
} from "../seo-watcher.types";

type SeoWatcherSectionProps = {
  seoWatcher: SeoWatcherResult | null;
};

function severityVariant(severity: SeoSeverity) {
  switch (severity) {
    case "Critical":
      return "warning" as const;
    case "High":
      return "accent" as const;
    case "Medium":
      return "muted" as const;
    default:
      return "muted" as const;
  }
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-border/60 bg-black/10 px-3 py-2">
      <p className="text-[10px] uppercase tracking-wider text-muted">{label}</p>
      <p className="mt-1 text-lg font-semibold text-foreground">{value}</p>
    </div>
  );
}

function KeywordCard({ keyword }: { keyword: GrowingKeyword }) {
  return (
    <li className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-3 py-2.5">
      <p className="text-xs font-semibold text-foreground">{keyword.query}</p>
      <p className="mt-1 text-[11px] text-muted">
        {keyword.clicks.toLocaleString("pt-BR")} cliques · posição {keyword.position}
      </p>
      <p className="mt-1 text-[10px] text-emerald-400">↑ {keyword.growthPercent}% crescimento</p>
    </li>
  );
}

function RiskCard({ risk }: { risk: SeoRisk }) {
  return (
    <li className="rounded-lg border border-rose-500/20 bg-rose-500/5 px-3 py-2.5">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-foreground">{risk.title}</p>
          <p className="mt-1 text-[11px] text-muted">{risk.description}</p>
          {risk.page && (
            <p className="mt-1 text-[10px] text-rose-400">{risk.page}</p>
          )}
        </div>
        <StatusBadge label={risk.severity} variant={severityVariant(risk.severity)} />
      </div>
    </li>
  );
}

function AlertCard({ alert }: { alert: SeoAlert }) {
  return (
    <li className="rounded-lg border border-border/60 bg-black/10 px-3 py-2.5">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-foreground">{alert.title}</p>
          <p className="mt-1 text-[11px] text-muted">{alert.description}</p>
        </div>
        <StatusBadge label={alert.severity} variant={severityVariant(alert.severity)} />
      </div>
      <p className="mt-1.5 text-[10px] text-accent">
        Recomendação: {alert.recommendation.title}
      </p>
      <p className="mt-1 text-[10px] text-muted">Confiança: {alert.confidence}%</p>
    </li>
  );
}

function OpportunityCard({ opportunity }: { opportunity: SeoOpportunity }) {
  return (
    <li className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-3 py-2.5">
      <p className="text-xs font-semibold text-foreground">{opportunity.title}</p>
      <p className="mt-1 text-[11px] text-muted">{opportunity.description}</p>
      <p className="mt-1 text-[10px] text-emerald-400">{opportunity.growthPotential}</p>
    </li>
  );
}

export function SeoWatcherSection({ seoWatcher }: SeoWatcherSectionProps) {
  if (!seoWatcher) {
    return (
      <section className="flex flex-col gap-4">
        <SectionHeader
          title="SEO Watcher"
          description="Monitoramento contínuo de presença orgânica no Google"
        />
        <p className="text-sm text-muted">Nenhum sinal SEO detectado.</p>
      </section>
    );
  }

  const sourceLabel =
    seoWatcher.dataSource === "google-search-console"
      ? "Google Search Console"
      : "Provider Mock";

  return (
    <section className="flex flex-col gap-4">
      <SectionHeader
        title="SEO Watcher"
        description="Monitoramento contínuo de presença orgânica no Google"
      />

      <div className="rounded-xl border border-accent/20 bg-accent/5 px-4 py-3">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[10px] font-medium uppercase tracking-wider text-accent">
            Resumo Orgânico
          </p>
          <StatusBadge label={sourceLabel} variant="accent" />
        </div>
        <p className="mt-2 text-xs leading-relaxed text-muted">
          {seoWatcher.executiveSummary}
        </p>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Metric label="Cliques" value={seoWatcher.metrics.clicks.toLocaleString("pt-BR")} />
          <Metric label="Impressões" value={seoWatcher.metrics.impressions.toLocaleString("pt-BR")} />
          <Metric label="CTR" value={`${seoWatcher.metrics.ctr}%`} />
          <Metric label="Posição Média" value={seoWatcher.metrics.averagePosition} />
        </div>
        <p className="mt-2 text-[10px] text-muted">
          Confiança média: {seoWatcher.averageConfidence}% · Saúde SEO{" "}
          {seoWatcher.metrics.seoHealthScore}/100
        </p>
      </div>

      <div>
        <p className={cn("mb-2 text-[10px] font-medium uppercase tracking-wider", "text-emerald-400")}>
          Keywords em Crescimento
        </p>
        <ul className="flex flex-col gap-1.5">
          {seoWatcher.growingKeywords.length > 0 ? (
            seoWatcher.growingKeywords.map((keyword) => (
              <KeywordCard key={keyword.id} keyword={keyword} />
            ))
          ) : (
            <li className="text-[11px] text-muted">Nenhuma keyword em crescimento detectada</li>
          )}
        </ul>
      </div>

      <div>
        <p className={cn("mb-2 text-[10px] font-medium uppercase tracking-wider", "text-rose-400")}>
          Páginas em Risco
        </p>
        <ul className="flex flex-col gap-1.5">
          {seoWatcher.pagesAtRisk.length > 0 ? (
            seoWatcher.pagesAtRisk.map((risk) => <RiskCard key={risk.id} risk={risk} />)
          ) : (
            <li className="text-[11px] text-muted">Nenhuma página em risco detectada</li>
          )}
        </ul>
      </div>

      <div>
        <p className={cn("mb-2 text-[10px] font-medium uppercase tracking-wider", "text-amber-400")}>
          Alertas
        </p>
        <ul className="flex flex-col gap-1.5">
          {seoWatcher.alerts.map((alert) => (
            <AlertCard key={alert.id} alert={alert} />
          ))}
        </ul>
      </div>

      <div>
        <p className={cn("mb-2 text-[10px] font-medium uppercase tracking-wider", "text-emerald-400")}>
          Oportunidades
        </p>
        <ul className="flex flex-col gap-1.5">
          {seoWatcher.opportunities.map((opportunity) => (
            <OpportunityCard key={opportunity.id} opportunity={opportunity} />
          ))}
        </ul>
      </div>

      <div>
        <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-muted">
          Recomendações
        </p>
        <ul className="flex flex-col gap-1.5">
          {seoWatcher.recommendations.map((rec: SeoRecommendation) => (
            <li
              key={rec.id}
              className="rounded-lg border border-border/60 bg-black/10 px-3 py-2 text-[11px]"
            >
              <span className="font-medium text-foreground">{rec.title}</span>
              <span className="text-muted"> — {rec.description}</span>
              <span className="mt-1 block text-[10px] text-muted">
                Prioridade: {rec.priority} · Área: {rec.responsibleArea}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
