import type { Metadata } from "next";

import { samuelAi } from "@/features";
import {
  buildCrmExecutive,
  buildCrmExecutiveForCompany,
} from "@/features/crm/services/crm-executive.service";
import {
  buildMarketingExecutive,
  buildMarketingExecutiveForCompany,
} from "@/features/marketing/services/marketing-executive.service";
import { buildLinkedInExecutive } from "@/features/linkedin/services/linkedin-executive.service";
import { buildMetaExecutive } from "@/features/meta/services/meta-executive.service";
import {
  buildMetaExecutiveForCompany,
  enrichIntelligenceWithMeta,
  enrichMarketingWithMeta,
} from "@/integrations/meta";
import { buildGoogleBusinessExecutive } from "@/features/google-business/services/google-business-executive.service";
import { buildGoogleBusinessExecutiveForCompany } from "@/features/google-business/api/google-business.adapter";
import { buildGoogleAnalyticsExecutive } from "@/features/google-analytics/services/google-analytics-executive.service";
import {
  buildGoogleAnalyticsExecutiveForCompany,
  enrichIntelligenceWithAnalytics,
  enrichMarketingWithAnalytics,
} from "@/integrations/google-analytics";
import { buildSearchConsoleExecutive } from "@/features/search-console/services/search-console-executive.service";
import {
  buildSearchConsoleExecutiveForCompany,
  enrichIntelligenceWithSearchConsole,
  enrichMarketingWithSearchConsole,
} from "@/integrations/google-search-console";
import {
  buildLegalExecutive,
  buildLegalExecutiveForCompany,
} from "@/features/legal/services/legal-executive.service";
import {
  buildHrExecutive,
  buildHrExecutiveForCompany,
} from "@/features/hr/services/hr-executive.service";
import {
  buildOperationsExecutive,
  buildOperationsExecutiveForCompany,
} from "@/features/operations/services/operations-executive.service";
import {
  buildFinanceExecutive,
  buildFinanceExecutiveForCompany,
} from "@/features/finance/services/finance-executive.service";
import {
  buildSalesExecutive,
  buildSalesExecutiveForCompany,
} from "@/features/sales/services/sales-executive.service";
import { buildExecutiveAction } from "@/features/samuel-ai/services/executive-action.service";
import { buildExecutiveCEO } from "@/features/samuel-ai/services/executive-ceo.service";
import { buildExecutiveCompetitor } from "@/features/samuel-ai/services/executive-competitor.service";
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
  buildExecutiveContext,
  getFirstCompany,
  type ExecutiveContext,
} from "@/services/executive-context.service";
import {
  buildCombinedWatcherExecutive,
  enrichIntelligenceWithMarketWatcher,
  enrichIntelligenceWithSeoWatcher,
  enrichIntelligenceWithWatchers,
  enrichMarketingWithSeoWatcher,
  enrichMemoriesWithMarketWatcher,
  enrichMemoriesWithSeoWatcher,
  enrichMemoriesWithWatchers,
  mergeSeoWatcherWithExecutive,
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

  const executiveCompetitor = buildExecutiveCompetitor();

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

  let crmExecutive = buildCrmExecutive({
    companyName: executiveContext?.company.name,
  });

  try {
    if (executiveContext?.company.id) {
      crmExecutive = await buildCrmExecutiveForCompany(
        executiveContext.company.id,
        executiveContext.company.name,
      );
    }
  } catch {
    crmExecutive = buildCrmExecutive({
      contacts: [],
      leads: [],
      deals: [],
      companyName: executiveContext?.company.name,
    });
  }

  const marketingEngines = {
    strategy: executiveStrategy,
    intelligence: executiveIntelligence,
    forecast: executiveForecast,
    competitor: executiveCompetitor,
    crmExecutive,
  };

  let marketingExecutive = buildMarketingExecutive({
    companyName: executiveContext?.company.name,
    ...marketingEngines,
  });

  try {
    if (executiveContext?.company.id) {
      marketingExecutive = await buildMarketingExecutiveForCompany(
        executiveContext.company.id,
        executiveContext.company.name,
        marketingEngines,
      );
    }
  } catch {
    marketingExecutive = buildMarketingExecutive({
      companyName: executiveContext?.company.name,
      ...marketingEngines,
    });
  }

  const googleAnalyticsEngines = {
    companyName: executiveContext?.company.name,
    strategy: executiveStrategy,
    intelligence: executiveIntelligence,
    competitor: executiveCompetitor,
    marketingExecutive,
  };

  let googleAnalyticsExecutive = buildGoogleAnalyticsExecutive(googleAnalyticsEngines);

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
    googleAnalyticsExecutive = buildGoogleAnalyticsExecutive(googleAnalyticsEngines);
  }

  const marketingExecutiveWithAnalytics =
    enrichMarketingWithAnalytics(marketingExecutive, googleAnalyticsExecutive) ??
    marketingExecutive;
  const executiveIntelligenceWithAnalytics =
    enrichIntelligenceWithAnalytics(executiveIntelligence, googleAnalyticsExecutive) ??
    executiveIntelligence;

  const searchConsoleEngines = {
    companyName: executiveContext?.company.name,
    strategy: executiveStrategy,
    intelligence: executiveIntelligence,
    competitor: executiveCompetitor,
    marketingExecutive,
  };

  let searchConsoleExecutive = buildSearchConsoleExecutive(searchConsoleEngines);

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
    searchConsoleExecutive = buildSearchConsoleExecutive(searchConsoleEngines);
  }

  const metaEngines = {
    companyName: executiveContext?.company.name,
    strategy: executiveStrategy,
    intelligence: executiveIntelligence,
    competitor: executiveCompetitor,
    marketingExecutive,
  };

  let metaExecutive = buildMetaExecutive(metaEngines);

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
    metaExecutive = buildMetaExecutive(metaEngines);
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

  let salesExecutive = buildSalesExecutive({
    companyName: executiveContext?.company.name,
    ...salesEngines,
  });

  try {
    if (executiveContext?.company.id) {
      salesExecutive = await buildSalesExecutiveForCompany(
        executiveContext.company.id,
        executiveContext.company.name,
        salesEngines,
      );
    }
  } catch {
    salesExecutive = buildSalesExecutive({
      companyName: executiveContext?.company.name,
      ...salesEngines,
    });
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

  let financeExecutive = buildFinanceExecutive({
    companyName: executiveContext?.company.name,
    ...financeEngines,
  });

  try {
    if (executiveContext?.company.id) {
      financeExecutive = await buildFinanceExecutiveForCompany(
        executiveContext.company.id,
        executiveContext.company.name,
        financeEngines,
      );
    }
  } catch {
    financeExecutive = buildFinanceExecutive({
      companyName: executiveContext?.company.name,
      ...financeEngines,
    });
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

  let operationsExecutive = buildOperationsExecutive({
    companyName: executiveContext?.company.name,
    ...operationsEngines,
  });

  try {
    if (executiveContext?.company.id) {
      operationsExecutive = await buildOperationsExecutiveForCompany(
        executiveContext.company.id,
        executiveContext.company.name,
        operationsEngines,
      );
    }
  } catch {
    operationsExecutive = buildOperationsExecutive({
      companyName: executiveContext?.company.name,
      ...operationsEngines,
    });
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

  let hrExecutive = buildHrExecutive({
    companyName: executiveContext?.company.name,
    ...hrEngines,
  });

  try {
    if (executiveContext?.company.id) {
      hrExecutive = await buildHrExecutiveForCompany(
        executiveContext.company.id,
        executiveContext.company.name,
        hrEngines,
      );
    }
  } catch {
    hrExecutive = buildHrExecutive({
      companyName: executiveContext?.company.name,
      ...hrEngines,
    });
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

  let legalExecutive = buildLegalExecutive({
    companyName: executiveContext?.company.name,
    ...legalEngines,
  });

  try {
    if (executiveContext?.company.id) {
      legalExecutive = await buildLegalExecutiveForCompany(
        executiveContext.company.id,
        executiveContext.company.name,
        legalEngines,
      );
    }
  } catch {
    legalExecutive = buildLegalExecutive({
      companyName: executiveContext?.company.name,
      ...legalEngines,
    });
  }

  const googleBusinessEngines = {
    companyName: executiveContext?.company.name,
    strategy: executiveStrategy,
    intelligence: executiveIntelligence,
    competitor: executiveCompetitor,
    marketingExecutive,
  };

  let googleBusinessExecutive = buildGoogleBusinessExecutive(googleBusinessEngines);

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
    googleBusinessExecutive = buildGoogleBusinessExecutive(googleBusinessEngines);
  }

  const linkedInExecutive = buildLinkedInExecutive({
    companyName: executiveContext?.company.name,
    strategy: executiveStrategy,
    intelligence: executiveIntelligence,
    competitor: executiveCompetitor,
    marketingExecutive,
    crmExecutive,
    salesExecutive,
  });

  const { watcherExecutive: watcherWithMarket, marketWatcher } = buildCombinedWatcherExecutive({
    companyId: executiveContext?.company.id,
    companyName: executiveContext?.company.name,
  });

  const seoWatcher = runSeoWatcher({
    companyId: executiveContext?.company.id,
    companyName: executiveContext?.company.name,
    searchConsoleExecutive,
    marketingExecutive: marketingExecutiveWithIntegrations,
  });

  const watcherExecutive = mergeSeoWatcherWithExecutive(watcherWithMarket, seoWatcher);

  const marketingExecutiveFinal =
    enrichMarketingWithSeoWatcher(
      marketingExecutiveWithIntegrations,
      seoWatcher,
    ) ?? marketingExecutiveWithIntegrations;

  const executiveIntelligenceFinal =
    enrichIntelligenceWithSeoWatcher(
      enrichIntelligenceWithMarketWatcher(
        enrichIntelligenceWithWatchers(
          executiveIntelligenceWithIntegrations,
          watcherExecutive,
        ),
        marketWatcher,
      ),
      seoWatcher,
    ) ??
    enrichIntelligenceWithMarketWatcher(
      enrichIntelligenceWithWatchers(
        executiveIntelligenceWithIntegrations,
        watcherExecutive,
      ),
      marketWatcher,
    ) ??
    executiveIntelligenceWithIntegrations;

  const executiveContextWithWatchers = executiveContext
    ? {
        ...executiveContext,
        memories: enrichMemoriesWithSeoWatcher(
          enrichMemoriesWithMarketWatcher(
            enrichMemoriesWithWatchers(
              executiveContext.memories,
              watcherExecutive,
            ),
            marketWatcher,
          ),
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
