import { cn } from "@/utils/cn";

import { IntegrationEmptyState } from "@/components/integrations/IntegrationEmptyState";
import type { GoogleBusinessExecutive } from "../services/google-business-executive.service";
import { StatusBadge } from "@/features/samuel-ai/components/shared/status-badge";
import { SectionHeader } from "@/features/samuel-ai/components/section-header";

type GoogleBusinessExecutiveSummarySectionProps = {
  googleBusiness: GoogleBusinessExecutive | null;
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

export function GoogleBusinessExecutiveSummarySection({
  googleBusiness,
}: GoogleBusinessExecutiveSummarySectionProps) {
  if (!googleBusiness) {
    return (
      <section className="flex flex-col gap-4">
        <SectionHeader
          title="Google Business Executive Summary"
          description="Inteligência do Google Business Profile integrada ao Samuel AI™"
        />
        <IntegrationEmptyState
          title="Dados do Google Business indisponíveis"
          description="Defina o access token e a location do Google Business Profile no servidor."
          envVars={[
            "GOOGLE_BUSINESS_ACCESS_TOKEN",
            "GOOGLE_BUSINESS_LOCATION_NAME",
          ]}
          docsNote="GOOGLE_BUSINESS_LOCATION_MAP permite mapear location por empresa."
        />
      </section>
    );
  }

  const healthLabel =
    googleBusiness.googleBusinessHealthScore >= 75
      ? "Saudável"
      : googleBusiness.googleBusinessHealthScore >= 50
        ? "Atenção"
        : "Crítico";

  return (
    <section className="flex flex-col gap-4">
      <SectionHeader
        title="Google Business Executive Summary"
        description="Inteligência do Google Business Profile integrada ao Samuel AI™"
      />

      <div className="rounded-xl border border-accent/20 bg-accent/5 px-4 py-3">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[10px] font-medium uppercase tracking-wider text-accent">
            Saúde do Perfil
          </p>
          <StatusBadge
            label={healthLabel}
            variant={
              googleBusiness.googleBusinessHealthScore >= 75
                ? "success"
                : googleBusiness.googleBusinessHealthScore >= 50
                  ? "accent"
                  : "warning"
            }
          />
        </div>
        <p className="mt-2 text-3xl font-semibold text-foreground">
          {googleBusiness.googleBusinessHealthScore}
          <span className="text-base text-muted">/100</span>
        </p>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-black/20">
          <div
            className="h-full rounded-full bg-accent"
            style={{ width: `${googleBusiness.googleBusinessHealthScore}%` }}
          />
        </div>
        <p className="mt-2 text-xs leading-relaxed text-muted">
          {googleBusiness.googleBusinessExecutiveSummary}
        </p>
        <p className="mt-1 text-[11px] text-accent">
          Ranking: {googleBusiness.rankingPosition} · {googleBusiness.totalReviews} reviews ·{" "}
          {googleBusiness.averageRating}/5
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <ScoreTile label="Visibilidade" score={googleBusiness.visibilityScore} />
        <ScoreTile label="Avaliações" score={googleBusiness.reviewsScore} />
        <ScoreTile label="Reputação" score={googleBusiness.reputationScore} />
        <ScoreTile label="SEO Local" score={googleBusiness.localSeoScore} />
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        <MetricTile label="Chamadas" value={googleBusiness.calls} />
        <MetricTile label="Cliques no Site" value={googleBusiness.websiteClicks} />
        <MetricTile
          label="Avaliações sem Resposta"
          value={googleBusiness.unansweredReviews}
        />
      </div>

      <InsightList
        title="Riscos"
        items={googleBusiness.googleBusinessRisks}
        accent="text-rose-400"
      />

      <InsightList
        title="Oportunidades"
        items={googleBusiness.googleBusinessOpportunities}
        accent="text-emerald-400"
      />

      <div>
        <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-accent">
          Recomendações
        </p>
        <ul className="flex flex-col gap-1.5">
          {googleBusiness.googleBusinessRecommendations.map((rec) => (
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
