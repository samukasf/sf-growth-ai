import type { RelationshipProfile } from "../entities";
import type { RelationshipScores } from "../../shared";

export interface RelationshipScoreEngine {
  compute(profile: RelationshipProfile): RelationshipScores;
  computeHealthScore(satisfaction: number, risk: number): number;
}
