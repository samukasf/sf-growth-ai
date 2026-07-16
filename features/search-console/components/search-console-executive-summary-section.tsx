import type { ReactNode } from "react";
import { cn } from "@/utils/cn";

import { IntegrationEmptyState } from "@/components/integrations/IntegrationEmptyState";
import type {
  SearchConsoleCoreWebVital,
  SearchConsoleExecutive,
  SearchConsoleIndexingIssue,
  SearchConsoleKeywordOpportunity,
  SearchConsoleQueryMetric,
} from "../services/search-console-executive.service";
import { StatusBadge } from "@/features/samuel-ai/components/shared/status-badge";
import { SectionHeader } from "@/features/samuel-ai/components/section-header";

type SearchConsoleExecutiveSummarySectionProps = {
  searchConsole: SearchConsoleExecutive | null;
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

function ListSection<T>({
  title,
  items,
  accent,
  renderItem,
}: {
  title: string;
  items: T[];
  accent: string;
  renderItem: (item: T, index: number) => ReactNode;
}) {
  return (
    <div>
      <p className={cn("mb-2 text-[10px] font-medium uppercase tracking-wider", accent)}>
        {title}
      </p>
      <ul className="flex flex-col gap-1.5">
        {items.length > 0 ? (
          items.map((item, index) => (
            <li key={index}>{renderItem(item as never, index)}</li>
          ))
        ) : (
          <li className="text-[11px] text-muted">Nenhum dado disponível</li>
        )}
      </ul>
    </div>
  );
}

export function SearchConsoleExecutiveSummarySection({
  searchConsole,
}: SearchConsoleExecutiveSummarySectionProps) {
  if (!searchConsole) {
    return (
      <section className="flex flex-col gap-4">
        <SectionHeader
          title="Google Search Console Executive Summary"
          description="Inteligência SEO orgânica integrada ao Samuel AI™"
        />
        <IntegrationEmptyState
          title="Dados do Search Console indisponíveis"
          description="Defina o access token e a site URL do Search Console no servidor para ativar SEO orgânico."
          envVars={[
            "GOOGLE_SEARCH_CONSOLE_ACCESS_TOKEN",
            "GOOGLE_SEARCH_CONSOLE_SITE_URL",
          ]}
          docsNote="GOOGLE_SEARCH_CONSOLE_SITE_MAP mapeia site por empresa."
        />
      </section>
    );
  }

  const healthLabel =
    searchConsole.seoHealthScore >= 75
      ? "Saudável"
      : searchConsole.seoHealthScore >= 50
        ? "Atenção"
        : "Crítico";

  return (
    <section className="flex flex-col gap-4">
      <SectionHeader
        title="Google Search Console Executive Summary"
        description="Inteligência SEO orgânica integrada ao Samuel AI™"
      />

      <div className="rounded-xl border border-accent/20 bg-accent/5 px-4 py-3">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[10px] font-medium uppercase tracking-wider text-accent">
            SEO Health
          </p>
          <StatusBadge
            label={healthLabel}
            variant={
              searchConsole.seoHealthScore >= 75
                ? "success"
                : searchConsole.seoHealthScore >= 50
                  ? "accent"
                  : "warning"
            }
          />
        </div>
        <p className="mt-2 text-3xl font-semibold text-foreground">
          {searchConsole.seoHealthScore}
          <span className="text-base text-muted">/100</span>
        </p>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-black/20">
          <div
            className="h-full rounded-full bg-accent"
            style={{ width: `${searchConsole.seoHealthScore}%` }}
          />
        </div>
        <p className="mt-2 text-xs leading-relaxed text-muted">
          {searchConsole.searchConsoleExecutiveSummary}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <MetricTile label="Cliques" value={searchConsole.clicks.toLocaleString("pt-BR")} />
        <MetricTile label="Impressões" value={searchConsole.impressions.toLocaleString("pt-BR")} />
        <MetricTile label="CTR" value={`${searchConsole.ctr}%`} />
        <MetricTile label="Posição Média" value={searchConsole.averagePosition} />
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        <ScoreTile label="Tráfego Orgânico" score={searchConsole.organicTrafficScore} />
        <ScoreTile label="CTR Score" score={searchConsole.ctrScore} />
        <ScoreTile label="Core Web Vitals" score={searchConsole.coreWebVitalsScore} />
      </div>

      <ListSection<SearchConsoleCoreWebVital>
        title="Core Web Vitals"
        items={searchConsole.coreWebVitals}
        accent="text-emerald-400"
        renderItem={(metric) => (
          <div className="flex items-center justify-between rounded-lg border border-border/60 bg-black/10 px-3 py-2 text-[11px]">
            <span className="font-medium text-foreground">
              {metric.label}: {metric.value}
            </span>
            <StatusBadge
              label={metric.status === "good" ? "Bom" : metric.status === "poor" ? "Ruim" : "Atenção"}
              variant={metric.status === "good" ? "success" : metric.status === "poor" ? "warning" : "accent"}
            />
          </div>
        )}
      />

      <ListSection<SearchConsoleKeywordOpportunity>
        title="Oportunidades de Keywords"
        items={searchConsole.keywordOpportunities}
        accent="text-sky-400"
        renderItem={(item) => (
          <div className="rounded-lg border border-border/60 bg-black/10 px-3 py-2 text-[11px]">
            <span className="font-medium text-foreground">{item.query}</span>
            <span className="text-muted">
              {" "}
              — pos. {item.position} · {item.impressions.toLocaleString("pt-BR")} imp. · +{item.potentialClicks} cliques potenciais
            </span>
          </div>
        )}
      />

      <ListSection<SearchConsoleQueryMetric>
        title="Top Queries"
        items={searchConsole.topQueries.slice(0, 5)}
        accent="text-violet-400"
        renderItem={(query) => (
          <div className="flex items-center justify-between rounded-lg border border-border/60 bg-black/10 px-3 py-2 text-[11px]">
            <span className="font-medium text-foreground truncate pr-2">{query.query}</span>
            <span className="shrink-0 text-muted">
              {query.clicks} cliques · pos. {query.position}
            </span>
          </div>
        )}
      />

      <ListSection<SearchConsoleIndexingIssue>
        title="Problemas de Indexação"
        items={searchConsole.indexingIssues}
        accent="text-rose-400"
        renderItem={(issue) => (
          <div className="rounded-lg border border-border/60 bg-black/10 px-3 py-2 text-[11px]">
            <span className="font-medium text-foreground">{issue.type}: </span>
            <span className="text-muted">{issue.description}</span>
          </div>
        )}
      />

      <div>
        <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-accent">
          Recomendações
        </p>
        <ul className="flex flex-col gap-1.5">
          {searchConsole.searchConsoleRecommendations.map((rec) => (
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
