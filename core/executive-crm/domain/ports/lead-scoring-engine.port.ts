import type { Lead } from "../entities";
import type { LeadScore } from "../../shared";

export interface LeadScoringEngine {
  score(lead: Lead): LeadScore;
  isQualified(score: LeadScore): boolean;
}
