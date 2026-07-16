import { cn } from "@/utils/cn";

import { IntegrationEmptyState } from "@/components/integrations/IntegrationEmptyState";
import type { CrmExecutive } from "../services/crm-executive.service";
import { StatusBadge } from "@/features/samuel-ai/components/shared/status-badge";
import { SectionHeader } from "@/features/samuel-ai/components/section-header";

type CrmExecutiveSummarySectionProps = {
  crm: CrmExecutive | null;
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(value);
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

export function CrmExecutiveSummarySection({ crm }: CrmExecutiveSummarySectionProps) {
  if (!crm) {
    return (
      <section className="flex flex-col gap-4">
        <SectionHeader
          title="CRM Executive Summary"
          description="Inteligência comercial integrada ao Samuel AI™"
        />
        <IntegrationEmptyState
          title="Dados de CRM indisponíveis"
          description="Cadastre contacts, leads ou deals no Supabase para a empresa ativa. O CRM só aparece com dados reais."
          docsNote="Tabelas: contacts, leads, deals — migration 002_crm.sql."
          connectHref="/onboarding"
          connectLabel="Configurar empresa"
        />
      </section>
    );
  }

  const healthLabel =
    crm.crmHealthScore >= 75
      ? "Saudável"
      : crm.crmHealthScore >= 50
        ? "Atenção"
        : "Crítico";

  return (
    <section className="flex flex-col gap-4">
      <SectionHeader
        title="CRM Executive Summary"
        description="Inteligência comercial integrada ao Samuel AI™"
      />

      <div className="rounded-xl border border-accent/20 bg-accent/5 px-4 py-3">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[10px] font-medium uppercase tracking-wider text-accent">
            Saúde do CRM
          </p>
          <StatusBadge
            label={healthLabel}
            variant={crm.crmHealthScore >= 75 ? "success" : crm.crmHealthScore >= 50 ? "accent" : "warning"}
          />
        </div>
        <p className="mt-2 text-3xl font-semibold text-foreground">
          {crm.crmHealthScore}
          <span className="text-base text-muted">/100</span>
        </p>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-black/20">
          <div
            className="h-full rounded-full bg-accent"
            style={{ width: `${crm.crmHealthScore}%` }}
          />
        </div>
        <p className="mt-2 text-xs leading-relaxed text-muted">{crm.crmExecutiveSummary}</p>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <div className="rounded-lg border border-border/60 bg-black/10 px-3 py-2.5">
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted">Pipeline</p>
          <p className="mt-1 text-lg font-semibold text-foreground">
            {formatCurrency(crm.pipelineValue)}
          </p>
          <p className="mt-0.5 text-[10px] text-muted">{crm.openDeals} deal(s) aberto(s)</p>
        </div>
        <div className="rounded-lg border border-emerald-500/15 bg-emerald-500/[0.03] px-3 py-2.5">
          <p className="text-[10px] font-medium uppercase tracking-wider text-emerald-400">
            Leads Ativos
          </p>
          <p className="mt-1 text-lg font-semibold text-foreground">{crm.activeLeads}</p>
          <p className="mt-0.5 text-[10px] text-muted">{crm.totalLeads} total</p>
        </div>
        <div className="rounded-lg border border-border/60 bg-black/10 px-3 py-2.5">
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted">Conversão</p>
          <p className="mt-1 text-lg font-semibold text-foreground">{crm.conversionRate}%</p>
          <p className="mt-0.5 text-[10px] text-muted">{crm.wonDeals} deal(s) ganho(s)</p>
        </div>
        <div className="rounded-lg border border-border/60 bg-black/10 px-3 py-2.5">
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted">Contatos</p>
          <p className="mt-1 text-lg font-semibold text-foreground">{crm.totalContacts}</p>
          <p className="mt-0.5 text-[10px] text-muted">{crm.inactiveContacts} inativo(s)</p>
        </div>
      </div>

      <InsightList
        title="Riscos Comerciais"
        items={crm.crmRisks}
        accent="text-rose-400"
      />

      <InsightList
        title="Oportunidades"
        items={crm.crmOpportunities}
        accent="text-emerald-400"
      />

      <div>
        <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-accent">
          Recomendações Executivas
        </p>
        <ul className="flex flex-col gap-1.5">
          {crm.crmRecommendations.map((rec) => (
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
