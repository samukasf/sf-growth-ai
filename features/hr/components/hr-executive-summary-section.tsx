import { cn } from "@/utils/cn";

import type { HrExecutive } from "../services/hr-executive.service";
import { StatusBadge } from "@/features/samuel-ai/components/shared/status-badge";
import { SectionHeader } from "@/features/samuel-ai/components/section-header";

type HrExecutiveSummarySectionProps = {
  hr: HrExecutive | null;
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

function NeedList({
  title,
  items,
  accent,
}: {
  title: string;
  items: Array<{ id: string; title: string; description: string; priority: string }>;
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
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium text-foreground">{item.title}</span>
                <StatusBadge label={item.priority} variant="muted" />
              </div>
              <p className="mt-1 text-muted">{item.description}</p>
            </li>
          ))
        ) : (
          <li className="text-[11px] text-muted">Nenhum item detectado</li>
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

export function HrExecutiveSummarySection({ hr }: HrExecutiveSummarySectionProps) {
  if (!hr) {
    return (
      <section className="flex flex-col gap-4">
        <SectionHeader
          title="HR Executive Summary"
          description="Inteligência de Recursos Humanos integrada ao Samuel AI™"
        />
        <p className="text-sm text-muted">Dados de RH indisponíveis.</p>
      </section>
    );
  }

  const healthLabel =
    hr.hrHealthScore >= 75 ? "Saudável" : hr.hrHealthScore >= 50 ? "Atenção" : "Crítico";

  return (
    <section className="flex flex-col gap-4">
      <SectionHeader
        title="HR Executive Summary"
        description="Inteligência de Recursos Humanos integrada ao Samuel AI™"
      />

      <div className="rounded-xl border border-accent/20 bg-accent/5 px-4 py-3">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[10px] font-medium uppercase tracking-wider text-accent">
            Saúde da Equipa
          </p>
          <StatusBadge
            label={healthLabel}
            variant={
              hr.hrHealthScore >= 75
                ? "success"
                : hr.hrHealthScore >= 50
                  ? "accent"
                  : "warning"
            }
          />
        </div>
        <p className="mt-2 text-3xl font-semibold text-foreground">
          {hr.hrHealthScore}
          <span className="text-base text-muted">/100</span>
        </p>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-black/20">
          <div
            className="h-full rounded-full bg-accent"
            style={{ width: `${hr.hrHealthScore}%` }}
          />
        </div>
        <p className="mt-2 text-xs leading-relaxed text-muted">{hr.hrExecutiveSummary}</p>
        <p className="mt-1 text-[11px] text-accent">{hr.teamSize} colaborador(es) na equipa</p>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-2">
        <ScoreTile label="Produtividade" score={hr.productivityScore} />
        <ScoreTile label="Engagement" score={hr.engagementScore} />
      </div>

      <NeedList
        title="Necessidades de Contratação"
        items={hr.hiringNeeds}
        accent="text-emerald-400"
      />

      <NeedList title="Gaps de Talento" items={hr.talentGaps} accent="text-amber-400" />

      <InsightList
        title="Riscos de Retenção"
        items={hr.retentionRisks}
        accent="text-rose-400"
      />

      <NeedList title="Formação Necessária" items={hr.trainingNeeds} accent="text-violet-400" />

      <div>
        <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-accent">
          Recomendações
        </p>
        <ul className="flex flex-col gap-1.5">
          {hr.hrRecommendations.map((rec) => (
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
