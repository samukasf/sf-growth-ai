import { BusinessContext, type BusinessContextResolver } from "../../domain";

export class DefaultBusinessContextResolver implements BusinessContextResolver {
  resolve(contextId: string, contexts: BusinessContext[]) {
    const context = contexts.find((c) => c.id === contextId);
    if (!context) return null;
    return {
      context,
      platformId: context.platformId,
      capabilityId: context.capabilityId,
    };
  }

  build(input: {
    organizationId: string;
    name: string;
    actorId: string;
    actorType: "user" | "system" | "agent";
    platformId?: string;
    capabilityId?: string;
    metadata?: Record<string, string>;
  }) {
    return BusinessContext.create({
      organizationId: input.organizationId,
      name: input.name,
      actorId: input.actorId,
      actorType: input.actorType,
      platformId: input.platformId,
      capabilityId: input.capabilityId,
      metadata: input.metadata ?? {},
    });
  }
}
