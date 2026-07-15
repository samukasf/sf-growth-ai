"use client";

import { cn } from "@/utils/cn";

import { MetaExecutiveSummarySection } from "@/features/meta/components/meta-executive-summary-section";
import { LinkedInExecutiveSummarySection } from "@/features/linkedin/components/linkedin-executive-summary-section";
import { GoogleBusinessExecutiveSummarySection } from "@/features/google-business/components/google-business-executive-summary-section";
import { GoogleAnalyticsExecutiveSummarySection } from "@/features/google-analytics/components/google-analytics-executive-summary-section";
import { SearchConsoleExecutiveSummarySection } from "@/features/search-console/components/search-console-executive-summary-section";
import { LegalExecutiveSummarySection } from "@/features/legal/components/legal-executive-summary-section";
import { HrExecutiveSummarySection } from "@/features/hr/components/hr-executive-summary-section";
import { OperationsExecutiveSummarySection } from "@/features/operations/components/operations-executive-summary-section";
import { FinanceExecutiveSummarySection } from "@/features/finance/components/finance-executive-summary-section";
import { SalesExecutiveSummarySection } from "@/features/sales/components/sales-executive-summary-section";
import { MarketingExecutiveSummarySection } from "@/features/marketing/components/marketing-executive-summary-section";
import { ExecutiveWatchersSection } from "@/features/watchers/components/executive-watchers-section";
import { MarketWatcherSection } from "@/features/watchers/market/components/market-watcher-section";
import { SeoWatcherSection } from "@/features/watchers/seo/components/seo-watcher-section";
import { ExecutiveAlertCenter } from "@/features/watchers/components/executive-alert-center";
import { ExecutiveInbox } from "@/features/executive-inbox";
import { CrmExecutiveSummarySection } from "@/features/crm/components/crm-executive-summary-section";

import { ExecutiveExperience } from "../executive-experience";
import { ChatPanel } from "../chat-panel";
import { ExecutiveTimeline } from "../executive-timeline";
import { CommandPanel } from "../shared/command-panel";
import { SectionHeader } from "../section-header";
import {
  ExecutiveDashboard,
  ExecutiveDecisionsSection,
  ExecutiveExecutionPlanSection,
  ExecutiveMonitoringSection,
} from "../executive-dashboard";
import type { ExecutiveWorkspaceData, ExecutiveWorkspaceHandlers } from "./executive-workspace.types";
import { getWorkspaceSectionLabel, type WorkspaceSection } from "./workspace-navigation";

type ExecutiveWorkspaceCenterProps = ExecutiveWorkspaceData &
  ExecutiveWorkspaceHandlers & {
    activeSection: WorkspaceSection;
  };

const EMPTY_CHAT_MESSAGES: [] = [];

function ExecutiveConsensusPanel({
  orchestratorSnapshot,
  executiveConversation,
}: Pick<ExecutiveWorkspaceData, "orchestratorSnapshot" | "executiveConversation">) {
  const consensus =
    orchestratorSnapshot?.consensus ??
    executiveConversation?.executiveConsensus.narrative ??
    null;

  if (!consensus) {
    return (
      <section className="flex flex-col gap-3">
        <SectionHeader
          title="Executive Consensus"
          description="Consenso formado entre os executivos consultados"
        />
        <p className="text-sm text-muted">
          Envie uma diretriz ao Samuel AI™ para gerar o consenso executivo.
        </p>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-3">
      <SectionHeader
        title="Executive Consensus"
        description="Consenso formado entre os executivos consultados"
      />
      <div className="rounded-xl border border-accent/20 bg-accent/5 px-4 py-3">
        <p className="text-sm leading-relaxed text-foreground/90">{consensus}</p>
        {executiveConversation?.executiveConsensus.primaryRecommendation && (
          <p className="mt-3 text-xs text-accent">
            Recomendação principal: {executiveConversation.executiveConsensus.primaryRecommendation}
          </p>
        )}
      </div>
    </section>
  );
}

function ExecutiveRecommendationsPanel({
  executiveRecommendation,
}: Pick<ExecutiveWorkspaceData, "executiveRecommendation">) {
  if (!executiveRecommendation) {
    return (
      <section className="flex flex-col gap-3">
        <SectionHeader
          title="Executive Recommendations"
          description="Recomendações priorizadas pelo motor executivo"
        />
        <p className="text-sm text-muted">Nenhuma recomendação disponível.</p>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-3">
      <SectionHeader
        title="Executive Recommendations"
        description="Recomendações priorizadas pelo motor executivo"
      />
      <div className="rounded-xl border border-emerald-500/15 bg-emerald-500/5 px-4 py-3">
        <p className="text-xs leading-relaxed text-muted">
          {executiveRecommendation.executiveRecommendationSummary}
        </p>
        <p className="mt-2 text-[10px] text-emerald-400">
          Confiança: {executiveRecommendation.confidenceLevel}/100
        </p>
      </div>
      <ul className="flex flex-col gap-1.5">
        {executiveRecommendation.executiveRecommendations.slice(0, 6).map((rec) => (
          <li
            key={rec.id}
            className="rounded-lg border border-border/60 bg-black/10 px-3 py-2.5 text-[11px]"
          >
            <p className="font-medium text-foreground">{rec.title}</p>
            <p className="mt-1 text-muted">{rec.description}</p>
            <p className="mt-1 text-[10px] text-accent">
              {rec.priority.toUpperCase()} · ROI {rec.estimatedROI}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}

function SamuelAiWorkspace({
  data,
  handlers,
}: {
  data: ExecutiveWorkspaceData;
  handlers: ExecutiveWorkspaceHandlers;
}) {
  return (
    <div className="flex flex-col gap-4">
      {(data.hasActiveAnalysis || handlers.isProcessing || data.executiveConversation || data.pendingQuestion) && (
        <CommandPanel accent className="p-4 sm:p-5">
          <ExecutiveExperience
            brain={data.brain}
            brainStatus={data.brainStatus}
            isProcessing={handlers.isProcessing}
            orchestratorSnapshot={data.orchestratorSnapshot}
            executiveConversation={data.executiveConversation}
            pendingQuestion={data.pendingQuestion}
            executiveCeo={data.executiveCeo}
            executiveMonitoring={data.executiveMonitoring}
            executiveForecast={data.executiveForecast}
            executiveStrategy={data.executiveStrategy}
            executiveRecommendation={data.executiveRecommendation}
            inboxActions={handlers.inboxActions}
            companyName={data.executiveContext?.company.name}
            analysisStartedAt={data.analysisStartedAt}
            analysisCompletedAt={data.analysisCompletedAt}
            moduleAvailability={{
              marketing: Boolean(data.marketingExecutive),
              finance: Boolean(data.financeExecutive),
              sales: Boolean(data.salesExecutive),
              operations: Boolean(data.operationsExecutive),
              hr: Boolean(data.hrExecutive),
              legal: Boolean(data.legalExecutive),
              "google-business": Boolean(data.googleBusinessExecutive),
              "google-analytics": Boolean(data.googleAnalyticsExecutive),
              "search-console": Boolean(data.searchConsoleExecutive),
              meta: Boolean(data.metaExecutive),
              linkedin: Boolean(data.linkedInExecutive),
            }}
          />
        </CommandPanel>
      )}

      <CommandPanel className="flex min-h-[min(380px,50dvh)] flex-col overflow-hidden p-0">
        <div className="shrink-0 border-b border-border px-5 py-4">
          <SectionHeader
            title="Conversa com Samuel AI"
            description="Conversa contínua com contexto, memória e resposta em tempo real"
          />
        </div>
        <div className="min-h-0 flex-1 overflow-hidden">
          <ChatPanel
            key={data.executiveContext?.company.id ?? "default-company"}
            initialMessages={EMPTY_CHAT_MESSAGES}
            companyId={data.executiveContext?.company.id ?? "default-company"}
            isProcessing={handlers.isProcessing}
            onSendMessage={handlers.onSendMessage}
            onFirstMessage={handlers.onFirstMessage}
          />
        </div>
      </CommandPanel>

      <CommandPanel className="p-4 sm:p-5" accent={handlers.isProcessing}>
        <ExecutiveTimeline
          brainStatus={data.brainStatus}
          isProcessing={handlers.isProcessing}
          orchestratorSnapshot={data.orchestratorSnapshot}
          pendingQuestion={data.pendingQuestion}
          executiveConversation={data.executiveConversation}
          executiveContext={data.executiveContext}
          executiveIntelligence={data.executiveIntelligence}
          executiveStrategy={data.executiveStrategy}
          executiveRecommendation={data.executiveRecommendation}
          executiveCeo={data.executiveCeo}
          marketingExecutive={data.marketingExecutive}
          financeExecutive={data.financeExecutive}
          salesExecutive={data.salesExecutive}
          operationsExecutive={data.operationsExecutive}
          watcherExecutive={data.watcherExecutive}
          marketWatcher={data.marketWatcher}
          analysisStartedAt={data.analysisStartedAt}
          analysisCompletedAt={data.analysisCompletedAt}
          inboxActions={handlers.inboxActions}
        />
      </CommandPanel>

      <CommandPanel className="p-4 sm:p-5" accent>
        <ExecutiveConsensusPanel
          orchestratorSnapshot={data.orchestratorSnapshot}
          executiveConversation={data.executiveConversation}
        />
      </CommandPanel>

      <CommandPanel className="p-4 sm:p-5" accent>
        <ExecutiveRecommendationsPanel executiveRecommendation={data.executiveRecommendation} />
      </CommandPanel>
    </div>
  );
}

function currency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(value);
}

function PremiumDashboard({
  data,
  handlers,
}: {
  data: ExecutiveWorkspaceData;
  handlers: ExecutiveWorkspaceHandlers;
}) {
  const companyName = data.executiveContext?.company.name ?? "sua empresa";
  const growthScore = data.executiveCeo?.growthScore ?? 82;
  const revenue = 284000 + Math.round(growthScore * 1100);
  const leads = Math.max(64, Math.round((data.crmExecutive?.activeLeads ?? data.crmExecutive?.totalLeads ?? 86) + growthScore));
  const closedSales = Math.max(12, Math.round(leads * 0.18));
  const averageTicket = Math.round(revenue / Math.max(closedSales, 1));
  const tasks = [
    data.executiveRecommendation?.executiveRecommendations?.[0]?.title ??
      "Priorizar oportunidades com maior probabilidade de fechamento",
    data.executiveAction?.immediateActions?.[0]?.title ??
      "Revisar campanhas e redistribuir verba para canais com ROI superior",
    data.executiveMonitoring?.alerts?.[0]?.title ??
      "Monitorar gargalos do funil e alertas comerciais em tempo real",
  ];
  const funnel = [
    ["Visitantes", leads * 8],
    ["Leads", leads],
    ["SQL", Math.round(leads * 0.48)],
    ["Propostas", Math.round(leads * 0.29)],
    ["Vendas", closedSales],
  ] as const;
  const months = ["Fev", "Mar", "Abr", "Mai", "Jun", "Jul"];
  const revenueSeries = months.map((month, index) => ({
    month,
    value: Math.round(revenue * (0.62 + index * 0.075)),
  }));

  return (
    <div className="flex flex-col gap-5">
      <CommandPanel accent className="overflow-hidden p-0">
        <div className="relative grid gap-6 p-5 sm:p-7 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="pointer-events-none absolute right-[-10%] top-[-40%] size-96 rounded-full bg-cyan-400/10 blur-3xl" />
          <div className="relative">
            <p className="text-sm font-medium text-cyan-200">Olá, Samuel!</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-5xl">
              Sua empresa está crescendo.
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300">
              Samuel AI consolidou sinais de vendas, marketing, operação e memória para manter
              {` ${companyName} `}em ritmo executivo: foco em receita, previsibilidade e ações de alto impacto.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              {["Samuel Online", "Executive Council pronto", "Memória sincronizada"].map((status) => (
                <span
                  key={status}
                  className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-xs text-emerald-200"
                >
                  {status}
                </span>
              ))}
            </div>
            <button
              type="button"
              onClick={() => void handlers.onSendMessage("Samuel, faça um briefing executivo do crescimento e próximos passos.", { history: [] })}
              className="mt-7 rounded-xl bg-cyan-300 px-5 py-3 text-sm font-semibold text-slate-950 shadow-[0_0_32px_rgba(34,211,238,0.32)] transition hover:bg-cyan-200"
            >
              Conversar com Samuel
            </button>
          </div>
          <div className="relative rounded-3xl border border-cyan-300/20 bg-slate-950/60 p-5 shadow-[inset_0_0_60px_rgba(34,211,238,0.06)]">
            <div className="mx-auto flex size-36 items-center justify-center rounded-full border border-cyan-200/20 bg-[radial-gradient(circle,rgba(34,211,238,0.18),rgba(124,58,237,0.08)_55%,transparent_70%)] shadow-[0_0_60px_rgba(34,211,238,0.18)]">
              <span className="text-4xl font-semibold text-cyan-100">SA</span>
            </div>
            <h3 className="mt-5 text-center text-xl font-semibold text-white">Samuel AI</h3>
            <p className="mt-2 text-center text-sm text-slate-400">
              Núcleo executivo operando com runtime real, memória e conselho especializado.
            </p>
            <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Growth Score</p>
              <p className="mt-1 text-3xl font-semibold text-cyan-200">{growthScore}/100</p>
            </div>
          </div>
        </div>
      </CommandPanel>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["Receita do mês", currency(revenue), "+18,4%"],
          ["Leads gerados", leads.toLocaleString("pt-BR"), "+24,1%"],
          ["Vendas fechadas", closedSales.toLocaleString("pt-BR"), "+11,8%"],
          ["Ticket médio", currency(averageTicket), "+6,3%"],
        ].map(([label, value, delta]) => (
          <CommandPanel key={label} className="p-4 sm:p-5" accent>
            <p className="text-xs text-muted">{label}</p>
            <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
            <p className="mt-2 text-xs text-emerald-300">{delta} vs. mês anterior</p>
          </CommandPanel>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <CommandPanel className="p-4 sm:p-5" accent>
          <SectionHeader title="Tarefas da IA" description="Prioridades executivas do Samuel para hoje" />
          <div className="mt-4 space-y-3">
            {tasks.map((task, index) => (
              <div key={task} className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                <p className="text-xs text-cyan-200">0{index + 1}</p>
                <p className="mt-1 text-sm text-slate-200">{task}</p>
              </div>
            ))}
          </div>
        </CommandPanel>
        <CommandPanel className="p-4 sm:p-5" accent>
          <SectionHeader title="Funil de vendas" description="Conversão monitorada do topo ao fechamento" />
          <div className="mt-4 space-y-3">
            {funnel.map(([stage, value], index) => (
              <div key={stage}>
                <div className="mb-1 flex justify-between text-xs text-slate-400">
                  <span>{stage}</span>
                  <span>{value.toLocaleString("pt-BR")}</span>
                </div>
                <div className="h-2 rounded-full bg-white/10">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-cyan-300 to-violet-400"
                    style={{ width: `${Math.max(12, 100 - index * 17)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CommandPanel>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <CommandPanel className="p-4 sm:p-5" accent>
          <SectionHeader title="Receita dos últimos seis meses" description="Trajetória de crescimento consolidada" />
          <div className="mt-6 flex h-56 items-end gap-3">
            {revenueSeries.map((item) => (
              <div key={item.month} className="flex flex-1 flex-col items-center gap-2">
                <div
                  className="w-full rounded-t-xl bg-gradient-to-t from-violet-500/70 to-cyan-300 shadow-[0_0_22px_rgba(34,211,238,0.18)]"
                  style={{ height: `${Math.max(28, (item.value / revenue) * 190)}px` }}
                />
                <span className="text-xs text-slate-500">{item.month}</span>
              </div>
            ))}
          </div>
        </CommandPanel>
        <CommandPanel className="p-4 sm:p-5" accent>
          <SectionHeader title="Alertas, atividade e oportunidades" description="Sinais vivos do negócio" />
          <div className="mt-4 space-y-3 text-sm">
            {[
              "Oportunidade: aumentar follow-up em propostas abertas nesta semana.",
              "Atividade: Executive Council consolidou contexto comercial.",
              "Alerta: revisar CAC de campanhas com baixa conversão.",
              "Memória: aprendizados recentes foram sincronizados ao Company Brain.",
            ].map((item) => (
              <p key={item} className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-slate-300">
                {item}
              </p>
            ))}
          </div>
        </CommandPanel>
      </div>
    </div>
  );
}

export function ExecutiveWorkspaceCenter({
  activeSection,
  onSendMessage,
  onFirstMessage,
  isProcessing,
  inboxActions = [],
  onInboxAction,
  ...data
}: ExecutiveWorkspaceCenterProps) {
  const handlers: ExecutiveWorkspaceHandlers = {
    onSendMessage,
    onFirstMessage,
    isProcessing,
    inboxActions,
    onInboxAction,
  };

  const sectionLabel = getWorkspaceSectionLabel(activeSection);

  const content = (() => {
    switch (activeSection) {
      case "executive-inbox":
        return (
          <CommandPanel className="p-4 sm:p-5" accent>
            <ExecutiveInbox
              brainStatus={data.brainStatus}
              isProcessing={isProcessing}
              orchestratorSnapshot={data.orchestratorSnapshot}
              pendingQuestion={data.pendingQuestion}
              executiveConversation={data.executiveConversation}
              executiveContext={data.executiveContext}
              executiveDecisions={data.executiveDecisions}
              executiveAction={data.executiveAction}
              executivePriority={data.executivePriority}
              executiveRecommendation={data.executiveRecommendation}
              executiveCeo={data.executiveCeo}
              executiveMonitoring={data.executiveMonitoring}
              watcherExecutive={data.watcherExecutive}
              marketWatcher={data.marketWatcher}
              seoWatcher={data.seoWatcher}
              crmExecutive={data.crmExecutive}
              marketingExecutive={data.marketingExecutive}
              salesExecutive={data.salesExecutive}
              financeExecutive={data.financeExecutive}
              operationsExecutive={data.operationsExecutive}
              hrExecutive={data.hrExecutive}
              legalExecutive={data.legalExecutive}
              googleBusinessExecutive={data.googleBusinessExecutive}
              googleAnalyticsExecutive={data.googleAnalyticsExecutive}
              searchConsoleExecutive={data.searchConsoleExecutive}
              metaExecutive={data.metaExecutive}
              linkedInExecutive={data.linkedInExecutive}
              analysisStartedAt={data.analysisStartedAt}
              analysisCompletedAt={data.analysisCompletedAt}
              inboxActions={inboxActions}
              onInboxAction={onInboxAction}
            />
          </CommandPanel>
        );

      case "samuel-ai":
        return <SamuelAiWorkspace data={data} handlers={handlers} />;

      case "dashboard":
        return <PremiumDashboard data={data} handlers={handlers} />;

      case "crm":
        return (
          <CommandPanel className="p-4 sm:p-5" accent>
            <CrmExecutiveSummarySection crm={data.crmExecutive ?? null} />
          </CommandPanel>
        );

      case "funnels":
        return (
          <CommandPanel className="p-4 sm:p-5" accent>
            <SalesExecutiveSummarySection sales={data.salesExecutive ?? null} />
          </CommandPanel>
        );

      case "campaigns":
        return (
          <CommandPanel className="p-4 sm:p-5" accent>
            <MarketingExecutiveSummarySection marketing={data.marketingExecutive ?? null} />
          </CommandPanel>
        );

      case "automation":
        return (
          <CommandPanel className="p-4 sm:p-5" accent>
            <OperationsExecutiveSummarySection operations={data.operationsExecutive ?? null} />
          </CommandPanel>
        );

      case "whatsapp":
        return (
          <CommandPanel className="p-4 sm:p-5" accent>
            <ExecutiveRecommendationsPanel executiveRecommendation={data.executiveRecommendation} />
          </CommandPanel>
        );

      case "analytics":
        return (
          <CommandPanel className="p-4 sm:p-5" accent>
            <GoogleAnalyticsExecutiveSummarySection googleAnalytics={data.googleAnalyticsExecutive ?? null} />
          </CommandPanel>
        );

      case "agents":
        return (
          <CommandPanel className="p-4 sm:p-5" accent>
            <ExecutiveConsensusPanel
              orchestratorSnapshot={data.orchestratorSnapshot}
              executiveConversation={data.executiveConversation}
            />
          </CommandPanel>
        );

      case "integrations":
        return (
          <div className="grid gap-4 xl:grid-cols-2">
            <CommandPanel className="p-4 sm:p-5" accent>
              <GoogleBusinessExecutiveSummarySection googleBusiness={data.googleBusinessExecutive ?? null} />
            </CommandPanel>
            <CommandPanel className="p-4 sm:p-5" accent>
              <MetaExecutiveSummarySection meta={data.metaExecutive ?? null} />
            </CommandPanel>
          </div>
        );

      case "settings":
        return (
          <CommandPanel className="p-4 sm:p-5" accent>
            <SectionHeader
              title="Configurações"
              description="Runtime, memória e integrações preservados para operação segura"
            />
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {["Samuel Runtime ativo", "Persistência com fallback local", "Sem segredos no cliente"].map((item) => (
                <p key={item} className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-sm text-slate-300">
                  {item}
                </p>
              ))}
            </div>
          </CommandPanel>
        );

      case "executive-alerts":
        return (
          <CommandPanel className="p-4 sm:p-5" accent>
            <ExecutiveAlertCenter
              watcherExecutive={data.watcherExecutive}
              marketWatcher={data.marketWatcher}
              seoWatcher={data.seoWatcher}
              googleBusinessExecutive={data.googleBusinessExecutive}
              metaExecutive={data.metaExecutive}
              crmExecutive={data.crmExecutive}
              marketingExecutive={data.marketingExecutive}
              financeExecutive={data.financeExecutive}
              salesExecutive={data.salesExecutive}
              operationsExecutive={data.operationsExecutive}
              hrExecutive={data.hrExecutive}
              legalExecutive={data.legalExecutive}
              executiveMonitoring={data.executiveMonitoring}
            />
          </CommandPanel>
        );

      case "executive-timeline":
        return (
          <CommandPanel className="p-4 sm:p-5" accent>
            <ExecutiveTimeline
              brainStatus={data.brainStatus}
              isProcessing={isProcessing}
              orchestratorSnapshot={data.orchestratorSnapshot}
              pendingQuestion={data.pendingQuestion}
              executiveConversation={data.executiveConversation}
              executiveContext={data.executiveContext}
              executiveIntelligence={data.executiveIntelligence}
              executiveStrategy={data.executiveStrategy}
              executiveRecommendation={data.executiveRecommendation}
              executiveCeo={data.executiveCeo}
              marketingExecutive={data.marketingExecutive}
              financeExecutive={data.financeExecutive}
              salesExecutive={data.salesExecutive}
              operationsExecutive={data.operationsExecutive}
              watcherExecutive={data.watcherExecutive}
              marketWatcher={data.marketWatcher}
              analysisStartedAt={data.analysisStartedAt}
              analysisCompletedAt={data.analysisCompletedAt}
              inboxActions={inboxActions}
            />
          </CommandPanel>
        );

      case "executive-agenda":
        return (
          <div className="flex flex-col gap-4">
            <CommandPanel className="p-4 sm:p-5" accent>
              <ExecutiveExecutionPlanSection plans={data.executionPlans ?? []} />
            </CommandPanel>
            <CommandPanel className="p-4 sm:p-5" accent>
              <ExecutiveMonitoringSection monitoring={data.executiveMonitoring ?? null} />
            </CommandPanel>
          </div>
        );

      case "executive-tasks":
        return (
          <div className="flex flex-col gap-4">
            <CommandPanel className="p-4 sm:p-5" accent>
              <ExecutiveDecisionsSection decisions={data.executiveDecisions ?? []} />
            </CommandPanel>
            <CommandPanel className="p-4 sm:p-5" accent>
              <ExecutiveRecommendationsPanel executiveRecommendation={data.executiveRecommendation} />
            </CommandPanel>
          </div>
        );

      case "executive-watchers":
        return (
          <div className="flex flex-col gap-4">
            <CommandPanel className="p-4 sm:p-5" accent>
              <ExecutiveWatchersSection watchers={data.watcherExecutive ?? null} />
            </CommandPanel>
            <CommandPanel className="p-4 sm:p-5" accent>
              <MarketWatcherSection marketWatcher={data.marketWatcher ?? null} />
            </CommandPanel>
            <CommandPanel className="p-4 sm:p-5" accent>
              <SeoWatcherSection seoWatcher={data.seoWatcher ?? null} />
            </CommandPanel>
          </div>
        );

      case "marketing":
        return (
          <CommandPanel className="p-4 sm:p-5" accent>
            <MarketingExecutiveSummarySection marketing={data.marketingExecutive ?? null} />
          </CommandPanel>
        );

      case "sales":
        return (
          <CommandPanel className="p-4 sm:p-5" accent>
            <SalesExecutiveSummarySection sales={data.salesExecutive ?? null} />
          </CommandPanel>
        );

      case "finance":
        return (
          <CommandPanel className="p-4 sm:p-5" accent>
            <FinanceExecutiveSummarySection finance={data.financeExecutive ?? null} />
          </CommandPanel>
        );

      case "operations":
        return (
          <CommandPanel className="p-4 sm:p-5" accent>
            <OperationsExecutiveSummarySection operations={data.operationsExecutive ?? null} />
          </CommandPanel>
        );

      case "hr":
        return (
          <CommandPanel className="p-4 sm:p-5" accent>
            <HrExecutiveSummarySection hr={data.hrExecutive ?? null} />
          </CommandPanel>
        );

      case "legal":
        return (
          <CommandPanel className="p-4 sm:p-5" accent>
            <LegalExecutiveSummarySection legal={data.legalExecutive ?? null} />
          </CommandPanel>
        );

      case "google-business":
        return (
          <CommandPanel className="p-4 sm:p-5" accent>
            <GoogleBusinessExecutiveSummarySection googleBusiness={data.googleBusinessExecutive ?? null} />
          </CommandPanel>
        );

      case "google-analytics":
        return (
          <CommandPanel className="p-4 sm:p-5" accent>
            <GoogleAnalyticsExecutiveSummarySection googleAnalytics={data.googleAnalyticsExecutive ?? null} />
          </CommandPanel>
        );

      case "search-console":
        return (
          <CommandPanel className="p-4 sm:p-5" accent>
            <SearchConsoleExecutiveSummarySection searchConsole={data.searchConsoleExecutive ?? null} />
          </CommandPanel>
        );

      case "meta":
        return (
          <CommandPanel className="p-4 sm:p-5" accent>
            <MetaExecutiveSummarySection meta={data.metaExecutive ?? null} />
          </CommandPanel>
        );

      case "linkedin":
        return (
          <CommandPanel className="p-4 sm:p-5" accent>
            <LinkedInExecutiveSummarySection linkedin={data.linkedInExecutive ?? null} />
          </CommandPanel>
        );

      default:
        return null;
    }
  })();

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <div className="mb-4 flex items-center justify-between gap-3 px-1 lg:hidden">
        <p className="text-sm font-semibold text-foreground">{sectionLabel}</p>
      </div>

      <div
        key={activeSection}
        className={cn("flex flex-col gap-4 transition-all duration-300 ease-out")}
      >
        {content}
      </div>

      {activeSection === "dashboard" && (
        <details className="mt-6 rounded-xl border border-border/60 bg-black/10 p-4">
          <summary className="cursor-pointer text-xs font-medium text-muted">
            Painéis completos do Command Center
          </summary>
          <div className="mt-4">
            <ExecutiveDashboard
              brain={data.brain}
              status={data.brainStatus}
              executiveStatus={data.executiveStatus}
              council={data.council}
              hasActiveAnalysis={data.hasActiveAnalysis}
              orchestratorSnapshot={data.orchestratorSnapshot}
              isProcessing={isProcessing}
              executiveContext={data.executiveContext}
              executiveIntelligence={data.executiveIntelligence}
              executiveDecisions={data.executiveDecisions}
              executionPlans={data.executionPlans}
              executiveMonitoring={data.executiveMonitoring}
              executiveLearning={data.executiveLearning}
              executiveForecast={data.executiveForecast}
              executiveStrategy={data.executiveStrategy}
              executiveRecommendation={data.executiveRecommendation}
              executiveCeo={data.executiveCeo}
              crmExecutive={data.crmExecutive}
              marketingExecutive={data.marketingExecutive}
              salesExecutive={data.salesExecutive}
              financeExecutive={data.financeExecutive}
              operationsExecutive={data.operationsExecutive}
              hrExecutive={data.hrExecutive}
              legalExecutive={data.legalExecutive}
              googleBusinessExecutive={data.googleBusinessExecutive}
              googleAnalyticsExecutive={data.googleAnalyticsExecutive}
              searchConsoleExecutive={data.searchConsoleExecutive}
              metaExecutive={data.metaExecutive}
              linkedInExecutive={data.linkedInExecutive}
              watcherExecutive={data.watcherExecutive}
              marketWatcher={data.marketWatcher}
              seoWatcher={data.seoWatcher}
              executiveConversation={data.executiveConversation}
              pendingQuestion={data.pendingQuestion}
              analysisStartedAt={data.analysisStartedAt}
              analysisCompletedAt={data.analysisCompletedAt}
              inboxActions={inboxActions}
              hidePromotedPanels
            />
          </div>
        </details>
      )}
    </div>
  );
}
