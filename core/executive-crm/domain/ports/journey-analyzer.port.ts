import type { CustomerJourney } from "../entities";

export type JourneyAnalysis = {
  customerId: string;
  currentStage: string;
  healthScore: number;
  completedMilestones: number;
  totalMilestones: number;
  nextBestAction: string;
  stageProgress: number;
};

export interface JourneyAnalyzer {
  analyze(journey: CustomerJourney): JourneyAnalysis;
  suggestNextStage(journey: CustomerJourney): string;
}
