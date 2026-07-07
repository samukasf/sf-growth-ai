import type { DiscoveryFinding, DiscoverySession } from "../entities";
import type { DiscoverySourceType } from "../../shared";

export type SourceCollectionInput = {
  session: DiscoverySession;
  sourceType: DiscoverySourceType;
  context: Record<string, unknown>;
};

export type SourceCollectionResult = {
  findings: DiscoveryFinding[];
  itemsCollected: number;
  confidence: number;
  metadata: Record<string, unknown>;
};

export interface DiscoverySourceProvider {
  readonly sourceType: DiscoverySourceType;
  readonly label: string;
  isAvailable(context: Record<string, unknown>): boolean;
  collect(input: SourceCollectionInput): Promise<SourceCollectionResult>;
}
