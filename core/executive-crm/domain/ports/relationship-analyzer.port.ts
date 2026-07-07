import type { Customer, Lead, RelationshipProfile, Supplier } from "../entities";

export type RelationshipAnalysis = {
  entityId: string;
  entityType: string;
  healthLabel: "critical" | "at_risk" | "stable" | "healthy" | "excellent";
  timeline: Array<{ date: string; event: string; type: string }>;
  insights: string[];
};

export interface RelationshipAnalyzer {
  analyze(
    profile: RelationshipProfile,
    interactions: Array<{ type: string; date: string; summary: string }>,
  ): RelationshipAnalysis;
  buildTimeline(
    profile: RelationshipProfile,
  ): Array<{ date: string; event: string; type: string }>;
}

export type EntityForAnalysis = Lead | Customer | Supplier;
