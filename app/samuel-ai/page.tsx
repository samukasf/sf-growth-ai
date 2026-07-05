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
import {
  buildExecutiveContext,
  getFirstCompany,
  type ExecutiveContext,
} from "@/services/executive-context.service";

export const metadata: Metadata = {
  title: "Samuel AI™ | SF Growth AI",
  description: "Seu executivo de inteligência artificial.",
};

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

  const executiveCeo = buildExecutiveCEO({
    context: executiveContext,
    intelligence: executiveIntelligence,
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
    marketingExecutive,
    salesExecutive,
  });

  return (
    <samuelAi.SamuelAiPage
      executiveContext={executiveContext}
      executiveIntelligence={executiveIntelligence}
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
      marketingExecutive={marketingExecutive}
      salesExecutive={salesExecutive}
    />
  );
}
