import type { BusinessCapability, CapabilityResolver } from "../../domain";

export class DefaultCapabilityResolver implements CapabilityResolver {
  resolve(capabilityId: string, capabilities: BusinessCapability[]) {
    const capability = capabilities.find((c) => c.id === capabilityId);
    if (!capability) return null;
    return {
      capability,
      available: capability.active,
      reason: capability.active ? "Capability available" : "Capability inactive",
    };
  }

  resolveBySlug(slug: string, capabilities: BusinessCapability[]) {
    const capability = capabilities.find((c) => c.slug === slug);
    if (!capability) return null;
    return {
      capability,
      available: capability.active,
      reason: capability.active ? "Capability available" : "Capability inactive",
    };
  }

  resolveByDomain(domain: string, capabilities: BusinessCapability[]) {
    return capabilities.filter((c) => c.domain === domain && c.active);
  }
}
