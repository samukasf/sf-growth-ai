export type { CRMRepository } from "./crm-repository.port";
export type { LeadRepository } from "./lead-repository.port";
export type { CustomerRepository } from "./customer-repository.port";
export type { SupplierRepository } from "./supplier-repository.port";
export type { OpportunityRepository } from "./opportunity-repository.port";
export type { PipelineRepository } from "./pipeline-repository.port";
export type {
  RelationshipAnalyzer,
  RelationshipAnalysis,
  EntityForAnalysis,
} from "./relationship-analyzer.port";
export type { JourneyAnalyzer, JourneyAnalysis } from "./journey-analyzer.port";
export type { LeadScoringEngine } from "./lead-scoring-engine.port";
export type { RelationshipScoreEngine } from "./relationship-score-engine.port";
export type { RecommendationEngine, NextBestAction } from "./recommendation-engine.port";
