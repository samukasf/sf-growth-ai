import { cn } from "@/utils/cn";

import type { FinanceExecutive } from "../services/finance-executive.service";
import { StatusBadge } from "@/features/samuel-ai/components/shared/status-badge";
import { SectionHeader } from "@/features/samuel-ai/components/section-header";

type FinanceExecutiveSummarySectionProps = {
  finance: FinanceExecutive | null;
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

export function FinanceExecutiveSummarySection({
  finance,
}: FinanceExecutiveSummarySectionProps) {
  if (!finance) {
    return (
      <section className="flex flex-col gap-4">
        <SectionHeader
          title="Finance Executive Summary"
          description="Inteligência financeira integrada ao Samuel AI™"
        />
        <p className="text-sm text-muted">Dados financeiros indisponíveis.</p>
      </section>
    );
  }

  const healthLabel =
    finance.financeHealthScore >= 75
      ? "Saudável"
      : finance.financeHealthScore >= 50
        ? "Atenção"
        : "Crítico";

  const profitPositive = finance.monthlyProfit >= 0;

  return (
    <section className="flex flex-col gap-4">
      <SectionHeader
        title="Finance Executive Summary"
        description="Inteligência financeira integrada ao Samuel AI™"
      />

      <div className="rounded-xl border border-accent/20 bg-accent/5 px-4 py-3">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[10px] font-medium uppercase tracking-wider text-accent">
            Saúde Financeira
          </p>
          <StatusBadge
            label={healthLabel}
            variant={
              finance.financeHealthScore >= 75
                ? "success"
                : finance.financeHealthScore >= 50
                  ? "accent"
                  : "warning"
            }
          />
        </div>
        <p className="mt-2 text-3xl font-semibold text-foreground">
          {finance.financeHealthScore}
          <span className="text-base text-muted">/100</span>
        </p>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-black/20">
          <div
            className="h-full rounded-full bg-accent"
            style={{ width: `${finance.financeHealthScore}%` }}
          />
        </div>
        <p className="mt-2 text-xs leading-relaxed text-muted">
          {finance.financeExecutiveSummary}
        </p>
        <p className="mt-1 text-[11px] text-accent">Runway: {finance.runway}</p>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        <div className="rounded-lg border border-emerald-500/15 bg-emerald-500/[0.03] px-3 py-2.5">
          <p className="text-[10px] font-medium uppercase tracking-wider text-emerald-400">
            Receita
          </p>
          <p className="mt-1 text-lg font-semibold text-foreground">
            {formatCurrency(finance.monthlyRevenue)}
          </p>
          <p className="mt-0.5 text-[10px] text-muted">mensal</p>
        </div>
        <div className="rounded-lg border border-rose-500/15 bg-rose-500/[0.03] px-3 py-2.5">
          <p className="text-[10px] font-medium uppercase tracking-wider text-rose-400">
            Despesas
          </p>
          <p className="mt-1 text-lg font-semibold text-foreground">
            {formatCurrency(finance.monthlyExpenses)}
          </p>
          <p className="mt-0.5 text-[10px] text-muted">mensal</p>
        </div>
        <div
          className={cn(
            "rounded-lg border px-3 py-2.5",
            profitPositive
              ? "border-emerald-500/15 bg-emerald-500/[0.03]"
              : "border-rose-500/15 bg-rose-500/[0.03]",
          )}
        >
          <p
            className={cn(
              "text-[10px] font-medium uppercase tracking-wider",
              profitPositive ? "text-emerald-400" : "text-rose-400",
            )}
          >
            Lucro
          </p>
          <p className="mt-1 text-lg font-semibold text-foreground">
            {formatCurrency(finance.monthlyProfit)}
          </p>
          <p className="mt-0.5 text-[10px] text-muted">mensal</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-2">
        <ScoreTile label="Margem" score={finance.profitMargin} />
        <ScoreTile label="Fluxo de Caixa" score={finance.cashFlowScore} />
      </div>

      <InsightList
        title="Riscos"
        items={finance.financialRisks}
        accent="text-rose-400"
      />

      <InsightList
        title="Oportunidades"
        items={finance.financialOpportunities}
        accent="text-emerald-400"
      />

      <div>
        <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-accent">
          Recomendações
        </p>
        <ul className="flex flex-col gap-1.5">
          {finance.financialRecommendations.map((rec) => (
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
