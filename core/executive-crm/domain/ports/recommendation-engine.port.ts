import type { RecommendedAction, RelationshipProfile } from "../entities";

export type NextBestAction = RecommendedAction & {
  confidence: number;
};

export interface RecommendationEngine {
  recommend(profile: RelationshipProfile): NextBestAction[];
  nextBestAction(profile: RelationshipProfile): NextBestAction | null;
}
