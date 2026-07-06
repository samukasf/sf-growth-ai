export { InMemoryInnovationRepository } from "./persistence/in-memory-innovation.repository";
export { DefaultOpportunityDetector } from "./services/default-opportunity-detector";
export { DefaultAutomationOpportunityAnalyzer } from "./services/default-automation-opportunity-analyzer";
export { DefaultSoftwareOpportunityAnalyzer } from "./services/default-software-opportunity-analyzer";
export { DefaultBusinessImprovementAnalyzer } from "./services/default-business-improvement-analyzer";
export { DefaultInnovationROICalculator } from "./services/default-innovation-roi-calculator";
export { DefaultInnovationPrioritizer } from "./services/default-innovation-prioritizer";
export { DefaultApprovalRequestGenerator } from "./services/default-approval-request-generator";
export { InMemoryEventBus } from "./events/in-memory-event-bus";
export {
  createExecutiveInnovationEngine,
  type CreateExecutiveInnovationEngineOptions,
} from "./factories/create-executive-innovation-engine";
