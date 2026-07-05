import { buildExecutiveAlertCenter } from "@/features/watchers/components/executive-alert-center";
import { buildExecutiveTimeline } from "@/features/samuel-ai/components/executive-timeline/build-executive-timeline";

import type { ExecutiveAction } from "@/features/samuel-ai/services/executive-action.service";
import type { ExecutiveCEO } from "@/features/samuel-ai/services/executive-ceo.service";
import type { ExecutiveDecision } from "@/features/samuel-ai/services/executive-decision.service";
import type { ExecutivePriority } from "@/features/samuel-ai/services/executive-priority.service";
import type { ExecutiveRecommendation } from "@/features/samuel-ai/services/executive-recommendation.service";
import type { ExecutiveConversation } from "@/features/samuel-ai/services/executive-conversation-orchestrator.service";
import type { ExecutiveMonitoring } from "@/features/samuel-ai/services/executive-monitoring.service";
import type { ExecutiveBrainStatus } from "@/features/samuel-ai/executive-brain/types";
import type { OrchestratorSnapshot } from "@/features/samuel-ai/services/executive-orchestrator.types";
import type { CrmExecutive } from "@/features/crm/services/crm-executive.service";
import type { FinanceExecutive } from "@/features/finance/services/finance-executive.service";
import type { GoogleAnalyticsExecutive } from "@/features/google-analytics/services/google-analytics-executive.service";
import type { GoogleBusinessExecutive } from "@/features/google-business/services/google-business-executive.service";
import type { HrExecutive } from "@/features/hr/services/hr-executive.service";
import type { LegalExecutive } from "@/features/legal/services/legal-executive.service";
import type { LinkedInExecutive } from "@/features/linkedin/services/linkedin-executive.service";
import type { MarketingExecutive } from "@/features/marketing/services/marketing-executive.service";
import type { MetaExecutive } from "@/features/meta/services/meta-executive.service";
import type { OperationsExecutive } from "@/features/operations/services/operations-executive.service";
import type { SalesExecutive } from "@/features/sales/services/sales-executive.service";
import type { SearchConsoleExecutive } from "@/features/search-console/services/search-console-executive.service";
import type { ExecutiveContext } from "@/services/executive-context.service";
import type { MarketWatcherResult } from "@/features/watchers/market/market-watcher.types";
import type { SeoWatcherResult } from "@/features/watchers/seo/seo-watcher.types";
import type { WatcherExecutive } from "@/features/watchers/types/watcher.types";

import type {
  ExecutiveInboxFilter,
  ExecutiveInboxItem,
  ExecutiveInboxState,
  ExecutiveInboxSummaryData,
  InboxCategory,
  InboxItemType,
  InboxPriority,
  InboxStatus,
} from "../executive-inbox.types";

export type BuildExecutiveInboxInput = {
  brainStatus?: ExecutiveBrainStatus;
  isProcessing?: boolean;
  orchestratorSnapshot?: OrchestratorSnapshot | null;
  pendingQuestion?: string | null;
  executiveConversation?: ExecutiveConversation | null;
  executiveContext?: ExecutiveContext | null;
  executiveDecisions?: ExecutiveDecision[];
  executiveAction?: ExecutiveAction | null;
  executivePriority?: ExecutivePriority | null;
  executiveRecommendation?: ExecutiveRecommendation | null;
  executiveCeo?: ExecutiveCEO | null;
  executiveMonitoring?: ExecutiveMonitoring | null;
  watcherExecutive?: WatcherExecutive | null;
  marketWatcher?: MarketWatcherResult | null;
  seoWatcher?: SeoWatcherResult | null;
  crmExecutive?: CrmExecutive | null;
  marketingExecutive?: MarketingExecutive | null;
  salesExecutive?: SalesExecutive | null;
  financeExecutive?: FinanceExecutive | null;
  operationsExecutive?: OperationsExecutive | null;
  hrExecutive?: HrExecutive | null;
  legalExecutive?: LegalExecutive | null;
  googleBusinessExecutive?: GoogleBusinessExecutive | null;
  googleAnalyticsExecutive?: GoogleAnalyticsExecutive | null;
  searchConsoleExecutive?: SearchConsoleExecutive | null;
  metaExecutive?: MetaExecutive | null;
  linkedInExecutive?: LinkedInExecutive | null;
  analysisStartedAt?: number | null;
  analysisCompletedAt?: number | null;
};

const PRIORITY_ORDER: Record<InboxPriority, number> = {
  Critical: 0,
  High: 1,
  Medium: 2,
  Low: 3,
};

function toInboxPriority(value: string): InboxPriority {
  const map: Record<string, InboxPriority> = {
    critical: "Critical",
    Critical: "Critical",
    high: "High",
    High: "High",
    medium: "Medium",
    Medium: "Medium",
    low: "Low",
    Low: "Low",
  };
  return map[value] ?? "Medium";
}

function areaCategories(area: string, origin: string): InboxCategory[] {
  const normalized = `${area} ${origin}`.toLowerCase();
  const categories: InboxCategory[] = [];

  if (normalized.includes("market")) categories.push("market");
  if (normalized.includes("seo") || normalized.includes("search console")) categories.push("seo");
  if (normalized.includes("marketing")) categories.push("marketing");
  if (normalized.includes("finance") || normalized.includes("financeiro")) categories.push("finance");
  if (normalized.includes("operation") || normalized.includes("opera")) categories.push("operations");
  if (normalized.includes("sales") || normalized.includes("vendas") || normalized.includes("crm")) {
    categories.push("sales");
  }
  if (normalized.includes("rh") || normalized.includes("hr")) categories.push("hr");
  if (normalized.includes("legal") || normalized.includes("juríd")) categories.push("legal");
  if (
    normalized.includes("google business") ||
    normalized.includes("google analytics") ||
    normalized.includes("search console") ||
    normalized.includes("google")
  ) {
    categories.push("google");
  }
  if (normalized.includes("meta")) categories.push("meta");
  if (normalized.includes("linkedin")) categories.push("linkedin");

  return categories;
}

function temporalCategories(date: string, priority: InboxPriority): InboxCategory[] {
  const categories: InboxCategory[] = [];
  const now = new Date();
  const itemDate = new Date(date);
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(startOfToday);
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

  if (itemDate >= startOfToday) categories.push("today");
  if (itemDate >= startOfWeek) categories.push("this-week");
  if (priority === "Critical" || priority === "High") categories.push("urgent");

  return categories;
}

function buildCategories(
  area: string,
  origin: string,
  date: string,
  priority: InboxPriority,
): InboxCategory[] {
  const merged = [...areaCategories(area, origin), ...temporalCategories(date, priority)];
  return [...new Set(merged)];
}

function createItem(
  partial: Omit<ExecutiveInboxItem, "categories"> & { categories?: InboxCategory[] },
): ExecutiveInboxItem {
  const categories =
    partial.categories ??
    buildCategories(partial.area, partial.origin, partial.date, partial.priority);

  return { ...partial, categories };
}

function mapAlertOrigin(originLabel: string): string {
  return originLabel;
}

function buildSummary(items: ExecutiveInboxItem[], ceo?: ExecutiveCEO | null): ExecutiveInboxSummaryData {
  const active = items.filter(
    (item) => item.status !== "resolved" && item.status !== "archived",
  );
  const pendingCount = active.filter((item) => item.status === "pending").length;
  const urgentCount = active.filter(
    (item) =>
      item.priority === "Critical" ||
      item.priority === "High" ||
      item.status === "urgent",
  ).length;
  const resolvedCount = items.filter(
    (item) => item.status === "resolved" || item.status === "archived",
  ).length;
  const overallScore = ceo?.executiveScore ?? Math.max(0, 100 - urgentCount * 8);

  return {
    pendingCount,
    urgentCount,
    resolvedCount,
    overallScore,
    totalItems: items.length,
  };
}

function sortItems(items: ExecutiveInboxItem[]): ExecutiveInboxItem[] {
  return [...items].sort((a, b) => {
    const priorityDiff = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
    if (priorityDiff !== 0) return priorityDiff;
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
}

export function buildExecutiveInbox(input: BuildExecutiveInboxInput): ExecutiveInboxState {
  const now = new Date().toISOString();
  const items: ExecutiveInboxItem[] = [];

  const alertCenter = buildExecutiveAlertCenter({
    watcherExecutive: input.watcherExecutive,
    marketWatcher: input.marketWatcher,
    seoWatcher: input.seoWatcher,
    googleBusinessExecutive: input.googleBusinessExecutive,
    metaExecutive: input.metaExecutive,
    crmExecutive: input.crmExecutive,
    marketingExecutive: input.marketingExecutive,
    financeExecutive: input.financeExecutive,
    salesExecutive: input.salesExecutive,
    operationsExecutive: input.operationsExecutive,
    hrExecutive: input.hrExecutive,
    legalExecutive: input.legalExecutive,
    executiveMonitoring: input.executiveMonitoring,
  });

  for (const alert of alertCenter.alerts) {
    const status: InboxStatus =
      alert.status === "resolved" ? "resolved" : alert.severity === "Critical" ? "urgent" : "pending";

    items.push(
      createItem({
        id: `inbox-alert-${alert.id}`,
        type: "alert",
        title: alert.title,
        description: alert.description,
        origin: mapAlertOrigin(alert.originLabel),
        priority: toInboxPriority(alert.severity),
        impact: alert.impact,
        area: alert.responsible,
        confidence: alert.confidence,
        date: alert.timestamp,
        status,
      }),
    );
  }

  for (const rec of input.executiveRecommendation?.executiveRecommendations ?? []) {
    items.push(
      createItem({
        id: `inbox-rec-${rec.id}`,
        type: "recommendation",
        title: rec.title,
        description: rec.description,
        origin: "Executive Recommendations",
        priority: toInboxPriority(rec.priority),
        impact: rec.expectedImpact,
        area: rec.responsibleDepartment,
        confidence: input.executiveRecommendation?.confidenceLevel ?? 70,
        date: now,
        status: "pending",
      }),
    );
  }

  for (const task of input.executivePriority?.top10Priorities ?? []) {
    items.push(
      createItem({
        id: `inbox-priority-${task.id}`,
        type: "priority",
        title: task.title,
        description: task.description,
        origin: "Executive Priorities",
        priority: toInboxPriority(task.priority),
        impact: `Score ${task.priorityScore}/100`,
        area: task.department,
        confidence: Math.min(98, Math.round(task.priorityScore * 0.9)),
        date: now,
        status: task.isBlocked ? "urgent" : "pending",
      }),
    );
  }

  for (const alert of input.watcherExecutive?.recentAlerts ?? []) {
    items.push(
      createItem({
        id: `inbox-watcher-${alert.id}`,
        type: "watcher",
        title: alert.title,
        description: alert.description,
        origin: "Executive Watchers",
        priority: toInboxPriority(alert.severity),
        impact: alert.expectedImpact,
        area: alert.responsibleArea,
        confidence: alert.confidence,
        date: alert.createdAt,
        status: alert.status === "resolved" ? "resolved" : "pending",
      }),
    );
  }

  const actionBuckets = [
    ...(input.executiveAction?.criticalActions ?? []),
    ...(input.executiveAction?.immediateActions ?? []),
    ...(input.executiveAction?.quickWins ?? []),
  ];

  for (const action of actionBuckets) {
    items.push(
      createItem({
        id: `inbox-action-${action.id}`,
        type: "action",
        title: action.title,
        description: action.description,
        origin: "Executive Actions",
        priority: toInboxPriority(action.priority),
        impact: `ROI ${action.roi} · impacto ${action.impact}`,
        area: action.department,
        confidence: input.executiveAction?.estimatedROI.confidence ?? 72,
        date: now,
        status: action.automationLevel === "delegated" ? "delegated" : "pending",
      }),
    );
  }

  for (const decision of input.executiveDecisions ?? []) {
    items.push(
      createItem({
        id: `inbox-decision-${decision.id}`,
        type: "decision",
        title: decision.title,
        description: decision.description,
        origin: "Executive Decisions",
        priority: toInboxPriority(decision.priority),
        impact: `${decision.impact} · ROI ${decision.estimatedROI}`,
        area: decision.department,
        confidence: decision.priority === "Critical" ? 88 : 75,
        date: now,
        status:
          decision.status === "completed"
            ? "resolved"
            : decision.status === "in_progress"
              ? "executing"
              : "pending",
      }),
    );
  }

  const timeline = buildExecutiveTimeline({
    brainStatus: input.brainStatus ?? "idle",
    isProcessing: input.isProcessing ?? false,
    orchestratorSnapshot: input.orchestratorSnapshot,
    pendingQuestion: input.pendingQuestion,
    executiveConversation: input.executiveConversation,
    executiveContext: input.executiveContext,
    executiveRecommendation: input.executiveRecommendation,
    executiveCeo: input.executiveCeo,
    marketingExecutive: input.marketingExecutive,
    financeExecutive: input.financeExecutive,
    salesExecutive: input.salesExecutive,
    operationsExecutive: input.operationsExecutive,
    watcherExecutive: input.watcherExecutive,
    marketWatcher: input.marketWatcher,
    analysisStartedAt: input.analysisStartedAt,
    analysisCompletedAt: input.analysisCompletedAt,
  });

  for (const step of timeline.steps.filter(
    (s) => s.status === "Running" || s.status === "Warning" || s.status === "Completed",
  )) {
    items.push(
      createItem({
        id: `inbox-timeline-${step.id}`,
        type: "timeline",
        title: step.title,
        description: step.description,
        origin: "Executive Timeline",
        priority:
          step.status === "Warning" ? "High" : step.status === "Running" ? "Medium" : "Low",
        impact: step.detail ?? `Etapa ${step.order} do pipeline executivo`,
        area: step.responsible,
        confidence: step.confidence ?? 70,
        date: step.timestamp ?? now,
        status: step.status === "Running" ? "executing" : "pending",
      }),
    );
  }

  if (input.executiveCeo) {
    for (const [index, priority] of input.executiveCeo.topPriorities.entries()) {
      items.push(
        createItem({
          id: `inbox-ceo-priority-${index}`,
          type: "ceo",
          title: priority,
          description: input.executiveCeo.executiveSummary,
          origin: "Executive CEO",
          priority: index === 0 ? "Critical" : "High",
          impact: `Saúde ${input.executiveCeo.companyHealth.score}/100`,
          area: "CEO Digital",
          confidence: input.executiveCeo.executiveScore,
          date: now,
          status: "pending",
        }),
      );
    }

    for (const [index, action] of input.executiveCeo.nextActions.entries()) {
      items.push(
        createItem({
          id: `inbox-ceo-action-${index}`,
          type: "ceo",
          title: action,
          description: input.executiveCeo.ceoMessage,
          origin: "Executive CEO",
          priority: index === 0 ? "High" : "Medium",
          impact: `Crescimento ${input.executiveCeo.growthScore}/100 · Risco ${input.executiveCeo.riskScore}/100`,
          area: "CEO Digital",
          confidence: input.executiveCeo.executiveScore,
          date: now,
          status: "pending",
        }),
      );
    }
  }

  const deduped = items.filter(
    (item, index, array) => array.findIndex((entry) => entry.id === item.id) === index,
  );

  const sorted = sortItems(deduped);

  return {
    items: sorted,
    summary: buildSummary(sorted, input.executiveCeo),
  };
}

export function filterExecutiveInboxItems(
  items: ExecutiveInboxItem[],
  filter: ExecutiveInboxFilter,
): ExecutiveInboxItem[] {
  if (filter === "all") return items;
  return items.filter((item) => item.categories.includes(filter));
}

export function getInboxTypeLabel(type: InboxItemType): string {
  const labels: Record<InboxItemType, string> = {
    alert: "Alerta",
    recommendation: "Recomendação",
    priority: "Prioridade",
    watcher: "Watcher",
    action: "Ação",
    decision: "Decisão",
    timeline: "Timeline",
    ceo: "CEO",
  };
  return labels[type];
}
