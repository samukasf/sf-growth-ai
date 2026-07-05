import { cn } from "@/utils/cn";

import type { MetaExecutive } from "../services/meta-executive.service";
import { StatusBadge } from "@/features/samuel-ai/components/shared/status-badge";
import { SectionHeader } from "@/features/samuel-ai/components/section-header";

type MetaExecutiveSummarySectionProps = {
  meta: MetaExecutive | null;
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

function PostList({
  title,
  items,
  accent,
}: {
  title: string;
  items: Array<{
    id: string;
    title: string;
    platform: string;
    engagement: number;
    reach: number;
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
              <StatusBadge
                label={item.platform === "instagram" ? "Instagram" : "Facebook"}
                variant="muted"
              />
            </div>
            <p className="mt-1 text-muted">
              {item.engagement.toLocaleString("pt-BR")} engajamentos ·{" "}
              {item.reach.toLocaleString("pt-BR")} alcance · {item.reason}
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

export function MetaExecutiveSummarySection({ meta }: MetaExecutiveSummarySectionProps) {
  if (!meta) {
    return (
      <section className="flex flex-col gap-4">
        <SectionHeader
          title="Meta Executive Summary"
          description="Inteligência Meta (Facebook & Instagram) integrada ao Samuel AI™"
        />
        <p className="text-sm text-muted">Dados Meta indisponíveis.</p>
      </section>
    );
  }

  const healthLabel =
    meta.metaHealthScore >= 75 ? "Saudável" : meta.metaHealthScore >= 50 ? "Atenção" : "Crítico";

  return (
    <section className="flex flex-col gap-4">
      <SectionHeader
        title="Meta Executive Summary"
        description="Inteligência Meta (Facebook & Instagram) integrada ao Samuel AI™"
      />

      <div className="rounded-xl border border-accent/20 bg-accent/5 px-4 py-3">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[10px] font-medium uppercase tracking-wider text-accent">
            Saúde Meta
          </p>
          <StatusBadge
            label={healthLabel}
            variant={
              meta.metaHealthScore >= 75
                ? "success"
                : meta.metaHealthScore >= 50
                  ? "accent"
                  : "warning"
            }
          />
        </div>
        <p className="mt-2 text-3xl font-semibold text-foreground">
          {meta.metaHealthScore}
          <span className="text-base text-muted">/100</span>
        </p>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-black/20">
          <div
            className="h-full rounded-full bg-accent"
            style={{ width: `${meta.metaHealthScore}%` }}
          />
        </div>
        <p className="mt-2 text-xs leading-relaxed text-muted">{meta.metaExecutiveSummary}</p>
        <p className="mt-1 text-[11px] text-accent">
          {meta.followers.toLocaleString("pt-BR")} seguidores · ROAS {meta.roas}x
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <ScoreTile label="Facebook" score={meta.facebookScore} />
        <ScoreTile label="Instagram" score={meta.instagramScore} />
        <ScoreTile label="Alcance" score={meta.reachScore} />
        <ScoreTile label="Engagement" score={meta.engagementScore} />
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        <ScoreTile label="Crescimento" score={meta.followersGrowthScore} />
        <ScoreTile label="Ads" score={meta.paidAdsScore} />
        <div className="rounded-lg border border-emerald-500/15 bg-emerald-500/[0.03] px-3 py-2.5">
          <p className="text-[10px] font-medium uppercase tracking-wider text-emerald-400">ROAS</p>
          <p className="mt-1 text-lg font-semibold text-foreground">{meta.roas}x</p>
          <p className="mt-0.5 text-[10px] text-muted">
            CTR {meta.ctr}% · CPC R$ {meta.cpc.toFixed(2)}
          </p>
        </div>
      </div>

      <PostList
        title="Melhores Posts"
        items={meta.bestPerformingPosts}
        accent="text-emerald-400"
      />

      <PostList
        title="Posts Fracos"
        items={meta.weakPerformingPosts}
        accent="text-amber-400"
      />

      <InsightList title="Riscos" items={meta.metaRisks} accent="text-rose-400" />

      <InsightList
        title="Oportunidades"
        items={meta.metaOpportunities}
        accent="text-emerald-400"
      />

      <div>
        <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-accent">
          Recomendações
        </p>
        <ul className="flex flex-col gap-1.5">
          {meta.metaRecommendations.map((rec) => (
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
