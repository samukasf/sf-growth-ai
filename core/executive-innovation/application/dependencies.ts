import type { EventDispatcher } from "../shared";
import type {
  ApprovalRequestGenerator,
  AutomationOpportunityAnalyzer,
  BusinessImprovementAnalyzer,
  InnovationPrioritizer,
  InnovationRepository,
  InnovationROICalculator,
  OpportunityDetector,
  SoftwareOpportunityAnalyzer,
} from "../domain";

export type ExecutiveInnovationEngineDependencies = {
  repository: InnovationRepository;
  opportunityDetector: OpportunityDetector;
  automationAnalyzer: AutomationOpportunityAnalyzer;
  softwareAnalyzer: SoftwareOpportunityAnalyzer;
  businessImprovementAnalyzer: BusinessImprovementAnalyzer;
  roiCalculator: InnovationROICalculator;
  prioritizer: InnovationPrioritizer;
  approvalGenerator: ApprovalRequestGenerator;
  eventDispatcher: EventDispatcher;
};
