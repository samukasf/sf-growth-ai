import type { ExecutiveInnovationEngineDependencies } from "../../application";
import { ExecutiveInnovationEngine } from "../../application";
import { InMemoryEventBus } from "../events/in-memory-event-bus";
import { InMemoryInnovationRepository } from "../persistence/in-memory-innovation.repository";
import { DefaultApprovalRequestGenerator } from "../services/default-approval-request-generator";
import { DefaultAutomationOpportunityAnalyzer } from "../services/default-automation-opportunity-analyzer";
import { DefaultBusinessImprovementAnalyzer } from "../services/default-business-improvement-analyzer";
import { DefaultInnovationPrioritizer } from "../services/default-innovation-prioritizer";
import { DefaultInnovationROICalculator } from "../services/default-innovation-roi-calculator";
import { DefaultOpportunityDetector } from "../services/default-opportunity-detector";
import { DefaultSoftwareOpportunityAnalyzer } from "../services/default-software-opportunity-analyzer";

export type CreateExecutiveInnovationEngineOptions = {
  dependencies?: Partial<ExecutiveInnovationEngineDependencies>;
};

export function createExecutiveInnovationEngine(
  options: CreateExecutiveInnovationEngineOptions = {},
): ExecutiveInnovationEngine {
  const dependencies: ExecutiveInnovationEngineDependencies = {
    repository: options.dependencies?.repository ?? new InMemoryInnovationRepository(),
    opportunityDetector:
      options.dependencies?.opportunityDetector ?? new DefaultOpportunityDetector(),
    automationAnalyzer:
      options.dependencies?.automationAnalyzer ?? new DefaultAutomationOpportunityAnalyzer(),
    softwareAnalyzer:
      options.dependencies?.softwareAnalyzer ?? new DefaultSoftwareOpportunityAnalyzer(),
    businessImprovementAnalyzer:
      options.dependencies?.businessImprovementAnalyzer ??
      new DefaultBusinessImprovementAnalyzer(),
    roiCalculator: options.dependencies?.roiCalculator ?? new DefaultInnovationROICalculator(),
    prioritizer: options.dependencies?.prioritizer ?? new DefaultInnovationPrioritizer(),
    approvalGenerator:
      options.dependencies?.approvalGenerator ?? new DefaultApprovalRequestGenerator(),
    eventDispatcher: options.dependencies?.eventDispatcher ?? new InMemoryEventBus(),
  };

  return new ExecutiveInnovationEngine(dependencies);
}
