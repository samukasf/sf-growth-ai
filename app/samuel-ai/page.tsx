import type { Metadata } from "next";

import { samuelAi } from "@/features";
import { buildExecutiveDecisions } from "@/features/samuel-ai/services/executive-decision.service";
import { buildExecutionPlan } from "@/features/samuel-ai/services/executive-execution-planner.service";
import { buildExecutiveIntelligence } from "@/features/samuel-ai/services/executive-intelligence.service";
import { buildExecutiveMonitoring } from "@/features/samuel-ai/services/executive-monitoring.service";
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

  return (
    <samuelAi.SamuelAiPage
      executiveContext={executiveContext}
      executiveIntelligence={executiveIntelligence}
      executiveDecisions={executiveDecisions}
      executionPlans={executionPlans}
      executiveMonitoring={executiveMonitoring}
    />
  );
}
