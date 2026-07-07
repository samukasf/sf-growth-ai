import type { ExecutiveCrmDependencies } from "../../application";
import { ExecutiveCrmService } from "../../application";
import { InMemoryEventBus } from "../events/in-memory-event-bus";
import {
  NoopBusinessAutomationAdapter,
  NoopBusinessCommunicationAdapter,
  NoopCompanyBrainAdapter,
  NoopExecutiveCEOAdapter,
  NoopExecutiveFinanceAdapter,
  NoopExecutiveMarketingAdapter,
  NoopExecutiveOrchestratorAdapter,
  NoopExecutiveSalesAdapter,
  NoopOrganizationBrainAdapter,
} from "../integration/noop-integration.adapters";
import { InMemoryCrmRepository } from "../persistence/in-memory-crm.repository";
import { InMemoryCustomerRepository } from "../persistence/in-memory-customer.repository";
import { InMemoryLeadRepository } from "../persistence/in-memory-lead.repository";
import { InMemoryOpportunityRepository } from "../persistence/in-memory-opportunity.repository";
import { InMemoryPipelineRepository } from "../persistence/in-memory-pipeline.repository";
import { InMemorySupplierRepository } from "../persistence/in-memory-supplier.repository";
import { DefaultJourneyAnalyzer } from "../services/default-journey-analyzer";
import { DefaultLeadScoringEngine } from "../services/default-lead-scoring-engine";
import { DefaultRecommendationEngine } from "../services/default-recommendation-engine";
import { DefaultRelationshipAnalyzer } from "../services/default-relationship-analyzer";
import { DefaultRelationshipScoreEngine } from "../services/default-relationship-score-engine";

export type CreateExecutiveCrmOptions = {
  dependencies?: Partial<ExecutiveCrmDependencies>;
};

export function createExecutiveCrm(
  options: CreateExecutiveCrmOptions = {},
): ExecutiveCrmService {
  const dependencies: ExecutiveCrmDependencies = {
    crmRepository: options.dependencies?.crmRepository ?? new InMemoryCrmRepository(),
    leadRepository: options.dependencies?.leadRepository ?? new InMemoryLeadRepository(),
    customerRepository:
      options.dependencies?.customerRepository ?? new InMemoryCustomerRepository(),
    supplierRepository:
      options.dependencies?.supplierRepository ?? new InMemorySupplierRepository(),
    opportunityRepository:
      options.dependencies?.opportunityRepository ?? new InMemoryOpportunityRepository(),
    pipelineRepository:
      options.dependencies?.pipelineRepository ?? new InMemoryPipelineRepository(),
    relationshipAnalyzer:
      options.dependencies?.relationshipAnalyzer ?? new DefaultRelationshipAnalyzer(),
    journeyAnalyzer: options.dependencies?.journeyAnalyzer ?? new DefaultJourneyAnalyzer(),
    leadScoringEngine:
      options.dependencies?.leadScoringEngine ?? new DefaultLeadScoringEngine(),
    relationshipScoreEngine:
      options.dependencies?.relationshipScoreEngine ?? new DefaultRelationshipScoreEngine(),
    recommendationEngine:
      options.dependencies?.recommendationEngine ?? new DefaultRecommendationEngine(),
    eventDispatcher: options.dependencies?.eventDispatcher ?? new InMemoryEventBus(),
    businessCommunication:
      options.dependencies?.businessCommunication ?? new NoopBusinessCommunicationAdapter(),
    businessAutomation:
      options.dependencies?.businessAutomation ?? new NoopBusinessAutomationAdapter(),
    executiveOrchestrator:
      options.dependencies?.executiveOrchestrator ?? new NoopExecutiveOrchestratorAdapter(),
    executiveCeo: options.dependencies?.executiveCeo ?? new NoopExecutiveCEOAdapter(),
    companyBrain: options.dependencies?.companyBrain ?? new NoopCompanyBrainAdapter(),
    organizationBrain:
      options.dependencies?.organizationBrain ?? new NoopOrganizationBrainAdapter(),
    executiveMarketing:
      options.dependencies?.executiveMarketing ?? new NoopExecutiveMarketingAdapter(),
    executiveSales: options.dependencies?.executiveSales ?? new NoopExecutiveSalesAdapter(),
    executiveFinance:
      options.dependencies?.executiveFinance ?? new NoopExecutiveFinanceAdapter(),
  };

  return new ExecutiveCrmService(dependencies);
}
