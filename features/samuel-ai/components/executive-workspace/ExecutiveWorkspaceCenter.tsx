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
import { CrmExecutiveSummarySection } from "@/features/crm/components/crm-executive-summary-section";
import { MarketingExecutiveSummarySection } from "@/features/marketing/components/marketing-executive-summary-section";
import { ExecutiveWatchersSection } from "@/features/watchers/components/executive-watchers-section";
import { MarketWatcherSection } from "@/features/watchers/market/components/market-watcher-section";
import { SeoWatcherSection } from "@/features/watchers/seo/components/seo-watcher-section";
import { ExecutiveAlertCenter } from "@/features/watchers/components/executive-alert-center";
import { ExecutiveInbox } from "@/features/executive-inbox";
import { SamuelStudio } from "@/features/samuel-ai/studio";
import { AutonomousImprovementPanel } from "@/features/samuel-ai/autonomous-improvement";

import { ExecutiveTimeline } from "../executive-timeline";
import { SamuelSiteBuilder } from "../site-builder";
import { CommandPanel } from "../shared/command-panel";
import { SectionHeader } from "../section-header";
import { ExecutiveDecisionsSection } from "../executive-dashboard";
import type { ExecutiveWorkspaceData, ExecutiveWorkspaceHandlers } from "./executive-workspace.types";
import { SamuelExecutiveHome } from "./SamuelExecutiveHome";
import { SamuelAiFocus } from "./SamuelAiFocus";
import { GoogleAgendaPanel } from "./GoogleAgendaPanel";
import { GmailWorkspacePanel } from "./GmailWorkspacePanel";
import { WhatsAppBusinessPanel } from "./WhatsAppBusinessPanel";
import { getWorkspaceSectionLabel, type WorkspaceSection } from "./workspace-navigation";

type ExecutiveWorkspaceCenterProps = ExecutiveWorkspaceData &
  ExecutiveWorkspaceHandlers & {
    activeSection: WorkspaceSection;
    onSectionChange: (section: WorkspaceSection) => void;
  };

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
          <li key={rec.id} className="rounded-lg border border-border/60 bg-black/10 px-3 py-2.5 text-[11px]">
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
  const companyId = data.executiveContext?.company.id ?? "default-company";

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

      case "gmail":
        return <GmailWorkspacePanel companyId={companyId} onNavigate={onSectionChange} />;

      case "whatsapp":
        return <WhatsAppBusinessPanel companyId={companyId} onNavigate={onSectionChange} />;

      case "samuel-ai":
        return <SamuelAiFocus data={data} handlers={handlers} onNavigate={onSectionChange} />;

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
        return <SamuelExecutiveHome data={data} handlers={handlers} onNavigate={onSectionChange} />;

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
        return <GoogleAgendaPanel companyId={companyId} onNavigate={onSectionChange} />;

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
        return <CommandPanel className="p-4 sm:p-5" accent><MarketingExecutiveSummarySection marketing={data.marketingExecutive ?? null} /></CommandPanel>;
      case "crm":
        return <CommandPanel className="p-4 sm:p-5" accent><CrmExecutiveSummarySection crm={data.crmExecutive ?? null} /></CommandPanel>;
      case "sales":
        return <CommandPanel className="p-4 sm:p-5" accent><SalesExecutiveSummarySection sales={data.salesExecutive ?? null} /></CommandPanel>;
      case "finance":
        return <CommandPanel className="p-4 sm:p-5" accent><FinanceExecutiveSummarySection finance={data.financeExecutive ?? null} /></CommandPanel>;
      case "operations":
        return <CommandPanel className="p-4 sm:p-5" accent><OperationsExecutiveSummarySection operations={data.operationsExecutive ?? null} /></CommandPanel>;
      case "hr":
        return <CommandPanel className="p-4 sm:p-5" accent><HrExecutiveSummarySection hr={data.hrExecutive ?? null} /></CommandPanel>;
      case "legal":
        return <CommandPanel className="p-4 sm:p-5" accent><LegalExecutiveSummarySection legal={data.legalExecutive ?? null} /></CommandPanel>;
      case "google-business":
        return <CommandPanel className="p-4 sm:p-5" accent><GoogleBusinessExecutiveSummarySection googleBusiness={data.googleBusinessExecutive ?? null} /></CommandPanel>;
      case "google-analytics":
        return <CommandPanel className="p-4 sm:p-5" accent><GoogleAnalyticsExecutiveSummarySection googleAnalytics={data.googleAnalyticsExecutive ?? null} /></CommandPanel>;
      case "search-console":
        return <CommandPanel className="p-4 sm:p-5" accent><SearchConsoleExecutiveSummarySection searchConsole={data.searchConsoleExecutive ?? null} /></CommandPanel>;
      case "meta":
        return <CommandPanel className="p-4 sm:p-5" accent><MetaExecutiveSummarySection meta={data.metaExecutive ?? null} /></CommandPanel>;
      case "linkedin":
        return <CommandPanel className="p-4 sm:p-5" accent><LinkedInExecutiveSummarySection linkedin={data.linkedInExecutive ?? null} /></CommandPanel>;
      default:
        return null;
    }
  })();

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <div className="mb-4 flex items-center justify-between gap-3 px-1 lg:hidden">
        <p className="text-sm font-semibold text-foreground">{sectionLabel}</p>
      </div>
      <div key={activeSection} className={cn("flex flex-col gap-4 transition-all duration-300 ease-out")}>
        {content}
      </div>
    </div>
  );
}
