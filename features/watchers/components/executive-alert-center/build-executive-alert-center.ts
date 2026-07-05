import type { CrmExecutive } from "@/features/crm/services/crm-executive.service";
import type { FinanceExecutive } from "@/features/finance/services/finance-executive.service";
import type { GoogleBusinessExecutive } from "@/features/google-business/services/google-business-executive.service";
import type { HrExecutive } from "@/features/hr/services/hr-executive.service";
import type { LegalExecutive } from "@/features/legal/services/legal-executive.service";
import type { MarketingExecutive } from "@/features/marketing/services/marketing-executive.service";
import type { MetaExecutive } from "@/features/meta/services/meta-executive.service";
import type { OperationsExecutive } from "@/features/operations/services/operations-executive.service";
import type { SalesExecutive } from "@/features/sales/services/sales-executive.service";
import type { ExecutiveMonitoring } from "@/features/samuel-ai/services/executive-monitoring.service";

import type { MarketWatcherResult } from "../../market/market-watcher.types";
import type { SeoWatcherResult } from "../../seo/seo-watcher.types";
import type { WatcherAlert, WatcherExecutive } from "../../types/watcher.types";

import type {
  ConsolidatedExecutiveAlert,
  ExecutiveAlertCenterState,
  ExecutiveAlertCenterSummary,
  ExecutiveAlertOrigin,
  ExecutiveAlertSeverity,
  ExecutiveAlertStatus,
} from "./executive-alert-center.types";

type ModuleRisk = {
  id: string;
  title: string;
  description: string;
  severity: "critical" | "high" | "medium" | "low";
};

type ModuleRecommendation = {
  id: string;
  title: string;
  description: string;
  priority: "critical" | "high" | "medium" | "low";
};

const ORIGIN_LABELS: Record<ExecutiveAlertOrigin, string> = {
  "market-watcher": "Market Watcher",
  "seo-watcher": "SEO Watcher",
  "watcher-core": "Executive Watcher",
  "google-business": "Google Business",
  meta: "Meta",
  crm: "CRM",
  marketing: "Marketing",
  finance: "Financeiro",
  sales: "Sales",
  operations: "Operações",
  hr: "RH",
  legal: "Jurídico",
  monitoring: "Monitoramento",
};

const FILTER_BY_ORIGIN: Partial<Record<ExecutiveAlertOrigin, ConsolidatedExecutiveAlert["filterCategory"]>> = {
  "market-watcher": "market",
  "seo-watcher": "seo",
  marketing: "marketing",
  finance: "finance",
  operations: "operations",
};

function toSeverity(value: string): ExecutiveAlertSeverity {
  const map: Record<string, ExecutiveAlertSeverity> = {
    critical: "Critical",
    Critical: "Critical",
    high: "High",
    High: "High",
    medium: "Medium",
    Medium: "Medium",
    low: "Low",
    Low: "Low",
    info: "Low",
  };
  return map[value] ?? "Medium";
}

function severityWeight(severity: ExecutiveAlertSeverity): number {
  switch (severity) {
    case "Critical":
      return 25;
    case "High":
      return 15;
    case "Medium":
      return 8;
    default:
      return 3;
  }
}

function findRecommendation(
  recommendations: ModuleRecommendation[],
  risk: ModuleRisk,
  index: number,
): ModuleRecommendation | undefined {
  return (
    recommendations.find((rec) => rec.priority === risk.severity) ??
    recommendations[index] ??
    recommendations[0]
  );
}

function fromModuleRisks(
  risks: ModuleRisk[],
  recommendations: ModuleRecommendation[],
  origin: ExecutiveAlertOrigin,
  responsible: string,
  confidenceBase: number,
  impactPrefix: string,
): ConsolidatedExecutiveAlert[] {
  return risks.map((risk, index) => {
    const rec = findRecommendation(recommendations, risk, index);
    return {
      id: `${origin}-${risk.id}`,
      title: risk.title,
      description: risk.description,
      origin,
      originLabel: ORIGIN_LABELS[origin],
      severity: toSeverity(risk.severity),
      timestamp: new Date().toISOString(),
      impact: `${impactPrefix}: ${risk.description}`,
      recommendation: rec ? `${rec.title} — ${rec.description}` : "Revisar com área responsável.",
      responsible,
      confidence: Math.min(98, confidenceBase + (risk.severity === "critical" ? 10 : 0)),
      status: "active" as ExecutiveAlertStatus,
      filterCategory: FILTER_BY_ORIGIN[origin] ?? "all",
    };
  });
}

function fromWatcherAlert(alert: WatcherAlert): ConsolidatedExecutiveAlert {
  const origin: ExecutiveAlertOrigin =
    alert.id.startsWith("market-") || alert.category === "market"
      ? "market-watcher"
      : alert.id.startsWith("seo-") || alert.category === "seo"
        ? "seo-watcher"
        : "watcher-core";

  return {
    id: `watcher-${alert.id}`,
    title: alert.title,
    description: alert.description,
    origin,
    originLabel: ORIGIN_LABELS[origin],
    severity: toSeverity(alert.severity),
    timestamp: alert.createdAt,
    impact: alert.expectedImpact,
    recommendation: `${alert.recommendation.title} — ${alert.recommendation.description}`,
    responsible: alert.responsibleArea,
    confidence: alert.confidence,
    status: alert.status === "resolved" ? "resolved" : "active",
    filterCategory: FILTER_BY_ORIGIN[origin] ?? "all",
  };
}

export type BuildExecutiveAlertCenterInput = {
  watcherExecutive?: WatcherExecutive | null;
  marketWatcher?: MarketWatcherResult | null;
  seoWatcher?: SeoWatcherResult | null;
  googleBusinessExecutive?: GoogleBusinessExecutive | null;
  metaExecutive?: MetaExecutive | null;
  crmExecutive?: CrmExecutive | null;
  marketingExecutive?: MarketingExecutive | null;
  financeExecutive?: FinanceExecutive | null;
  salesExecutive?: SalesExecutive | null;
  operationsExecutive?: OperationsExecutive | null;
  hrExecutive?: HrExecutive | null;
  legalExecutive?: LegalExecutive | null;
  executiveMonitoring?: ExecutiveMonitoring | null;
};

function buildSummary(alerts: ConsolidatedExecutiveAlert[]): ExecutiveAlertCenterSummary {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(startOfToday);
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

  const activeAlerts = alerts.filter(
    (alert) => alert.status !== "resolved" && alert.status !== "dismissed",
  );

  const criticalCount = activeAlerts.filter((alert) => alert.severity === "Critical").length;
  const resolvedCount = alerts.filter((alert) => alert.status === "resolved").length;
  const newCount = activeAlerts.filter(
    (alert) => new Date(alert.timestamp) >= startOfToday,
  ).length;

  const riskRaw = activeAlerts.reduce((sum, alert) => sum + severityWeight(alert.severity), 0);
  const riskScore = Math.min(100, Math.round(riskRaw));

  return {
    criticalCount,
    resolvedCount,
    newCount,
    riskScore,
    totalAlerts: alerts.length,
  };
}

const SEVERITY_ORDER: Record<ExecutiveAlertSeverity, number> = {
  Critical: 0,
  High: 1,
  Medium: 2,
  Low: 3,
};

function sortAlerts(alerts: ConsolidatedExecutiveAlert[]): ConsolidatedExecutiveAlert[] {
  return [...alerts].sort((a, b) => {
    const severityDiff = SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity];
    if (severityDiff !== 0) return severityDiff;
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });
}

export function buildExecutiveAlertCenter(
  input: BuildExecutiveAlertCenterInput,
): ExecutiveAlertCenterState {
  const alerts: ConsolidatedExecutiveAlert[] = [];

  if (input.marketWatcher) {
    for (const alert of input.marketWatcher.alerts) {
      alerts.push({
        id: `market-${alert.id}`,
        title: alert.title,
        description: alert.description,
        origin: "market-watcher",
        originLabel: ORIGIN_LABELS["market-watcher"],
        severity: toSeverity(alert.severity),
        timestamp: alert.createdAt,
        impact: alert.expectedImpact,
        recommendation: `${alert.recommendation.title} — ${alert.recommendation.description}`,
        responsible: alert.responsibleArea,
        confidence: alert.confidence,
        status: alert.status === "resolved" ? "resolved" : "active",
        filterCategory: "market",
      });
    }
  }

  if (input.seoWatcher) {
    for (const alert of input.seoWatcher.alerts) {
      alerts.push({
        id: `seo-${alert.id}`,
        title: alert.title,
        description: alert.description,
        origin: "seo-watcher",
        originLabel: ORIGIN_LABELS["seo-watcher"],
        severity: toSeverity(alert.severity),
        timestamp: alert.createdAt,
        impact: alert.expectedImpact,
        recommendation: `${alert.recommendation.title} — ${alert.recommendation.description}`,
        responsible: alert.responsibleArea,
        confidence: alert.confidence,
        status: alert.status === "resolved" ? "resolved" : "active",
        filterCategory: "seo",
      });
    }
  }

  if (input.watcherExecutive) {
    const coreAlerts = input.watcherExecutive.recentAlerts.filter(
      (alert) => !alert.id.startsWith("market-") && !alert.id.startsWith("seo-"),
    );
    alerts.push(...coreAlerts.map(fromWatcherAlert));
  }

  if (input.googleBusinessExecutive) {
    alerts.push(
      ...fromModuleRisks(
        input.googleBusinessExecutive.googleBusinessRisks,
        input.googleBusinessExecutive.googleBusinessRecommendations,
        "google-business",
        "Marketing",
        input.googleBusinessExecutive.reputationScore ?? 70,
        "Reputação local",
      ),
    );
  }

  if (input.metaExecutive) {
    alerts.push(
      ...fromModuleRisks(
        input.metaExecutive.metaRisks,
        input.metaExecutive.metaRecommendations,
        "meta",
        "Marketing",
        input.metaExecutive.metaHealthScore,
        "Performance Meta",
      ),
    );
  }

  if (input.crmExecutive) {
    alerts.push(
      ...fromModuleRisks(
        input.crmExecutive.crmRisks,
        input.crmExecutive.crmRecommendations,
        "crm",
        "CRM",
        input.crmExecutive.crmHealthScore,
        "Pipeline CRM",
      ),
    );
  }

  if (input.marketingExecutive) {
    alerts.push(
      ...fromModuleRisks(
        input.marketingExecutive.marketingRisks,
        input.marketingExecutive.marketingRecommendations,
        "marketing",
        "Marketing",
        input.marketingExecutive.marketingHealthScore,
        "Performance Marketing",
      ),
    );
  }

  if (input.financeExecutive) {
    alerts.push(
      ...fromModuleRisks(
        input.financeExecutive.financialRisks,
        input.financeExecutive.financialRecommendations,
        "finance",
        "Financeiro",
        input.financeExecutive.financeHealthScore,
        "Saúde Financeira",
      ),
    );
  }

  if (input.salesExecutive) {
    alerts.push(
      ...fromModuleRisks(
        input.salesExecutive.salesRisks,
        input.salesExecutive.salesRecommendations,
        "sales",
        "Sales",
        input.salesExecutive.salesHealthScore,
        "Performance Vendas",
      ),
    );
  }

  if (input.operationsExecutive) {
    alerts.push(
      ...fromModuleRisks(
        input.operationsExecutive.operationalRisks,
        input.operationsExecutive.operationalRecommendations,
        "operations",
        "Operações",
        input.operationsExecutive.operationsHealthScore,
        "Operações",
      ),
    );
  }

  if (input.hrExecutive) {
    const hrRisks = [
      ...input.hrExecutive.retentionRisks,
      ...input.hrExecutive.leadershipRisks,
      ...input.hrExecutive.workloadRisks,
    ];
    alerts.push(
      ...fromModuleRisks(
        hrRisks,
        input.hrExecutive.hrRecommendations,
        "hr",
        "RH",
        input.hrExecutive.hrHealthScore,
        "Capital Humano",
      ),
    );
  }

  if (input.legalExecutive) {
    const legalRisks = [
      ...input.legalExecutive.lgpdGdprRisks,
      ...input.legalExecutive.contractRisks,
    ];
    alerts.push(
      ...fromModuleRisks(
        legalRisks,
        input.legalExecutive.legalRecommendations,
        "legal",
        "Jurídico",
        input.legalExecutive.legalHealthScore,
        "Compliance",
      ),
    );
  }

  if (input.executiveMonitoring) {
    for (const alert of input.executiveMonitoring.alerts) {
      alerts.push({
        id: `monitoring-${alert.id}`,
        title: alert.title,
        description: alert.message,
        origin: "monitoring",
        originLabel: ORIGIN_LABELS.monitoring,
        severity: toSeverity(alert.severity),
        timestamp: new Date().toISOString(),
        impact: `Plano ${alert.planId ?? "executivo"} — ${alert.type}`,
        recommendation: "Revisar plano de execução e desbloquear dependências.",
        responsible: "Operações",
        confidence: alert.severity === "critical" ? 88 : 72,
        status: "active",
        filterCategory: "operations",
      });
    }
  }

  const deduped = alerts.filter(
    (alert, index, array) => array.findIndex((item) => item.id === alert.id) === index,
  );

  return {
    alerts: sortAlerts(deduped),
    summary: buildSummary(deduped),
  };
}

export function filterExecutiveAlerts(
  alerts: ConsolidatedExecutiveAlert[],
  filter: import("./executive-alert-center.types").ExecutiveAlertFilter,
): ConsolidatedExecutiveAlert[] {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(startOfToday);
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

  switch (filter) {
    case "critical":
      return alerts.filter((alert) => alert.severity === "Critical");
    case "today":
      return alerts.filter((alert) => new Date(alert.timestamp) >= startOfToday);
    case "this-week":
      return alerts.filter((alert) => new Date(alert.timestamp) >= startOfWeek);
    case "marketing":
      return alerts.filter(
        (alert) =>
          alert.filterCategory === "marketing" ||
          alert.origin === "google-business" ||
          alert.origin === "meta",
      );
    case "finance":
      return alerts.filter(
        (alert) => alert.filterCategory === "finance" || alert.origin === "finance",
      );
    case "operations":
      return alerts.filter(
        (alert) =>
          alert.filterCategory === "operations" ||
          alert.origin === "operations" ||
          alert.origin === "monitoring",
      );
    case "seo":
      return alerts.filter(
        (alert) => alert.filterCategory === "seo" || alert.origin === "seo-watcher",
      );
    case "market":
      return alerts.filter(
        (alert) => alert.filterCategory === "market" || alert.origin === "market-watcher",
      );
    default:
      return alerts;
  }
}
