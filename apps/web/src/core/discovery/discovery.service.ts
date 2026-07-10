import { runDiscoveryPipeline } from "./discovery.pipeline";
import type { DiscoveryInput, DiscoveryResult } from "./discovery.types";

export class DiscoveryService {
  run(input: DiscoveryInput): Promise<DiscoveryResult> {
    return runDiscoveryPipeline(input);
  }
}

let defaultService: DiscoveryService | null = null;

export function getDiscoveryService(): DiscoveryService {
  if (!defaultService) {
    defaultService = new DiscoveryService();
  }
  return defaultService;
}

export async function runDiscovery(input: DiscoveryInput): Promise<DiscoveryResult> {
  return getDiscoveryService().run(input);
}
