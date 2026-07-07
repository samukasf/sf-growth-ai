import type { DiscoveryFinding, DiscoverySession, DiscoverySource } from "../entities";
import type { DiscoverySourceType } from "../../shared";
import type { DiscoverySourceProvider } from "./discovery-source-provider.port";

export type CoordinateDiscoveryInput = {
  session: DiscoverySession;
  sourceTypes: DiscoverySourceType[];
  context: Record<string, unknown>;
  providers: DiscoverySourceProvider[];
};

export type CoordinateDiscoveryResult = {
  sources: DiscoverySource[];
  findings: DiscoveryFinding[];
  session: DiscoverySession;
};

export interface DiscoveryCoordinator {
  coordinate(input: CoordinateDiscoveryInput): Promise<CoordinateDiscoveryResult>;
}
