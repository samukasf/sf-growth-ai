import type { Metadata } from "next";

import { samuelAi } from "@/features";
import {
  buildCrmExecutive,
  fetchCrmExecutiveInput,
  type CrmExecutive,
} from "@/features/crm/services/crm-executive.service";
import {
  buildMarketingExecutive,
  fetchMarketingExecutiveInput,
  type MarketingExecutive,
} from "@/features/marketing/services/marketing-executive.service";
import type { MetaExecutive } from "@/features/meta/services/meta-executive.service";
import {
  buildMetaExecutiveForCompany,
  enrichIntelligenceWithMeta,
  enrichMarketingWithMeta,
} from "@/integrations/meta";
import type { GoogleBusinessExecutive } from "@/features/google-business/services/google-business-executive.service";
import { buildGoogleBusinessExecutiveForCompany } from "@/features/google-business/api/google-business.adapter";
import type { GoogleAnalyticsExecutive } from "@/features/google-analytics/services/google-analytics-executive.service";
import {
  buildGoogleAnalyticsExecutiveForCompany,
  enrichIntelligenceWithAnalytics,
  enrichMarketingWithAnalytics,
} from "@/integrations/google-analytics";
import type { SearchConsoleExecutive } from "@/features/search-console/services/search-console-executive.service";
import {
  buildSearchConsoleExecutiveForCompany,
  enrichIntelligenceWithSearchConsole,
  enrichMarketingWithSearchConsole,
} from "@/integrations/google-search-console";
import {
  buildLegalExecutive,
  fetchLegalExecutiveInput,
  type LegalExecutive,
} from "@/features/legal/services/legal-executive.service";
import {
  buildHrExecutive,
  fetchHrExecutiveInput,
  type HrExecutive,
} from "@/features/hr/services/hr-executive.service";
import {
  buildOperationsExecutive,
  fetchOperationsExecutiveInput,
  type OperationsExecutive,
} from "@/features/operations/services/operations-executive.service";
import {
  buildFinanceExecutive,
  fetchFinanceExecutiveInput,
  type FinanceExecutive,
} from "@/features/finance/services/finance-executive.service";
import {
  buildSalesExecutive,
  fetchSalesExecutiveInput,
  type SalesExecutive,
} from "@/features/sales/services/sales-executive.service";
import { buildExecutiveAction } from "@/features/samuel-ai/services/executive-action.service";
import { buildExecutiveCEO } from "@/features/samuel-ai/services/executive-ceo.service";
import { buildExecutiveDecisions } from "@/features/samuel-ai/services/executive-decision.service";
import { buildExecutionPlan } from "@/features/samuel-ai/services/executive-execution-planner.service";
import { buildExecutiveForecast } from "@/features/samuel-ai/services/executive-forecast.service";
import { buildExecutiveIntelligence } from "@/features/samuel-ai/services/executive-intelligence.service";
import { buildExecutiveLearning } from "@/features/samuel-ai/services/executive-learning.service";
import { buildExecutiveMonitoring } from "@/features/samuel-ai/services/executive-monitoring.service";
import { buildExecutivePriority } from "@/features/samuel-ai/services/executive-priority.service";
import { buildExecutiveRecommendation } from "@/features/samuel-ai/services/executive-recommendation.service";
import { buildExecutiveStrategy } from "@/features/samuel-ai/services/executive-strategy.service";
import { buildExecutiveBriefing } from "@/features/samuel-ai/executive-brain";
import {
  hasCrmSourceData,
  hasFinanceSourceData,
  hasHrSourceData,
  hasLegalSourceData,
  hasMarketingSourceData,
  hasOperationsSourceData,
  hasSalesSourceData,
} from "@/features/samuel-ai/services/real-data-gates";
import {
  buildExecutiveContext,
  getFirstCompany,
  type ExecutiveContext,
} from "@/services/executive-context.service";
import {
  enrichIntelligenceWithSeoWatcher,
  enrichMarketingWithSeoWatcher,
  enrichMemoriesWithSeoWatcher,
  runSeoWatcher,
} from "@/features/watchers";

export const metadata: Metadata = {
  title: "Samuel AI™ | SF Growth AI",
  description: "Seu executivo de inteligência artificial.",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function SamuelAiRoute() {
  let executiveContext: ExecutiveContext | null = null;

  try {
    const company = await getFirstCompany();

    if (company) {
      executiveContext = await buildExecutiveContext(company.id);
    }
  } catch {
    executiveContext = null;
  }

  const executiveIntelligence = executiveContext
    ? buildExecutiveIntelligence(executiveContext)
    : null;

  const executiveDecisions = executiveIntelligence
    ? buildExecutiveDecisions(executiveIntelligence)
    : [];

  const executionPlans = buildExecutionPlan(executiveDecisions);

  const executiveMonitoring =
    executionPlans.length > 0
      ? buildExecutiveMonitoring(executionPlans)
      : null;

  const executiveLearning = buildExecutiveLearning({
    context: executiveContext,
    intelligence: executiveIntelligence,
    decisions: executiveDecisions,
    executionPlans,
    monitoring: executiveMonitoring,
  });

  const executiveForecast = buildExecutiveForecast({
    context: executiveContext,
    intelligence: executiveIntelligence,
    decisions: executiveDecisions,
    monitoring: executiveMonitoring,
    learning: executiveLearning,
  });

  // Competitor intelligence is intentionally absent until a live provider is
  // configured. Production must never promote the legacy sample dataset.
  const executiveCompetitor = null;

  const executiveStrategy = buildExecutiveStrategy({
    context: executiveContext,
    intelligence: executiveIntelligence,
    decisions: executiveDecisions,
    executionPlans,
    monitoring: executiveMonitoring,
    learning: executiveLearning,
    forecast: executiveForecast,
    competitor: executiveCompetitor,
  });

  const executiveAction = buildExecutiveAction({
    strategy: executiveStrategy,
    decisions: executiveDecisions,
    monitoring: executiveMonitoring,
    forecast: executiveForecast,
    intelligence: executiveIntelligence,
  });

  const executivePriority = buildExecutivePriority({
    strategy: executiveStrategy,
    action: executiveAction,
    monitoring: executiveMonitoring,
    forecast: executiveForecast,
    decisions: executiveDecisions,
  });

  const executiveRecommendation = buildExecutiveRecommendation({
    intelligence: executiveIntelligence,
    strategy: executiveStrategy,
    action: executiveAction,
    priority: executivePriority,
    forecast: executiveForecast,
    monitoring: executiveMonitoring,
    competitor: executiveCompetitor,
    learning: executiveLearning,
  });

  let crmExecutive: CrmExecutive | null = null;

  try {
    if (executiveContext?.company.id) {
      const crmInput = await fetchCrmExecutiveInput(
        executiveContext.company.id,
        executiveContext.company.name,
      );

      if (hasCrmSourceData(crmInput)) {
        crmExecutive = buildCrmExecutive(crmInput);
      }
    }
  } catch {
    crmExecutive = null;
  }

  const marketingEngines = {
    strategy: executiveStrategy,
    intelligence: executiveIntelligence,
    forecast: executiveForecast,
    competitor: executiveCompetitor,
    crmExecutive,
  };

  let marketingExecutive: MarketingExecutive | null = null;

  try {
    if (executiveContext?.company.id) {
      const marketingInput = await fetchMarketingExecutiveInput(
        executiveContext.company.id,
        executiveContext.company.name,
      );

      if (hasMarketingSourceData(marketingInput)) {
        marketingExecutive = buildMarketingExecutive({
          ...marketingInput,
          ...marketingEngines,
        });
      }
    }
  } catch {
    marketingExecutive = null;
  }

  let googleAnalyticsExecutive: GoogleAnalyticsExecutive | null = null;

  try {
    if (executiveContext?.company.id) {
      googleAnalyticsExecutive = await buildGoogleAnalyticsExecutiveForCompany(
        executiveContext.company.id,
        executiveContext.company.name,
        {
          strategy: executiveStrategy,
          intelligence: executiveIntelligence,
          competitor: executiveCompetitor,
          marketingExecutive,
        },
      );
    }
  } catch {
    googleAnalyticsExecutive = null;
  }

  const marketingExecutiveWithAnalytics =
    enrichMarketingWithAnalytics(marketingExecutive, googleAnalyticsExecutive) ??
    marketingExecutive;
  const executiveIntelligenceWithAnalytics =
    enrichIntelligenceWithAnalytics(executiveIntelligence, googleAnalyticsExecutive) ??
    executiveIntelligence;

  let searchConsoleExecutive: SearchConsoleExecutive | null = null;

  try {
    if (executiveContext?.company.id) {
      searchConsoleExecutive = await buildSearchConsoleExecutiveForCompany(
        executiveContext.company.id,
        executiveContext.company.name,
        {
          strategy: executiveStrategy,
          intelligence: executiveIntelligence,
          competitor: executiveCompetitor,
          marketingExecutive,
        },
      );
    }
  } catch {
    searchConsoleExecutive = null;
  }

  let metaExecutive: MetaExecutive | null = null;

  try {
    if (executiveContext?.company.id) {
      metaExecutive = await buildMetaExecutiveForCompany(
        executiveContext.company.id,
        executiveContext.company.name,
        {
          strategy: executiveStrategy,
          intelligence: executiveIntelligence,
          competitor: executiveCompetitor,
          marketingExecutive,
        },
      );
    }
  } catch {
    metaExecutive = null;
  }

  const marketingExecutiveWithIntegrations =
    enrichMarketingWithMeta(
      enrichMarketingWithSearchConsole(marketingExecutiveWithAnalytics, searchConsoleExecutive),
      metaExecutive,
    ) ?? marketingExecutiveWithAnalytics;
  const executiveIntelligenceWithIntegrations =
    enrichIntelligenceWithMeta(
      enrichIntelligenceWithSearchConsole(
        executiveIntelligenceWithAnalytics,
        searchConsoleExecutive,
      ),
      metaExecutive,
    ) ?? executiveIntelligenceWithAnalytics;

  const salesEngines = {
    strategy: executiveStrategy,
    intelligence: executiveIntelligence,
    forecast: executiveForecast,
    competitor: executiveCompetitor,
    crmExecutive,
    marketingExecutive,
  };

  let salesExecutive: SalesExecutive | null = null;

  try {
    if (executiveContext?.company.id) {
      const salesInput = await fetchSalesExecutiveInput(
        executiveContext.company.id,
        executiveContext.company.name,
      );

      if (hasSalesSourceData(salesInput)) {
        salesExecutive = buildSalesExecutive({ ...salesInput, ...salesEngines });
      }
    }
  } catch {
    salesExecutive = null;
  }

  const financeEngines = {
    strategy: executiveStrategy,
    intelligence: executiveIntelligence,
    forecast: executiveForecast,
    competitor: executiveCompetitor,
    crmExecutive,
    marketingExecutive,
    salesExecutive,
  };

  let financeExecutive: FinanceExecutive | null = null;

  try {
    if (executiveContext?.company.id) {
      const financeInput = await fetchFinanceExecutiveInput(
        executiveContext.company.id,
        executiveContext.company.name,
      );

      if (hasFinanceSourceData(financeInput)) {
        financeExecutive = buildFinanceExecutive({ ...financeInput, ...financeEngines });
      }
    }
  } catch {
    financeExecutive = null;
  }

  const operationsEngines = {
    strategy: executiveStrategy,
    intelligence: executiveIntelligence,
    forecast: executiveForecast,
    competitor: executiveCompetitor,
    monitoring: executiveMonitoring,
    action: executiveAction,
    priority: executivePriority,
    recommendation: executiveRecommendation,
    executionPlans,
    crmExecutive,
    marketingExecutive,
    salesExecutive,
    financeExecutive,
  };

  let operationsExecutive: OperationsExecutive | null = null;

  try {
    if (executiveContext?.company.id) {
      const operationsInput = await fetchOperationsExecutiveInput(
        executiveContext.company.id,
        executiveContext.company.name,
      );

      if (hasOperationsSourceData(operationsInput)) {
        operationsExecutive = buildOperationsExecutive({
          ...operationsInput,
          ...operationsEngines,
        });
      }
    }
  } catch {
    operationsExecutive = null;
  }

  const hrEngines = {
    strategy: executiveStrategy,
    intelligence: executiveIntelligence,
    learning: executiveLearning,
    forecast: executiveForecast,
    competitor: executiveCompetitor,
    monitoring: executiveMonitoring,
    action: executiveAction,
    priority: executivePriority,
    recommendation: executiveRecommendation,
    operationsExecutive,
    salesExecutive,
    financeExecutive,
  };

  let hrExecutive: HrExecutive | null = null;

  try {
    if (executiveContext?.company.id) {
      const hrInput = await fetchHrExecutiveInput(
        executiveContext.company.id,
        executiveContext.company.name,
      );

      if (hasHrSourceData(hrInput)) {
        hrExecutive = buildHrExecutive({ ...hrInput, ...hrEngines });
      }
    }
  } catch {
    hrExecutive = null;
  }

  const legalEngines = {
    strategy: executiveStrategy,
    intelligence: executiveIntelligence,
    forecast: executiveForecast,
    competitor: executiveCompetitor,
    monitoring: executiveMonitoring,
    action: executiveAction,
    priority: executivePriority,
    recommendation: executiveRecommendation,
    crmExecutive,
    salesExecutive,
    financeExecutive,
    hrExecutive,
  };

  let legalExecutive: LegalExecutive | null = null;

  try {
    if (executiveContext?.company.id) {
      const legalInput = await fetchLegalExecutiveInput(
        executiveContext.company.id,
        executiveContext.company.name,
      );

      if (hasLegalSourceData(legalInput)) {
        legalExecutive = buildLegalExecutive({ ...legalInput, ...legalEngines });
      }
    }
  } catch {
    legalExecutive = null;
  }

  let googleBusinessExecutive: GoogleBusinessExecutive | null = null;

  try {
    if (executiveContext?.company.id) {
      googleBusinessExecutive = await buildGoogleBusinessExecutiveForCompany(
        executiveContext.company.id,
        executiveContext.company.name,
        {
          strategy: executiveStrategy,
          intelligence: executiveIntelligence,
          competitor: executiveCompetitor,
          marketingExecutive,
        },
      );
    }
  } catch {
    googleBusinessExecutive = null;
  }

  // LinkedIn and market watching do not yet have a validated live provider.
  const linkedInExecutive = null;
  const marketWatcher = null;
  const watcherExecutive = null;
  const seoWatcher = searchConsoleExecutive
    ? runSeoWatcher({
        companyId: executiveContext?.company.id,
        companyName: executiveContext?.company.name,
        searchConsoleExecutive,
        marketingExecutive: marketingExecutiveWithIntegrations,
      })
    : null;

  const marketingExecutiveFinal =
    enrichMarketingWithSeoWatcher(
      marketingExecutiveWithIntegrations,
      seoWatcher,
    ) ?? marketingExecutiveWithIntegrations;

  const executiveIntelligenceFinal =
    enrichIntelligenceWithSeoWatcher(
      executiveIntelligenceWithIntegrations,
      seoWatcher,
    ) ??
    executiveIntelligenceWithIntegrations;

  const executiveContextWithWatchers = executiveContext
    ? {
        ...executiveContext,
        memories: enrichMemoriesWithSeoWatcher(
          executiveContext.memories,
          seoWatcher,
        ),
      }
    : null;

  const executiveCeo = buildExecutiveCEO({
    context: executiveContextWithWatchers,
    intelligence: executiveIntelligenceFinal,
    decisions: executiveDecisions,
    executionPlans,
    monitoring: executiveMonitoring,
    learning: executiveLearning,
    forecast: executiveForecast,
    competitor: executiveCompetitor,
    strategy: executiveStrategy,
    action: executiveAction,
    priority: executivePriority,
    recommendation: executiveRecommendation,
    crmExecutive,
    marketingExecutive: marketingExecutiveFinal,
    salesExecutive,
    financeExecutive,
    operationsExecutive,
    hrExecutive,
    legalExecutive,
    googleBusinessExecutive,
    googleAnalyticsExecutive,
    searchConsoleExecutive,
    metaExecutive,
    linkedInExecutive,
    watcherExecutive,
    marketWatcher,
    seoWatcher,
  });

  const executiveBriefing = buildExecutiveBriefing({
    context: executiveContextWithWatchers,
    intelligence: executiveIntelligenceFinal,
    monitoring: executiveMonitoring,
    forecast: executiveForecast,
    priority: executivePriority,
  });

  return (
    <samuelAi.SamuelAiPage
      executiveBriefing={executiveBriefing}
      executiveContext={executiveContextWithWatchers}
      executiveIntelligence={executiveIntelligenceFinal}
      executiveDecisions={executiveDecisions}
      executionPlans={executionPlans}
      executiveMonitoring={executiveMonitoring}
      executiveLearning={executiveLearning}
      executiveForecast={executiveForecast}
      executiveStrategy={executiveStrategy}
      executiveCompetitor={executiveCompetitor}
      executiveAction={executiveAction}
      executivePriority={executivePriority}
      executiveRecommendation={executiveRecommendation}
      executiveCeo={executiveCeo}
      crmExecutive={crmExecutive}
      marketingExecutive={marketingExecutiveFinal}
      salesExecutive={salesExecutive}
      financeExecutive={financeExecutive}
      operationsExecutive={operationsExecutive}
      hrExecutive={hrExecutive}
      legalExecutive={legalExecutive}
      googleBusinessExecutive={googleBusinessExecutive}
      googleAnalyticsExecutive={googleAnalyticsExecutive}
      searchConsoleExecutive={searchConsoleExecutive}
      metaExecutive={metaExecutive}
      linkedInExecutive={linkedInExecutive}
      watcherExecutive={watcherExecutive}
      marketWatcher={marketWatcher}
      seoWatcher={seoWatcher}
    />
  );
}
