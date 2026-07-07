import type { EventDispatcher } from "../shared";
import type {
  CRMRepository,
  CustomerRepository,
  JourneyAnalyzer,
  LeadRepository,
  LeadScoringEngine,
  OpportunityRepository,
  PipelineRepository,
  RecommendationEngine,
  RelationshipAnalyzer,
  RelationshipScoreEngine,
  SupplierRepository,
} from "../domain";
import type {
  BusinessAutomationPort,
  BusinessCommunicationPort,
  CompanyBrainPort,
  ExecutiveCEOPort,
  ExecutiveFinancePort,
  ExecutiveMarketingPort,
  ExecutiveOrchestratorPort,
  ExecutiveSalesPort,
  OrganizationBrainPort,
} from "./ports/integration";

export type ExecutiveCrmDependencies = {
  crmRepository: CRMRepository;
  leadRepository: LeadRepository;
  customerRepository: CustomerRepository;
  supplierRepository: SupplierRepository;
  opportunityRepository: OpportunityRepository;
  pipelineRepository: PipelineRepository;
  relationshipAnalyzer: RelationshipAnalyzer;
  journeyAnalyzer: JourneyAnalyzer;
  leadScoringEngine: LeadScoringEngine;
  relationshipScoreEngine: RelationshipScoreEngine;
  recommendationEngine: RecommendationEngine;
  eventDispatcher: EventDispatcher;
  businessCommunication: BusinessCommunicationPort;
  businessAutomation: BusinessAutomationPort;
  executiveOrchestrator: ExecutiveOrchestratorPort;
  executiveCeo: ExecutiveCEOPort;
  companyBrain: CompanyBrainPort;
  organizationBrain: OrganizationBrainPort;
  executiveMarketing: ExecutiveMarketingPort;
  executiveSales: ExecutiveSalesPort;
  executiveFinance: ExecutiveFinancePort;
};
