"use client";

import type { LucideIcon } from "lucide-react";
import {
  BrainCircuit,
  CalendarDays,
  Globe2,
  Inbox,
  ListTodo,
  Radar,
  WandSparkles,
} from "lucide-react";

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
import { CrmExecutiveSummarySection } from "@/features/crm/components/crm-executive-summary-section";
import { MarketingExecutiveSummarySection } from "@/features/marketing/components/marketing-executive-summary-section";
import { ExecutiveWatchersSection } from "@/features/watchers/components/executive-watchers-section";
import { MarketWatcherSection } from "@/features/watchers/market/components/market-watcher-section";
import { SeoWatcherSection } from "@/features/watchers/seo/components/seo-watcher-section";
import { ExecutiveAlertCenter } from "@/features/watchers/components/executive-alert-center";
import { ExecutiveInbox } from "@/features/executive-inbox";
import { SamuelStudio } from "@/features/samuel-ai/studio";
import { AutonomousImprovementPanel } from "@/features/samuel-ai/autonomous-improvement";

import { ExecutiveExperience } from "../executive-experience";
import { ChatPanel } from "../chat-panel";
import { ExecutiveTimeline } from "../executive-timeline";
import { SamuelSiteBuilder } from "../site-builder";
import { CommandPanel } from "../shared/command-panel";
import { SectionHeader } from "../section-header";
import {
  ExecutiveDecisionsSection,
  ExecutiveExecutionPlanSection,
  ExecutiveMonitoringSection,
} from "../executive-dashboard";
import type { ExecutiveWorkspaceData, ExecutiveWorkspaceHandlers } from "./executive-workspace.types";
import { SamuelExecutiveHome } from "./SamuelExecutiveHome";
import { getWorkspaceSectionLabel, type WorkspaceSection } from "./workspace-navigation";

type ExecutiveWorkspaceCenterProps = ExecutiveWorkspaceData &
  ExecutiveWorkspaceHandlers & {
    activeSection: WorkspaceSection;
    onSectionChange: (section: WorkspaceSection) => void;
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
  onNavigate,
}: {
  data: ExecutiveWorkspaceData;
  handlers: ExecutiveWorkspaceHandlers;
  onNavigate: (section: WorkspaceSection) => void;
}) {
  const flowActions: Array<{
    section: WorkspaceSection;
    label: string;
    description: string;
    icon: LucideIcon;
  }> = [
    {
      section: "executive-inbox",
      label: "Inbox",
      description: "E-mails, alertas e decisões",
      icon: Inbox,
    },
    {
      section: "executive-agenda",
      label: "Agenda",
      description: "Compromissos e execução",
      icon: CalendarDays,
    },
    {
      section: "executive-tasks",
      label: "Tarefas",
      description: "Prioridades e decisões",
      icon: ListTodo,
    },
    {
      section: "site-builder",
      label: "Sites",
      description: "Criador navegável",
      icon: Globe2,
    },
    {
      section: "studio",
      label: "Studio IA",
      description: "Sites, apps e código",
      icon: WandSparkles,
    },
    {
      section: "autonomous-improvement",
      label: "Autoevolução",
      description: "Melhorias internas",
      icon: BrainCircuit,
    },
    {
      section: "executive-watchers",
      label: "Monitorização",
      description: "Sinais e oportunidades",
      icon: Radar,
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <CommandPanel className="samuel-flow-strip p-3 sm:p-4" accent>
        <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
          <SectionHeader
            title="Samuel no centro da operação"
            description="Fale com o holograma e acione as principais páginas do sistema sem sair da experiência."
          />
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-7">
          {flowActions.map((action) => (
            <button
              key={action.section}
              type="button"
              onClick={() => onNavigate(action.section)}
              className="group flex min-h-20 flex-col justify-between rounded-2xl border border-blue-200/60 bg-white/80 p-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-cyan-300 hover:bg-cyan-50/80 hover:shadow-md"
            >
              <span className="flex size-9 items-center justify-center rounded-xl border border-blue-200 bg-blue-50 text-blue-700 transition group-hover:border-cyan-300 group-hover:bg-cyan-100 group-hover:text-cyan-700">
                <action.icon className="size-4" strokeWidth={1.75} />
              </span>
              <span>
                <strong className="block text-[11px] font-semibold text-blue-950">{action.label}</strong>
                <small className="mt-0.5 block text-[9px] leading-snug text-blue-950/52">{action.description}</small>
              </span>
            </button>
          ))}
        </div>
      </CommandPanel>

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

      <CommandPanel className="flex min-h-[calc(100dvh-190px)] flex-col overflow-hidden p-0">
        <div className="shrink-0 border-b border-border px-5 py-4">
          <SectionHeader
            title="Cockpit de conversa com Samuel AI"
            description="O holograma é o Samuel: fale, ouça e acompanhe a resposta ativa sem o histórico ocupar a tela."
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

export function ExecutiveWorkspaceCenter({
  activeSection,
  onSectionChange,
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
        return <SamuelAiWorkspace data={data} handlers={handlers} onNavigate={onSectionChange} />;

      case "autonomous-improvement":
        return <AutonomousImprovementPanel />;

      case "studio":
        return <SamuelStudio />;

      case "site-builder":
        return (
          <SamuelSiteBuilder
            companyName={data.executiveContext?.company.name ?? data.briefing.companyName}
            companySegment={
              data.executiveContext?.businessProfile?.segment ??
              data.executiveContext?.company.industry ??
              undefined
            }
            companyLocation={
              [data.executiveContext?.company.city, data.executiveContext?.company.country]
                .filter(Boolean)
                .join(", ") || undefined
            }
          />
        );

      case "dashboard":
        return (
          <SamuelExecutiveHome
            data={data}
            handlers={handlers}
            onNavigate={onSectionChange}
          />
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

      case "crm":
        return (
          <CommandPanel className="p-4 sm:p-5" accent>
            <CrmExecutiveSummarySection crm={data.crmExecutive ?? null} />
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

    </div>
  );
}
