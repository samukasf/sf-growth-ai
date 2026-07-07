import type { BusinessContext } from "../entities";

export type ContextResolution = {
  context: BusinessContext;
  platformId?: string;
  capabilityId?: string;
};

export interface BusinessContextResolver {
  resolve(contextId: string, contexts: BusinessContext[]): ContextResolution | null;
  build(input: {
    organizationId: string;
    name: string;
    actorId: string;
    actorType: "user" | "system" | "agent";
    platformId?: string;
    capabilityId?: string;
    metadata?: Record<string, string>;
  }): BusinessContext;
}
