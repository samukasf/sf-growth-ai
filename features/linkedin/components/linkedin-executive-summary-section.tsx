import { cn } from "@/utils/cn";

import { IntegrationEmptyState } from "@/components/integrations/IntegrationEmptyState";
import type { LinkedInExecutive } from "../services/linkedin-executive.service";
import { StatusBadge } from "@/features/samuel-ai/components/shared/status-badge";
import { SectionHeader } from "@/features/samuel-ai/components/section-header";

type LinkedInExecutiveSummarySectionProps = {
  linkedin: LinkedInExecutive | null;
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

function PostList({
  title,
  items,
  accent,
}: {
  title: string;
  items: Array<{
    id: string;
    title: string;
    format: string;
    engagement: number;
    impressions: number;
    reason: string;
  }>;
  accent: string;
}) {
  return (
    <div>
      <p className={cn("mb-2 text-[10px] font-medium uppercase tracking-wider", accent)}>
        {title}
      </p>
      <ul className="flex flex-col gap-1.5">
        {items.map((item) => (
          <li
            key={item.id}
            className="rounded-lg border border-border/60 bg-black/10 px-3 py-2 text-[11px]"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="font-medium text-foreground">{item.title}</span>
              <StatusBadge label={item.format} variant="muted" />
            </div>
            <p className="mt-1 text-muted">
              {item.engagement.toLocaleString("pt-BR")} engajamentos ·{" "}
              {item.impressions.toLocaleString("pt-BR")} impressões · {item.reason}
            </p>
          </li>
        ))}
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

export function LinkedInExecutiveSummarySection({
  linkedin,
}: LinkedInExecutiveSummarySectionProps) {
  if (!linkedin) {
    return (
      <section className="flex flex-col gap-4">
        <SectionHeader
          title="LinkedIn Executive Summary"
          description="Inteligência LinkedIn B2B integrada ao Samuel AI™"
        />
        <IntegrationEmptyState
          title="Dados do LinkedIn indisponíveis"
          description="Configure um access token da Company Page no servidor para o Samuel ler seguidores, impressões e posts."
          envVars={["LINKEDIN_ACCESS_TOKEN", "LINKEDIN_ORG_ID"]}
          connectHref="/integrations/linkedin/connect"
          connectLabel="Ver como configurar"
        />
      </section>
    );
  }

  const healthLabel =
    linkedin.linkedInHealthScore >= 75
      ? "Saudável"
      : linkedin.linkedInHealthScore >= 50
        ? "Atenção"
        : "Crítico";

  return (
    <section className="flex flex-col gap-4">
      <SectionHeader
        title="LinkedIn Executive Summary"
        description="Inteligência LinkedIn B2B integrada ao Samuel AI™"
      />

      <div className="rounded-xl border border-accent/20 bg-accent/5 px-4 py-3">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[10px] font-medium uppercase tracking-wider text-accent">
            Saúde do LinkedIn
          </p>
          <StatusBadge
            label={healthLabel}
            variant={
              linkedin.linkedInHealthScore >= 75
                ? "success"
                : linkedin.linkedInHealthScore >= 50
                  ? "accent"
                  : "warning"
            }
          />
        </div>
        <p className="mt-2 text-3xl font-semibold text-foreground">
          {linkedin.linkedInHealthScore}
          <span className="text-base text-muted">/100</span>
        </p>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-black/20">
          <div
            className="h-full rounded-full bg-accent"
            style={{ width: `${linkedin.linkedInHealthScore}%` }}
          />
        </div>
        <p className="mt-2 text-xs leading-relaxed text-muted">
          {linkedin.linkedInExecutiveSummary}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <ScoreTile label="Autoridade da Marca" score={linkedin.brandAuthorityScore} />
        <ScoreTile label="Crescimento" score={linkedin.followerGrowthScore} />
        <ScoreTile label="Engagement" score={linkedin.engagementScore} />
        <ScoreTile label="Leads B2B" score={linkedin.leadGenerationScore} />
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        <MetricTile
          label="Alcance"
          value={linkedin.reach.toLocaleString("pt-BR")}
        />
        <ScoreTile label="Conteúdo" score={linkedin.contentPerformance} />
        <MetricTile
          label="Visualizações do Perfil"
          value={linkedin.profileViews.toLocaleString("pt-BR")}
        />
      </div>

      <PostList title="Melhores Posts" items={linkedin.bestPosts} accent="text-emerald-400" />

      <InsightList
        title="Oportunidades"
        items={linkedin.linkedInOpportunities}
        accent="text-emerald-400"
      />

      <InsightList title="Riscos" items={linkedin.linkedInRisks} accent="text-rose-400" />

      <div>
        <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-accent">
          Recomendações
        </p>
        <ul className="flex flex-col gap-1.5">
          {linkedin.linkedInRecommendations.map((rec) => (
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
