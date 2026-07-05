import { cn } from "@/utils/cn";

import type { GoogleAnalyticsExecutive } from "../services/google-analytics-executive.service";
import { StatusBadge } from "@/features/samuel-ai/components/shared/status-badge";
import { SectionHeader } from "@/features/samuel-ai/components/section-header";

type GoogleAnalyticsExecutiveSummarySectionProps = {
  googleAnalytics: GoogleAnalyticsExecutive | null;
};

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

function MetricTile({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-border/60 bg-black/10 px-3 py-2.5">
      <p className="text-[10px] font-medium uppercase tracking-wider text-muted">{label}</p>
      <p className="mt-1 text-lg font-semibold text-foreground">{value}</p>
    </div>
  );
}

function DimensionList({
  title,
  items,
  valueKey,
  accent,
}: {
  title: string;
  items: Array<{ name?: string; path?: string; value: number; share: number }>;
  valueKey: "name" | "path";
  accent: string;
}) {
  return (
    <div>
      <p className={cn("mb-2 text-[10px] font-medium uppercase tracking-wider", accent)}>
        {title}
      </p>
      <ul className="flex flex-col gap-1.5">
        {items.length > 0 ? (
          items.map((item, index) => (
            <li
              key={`${item[valueKey] ?? index}-${index}`}
              className="flex items-center justify-between rounded-lg border border-border/60 bg-black/10 px-3 py-2 text-[11px]"
            >
              <span className="font-medium text-foreground truncate pr-2">
                {item[valueKey] ?? "—"}
              </span>
              <span className="shrink-0 text-muted">
                {item.value.toLocaleString("pt-BR")} ({item.share}%)
              </span>
            </li>
          ))
        ) : (
          <li className="text-[11px] text-muted">Nenhum dado disponível</li>
        )}
      </ul>
    </div>
  );
}

function InsightList({
  title,
  items,
  accent,
}: {
  title: string;
  items: Array<{ id: string; title: string; description: string }>;
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
              <span className="text-muted">{item.description}</span>
            </li>
          ))
        ) : (
          <li className="text-[11px] text-muted">Nenhum item detectado</li>
        )}
      </ul>
    </div>
  );
}

function trendLabel(trend: "up" | "down" | "stable", percent: number): string {
  if (trend === "up") return `↑ ${percent}%`;
  if (trend === "down") return `↓ ${percent}%`;
  return "→ estável";
}

export function GoogleAnalyticsExecutiveSummarySection({
  googleAnalytics,
}: GoogleAnalyticsExecutiveSummarySectionProps) {
  if (!googleAnalytics) {
    return (
      <section className="flex flex-col gap-4">
        <SectionHeader
          title="Google Analytics Executive Summary"
          description="Inteligência GA4 integrada ao Samuel AI™"
        />
        <p className="text-sm text-muted">Dados do Google Analytics indisponíveis.</p>
      </section>
    );
  }

  const healthLabel =
    googleAnalytics.googleAnalyticsHealthScore >= 75
      ? "Saudável"
      : googleAnalytics.googleAnalyticsHealthScore >= 50
        ? "Atenção"
        : "Crítico";

  return (
    <section className="flex flex-col gap-4">
      <SectionHeader
        title="Google Analytics Executive Summary"
        description="Inteligência GA4 integrada ao Samuel AI™"
      />

      <div className="rounded-xl border border-accent/20 bg-accent/5 px-4 py-3">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[10px] font-medium uppercase tracking-wider text-accent">
            Saúde Analytics
          </p>
          <StatusBadge
            label={healthLabel}
            variant={
              googleAnalytics.googleAnalyticsHealthScore >= 75
                ? "success"
                : googleAnalytics.googleAnalyticsHealthScore >= 50
                  ? "accent"
                  : "warning"
            }
          />
        </div>
        <p className="mt-2 text-3xl font-semibold text-foreground">
          {googleAnalytics.googleAnalyticsHealthScore}
          <span className="text-base text-muted">/100</span>
        </p>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-black/20">
          <div
            className="h-full rounded-full bg-accent"
            style={{ width: `${googleAnalytics.googleAnalyticsHealthScore}%` }}
          />
        </div>
        <p className="mt-2 text-xs leading-relaxed text-muted">
          {googleAnalytics.googleAnalyticsExecutiveSummary}
        </p>
        <p className="mt-1 text-[11px] text-accent">
          Tendência: {trendLabel(googleAnalytics.trafficTrend, googleAnalytics.trafficTrendPercent)}{" "}
          · Realtime: {googleAnalytics.realtimeUsers} usuários
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <ScoreTile label="Tráfego" score={googleAnalytics.trafficScore} />
        <ScoreTile label="Engajamento" score={googleAnalytics.engagementScore} />
        <ScoreTile label="Conversão" score={googleAnalytics.conversionScore} />
        <ScoreTile label="Audiência" score={googleAnalytics.audienceScore} />
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <MetricTile label="Usuários" value={googleAnalytics.users.toLocaleString("pt-BR")} />
        <MetricTile label="Sessões" value={googleAnalytics.sessions.toLocaleString("pt-BR")} />
        <MetricTile label="Conversões" value={googleAnalytics.conversions.toLocaleString("pt-BR")} />
        <MetricTile label="Taxa Conversão" value={`${googleAnalytics.conversionRate}%`} />
      </div>

      <DimensionList
        title="Canais"
        items={googleAnalytics.topChannels.map((channel) => ({
          name: channel.name,
          value: channel.sessions,
          share: channel.share,
        }))}
        valueKey="name"
        accent="text-sky-400"
      />

      <DimensionList
        title="Páginas"
        items={googleAnalytics.topPages.map((page) => ({
          path: page.path,
          value: page.views,
          share: page.share,
        }))}
        valueKey="path"
        accent="text-violet-400"
      />

      <DimensionList
        title="Eventos"
        items={googleAnalytics.topEvents.map((event) => ({
          name: event.name,
          value: event.count,
          share: event.share,
        }))}
        valueKey="name"
        accent="text-amber-400"
      />

      <InsightList
        title="Tendências"
        items={[
          {
            id: "trend-traffic",
            title: "Tráfego",
            description: `${trendLabel(googleAnalytics.trafficTrend, googleAnalytics.trafficTrendPercent)} vs período anterior · ${googleAnalytics.pageViews.toLocaleString("pt-BR")} pageviews`,
          },
          {
            id: "trend-engagement",
            title: "Engajamento",
            description: `Taxa ${googleAnalytics.engagementRate}% · bounce ${googleAnalytics.bounceRate}%`,
          },
        ]}
        accent="text-cyan-400"
      />

      <InsightList
        title="Riscos"
        items={googleAnalytics.googleAnalyticsRisks}
        accent="text-rose-400"
      />

      <InsightList
        title="Oportunidades"
        items={googleAnalytics.googleAnalyticsOpportunities}
        accent="text-emerald-400"
      />

      <div>
        <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-accent">
          Recomendações
        </p>
        <ul className="flex flex-col gap-1.5">
          {googleAnalytics.googleAnalyticsRecommendations.map((rec) => (
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
